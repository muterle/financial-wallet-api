import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { TransactionRepository } from './transactions.repository';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionStatus, TransactionType } from 'src/shared/enums';
import { UsersService } from 'src/users/users.service';
import { returnException } from 'src/shared/utils/httpException';
import { AccountsService } from 'src/accounts/accounts.service';
import { DataSource } from 'typeorm';
import { Account } from 'src/accounts/entities/account.entity';
import { Transaction } from './entities/transaction.entity';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly usersService: UsersService,
    private readonly accountsService: AccountsService,
    private readonly dataSource: DataSource,
  ) {}

  async create(createTransactionDto: CreateTransactionDto) {
    this.logger.log(`Create a transaction ${createTransactionDto.type}`);

    if (
      createTransactionDto.type === TransactionType.TRANSFER &&
      Number(createTransactionDto.userOwner.id) ===
        Number(createTransactionDto.userPayee.id)
    ) {
      returnException(
        this.logger,
        { message: 'You cannot transfer to yourself' },
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    const transaction =
      await this.transactionRepository.createTransaction(createTransactionDto);

    if (!transaction) {
      returnException(
        this.logger,
        {
          message: `The requested transaction (${createTransactionDto.type}) could not be created`,
        },
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    this.logger.log(
      `Create a transaction ${createTransactionDto.type} finished`,
    );

    this.processPendingTransactions(createTransactionDto.userOwner.id);

    return transaction;
  }

  async findByUserId(userId: number) {
    return await this.transactionRepository.findByUserId(userId);
  }

  async finishDepositOrWithdrawData(
    transactionId: number,
    userOwnerId: number,
    amount: number,
    status: TransactionStatus,
  ) {
    await this.dataSource.transaction(async (manager) => {
      await manager
        .getRepository(Account)
        .update({ user: { id: userOwnerId } }, { balance: amount });

      await manager
        .getRepository(Transaction)
        .update({ id: transactionId }, { status: status });
    });
  }

  async finishTransferData(
    transactionId: number,
    userOwnerId: number,
    newAmountOwner: number,
    userPayeeId: number,
    newAmountPayee: number,
    status: TransactionStatus,
  ) {
    await this.dataSource.transaction(async (manager) => {
      await this.accountsService.updateBalance(
        userOwnerId,
        newAmountOwner,
        manager,
      );

      await this.accountsService.updateBalance(
        userPayeeId,
        newAmountPayee,
        manager,
      );

      await manager
        .getRepository(Transaction)
        .update({ id: transactionId }, { status: status });
    });
  }

  async processPendingTransactions(userId: number) {
    const errors = [];

    const user = await this.usersService.findOne(userId);

    if (!user.account) {
      errors.push(`User ${user.id} has no account`);

      returnException(
        this.logger,
        { message: `User ${user.id} has no account` },
        HttpStatus.NOT_FOUND,
      );
    }

    const pendingTransactions = await this.transactionRepository.findByUserId(
      user.id,
      TransactionStatus.PENDING,
    );

    for (const transaction of pendingTransactions) {
      const balance = await this.accountsService.getBalanceByUserId(user.id);

      switch (transaction.type) {
        case TransactionType.DEPOSIT:
          await this.finishDepositOrWithdrawData(
            transaction.id,
            user.id,
            Number(balance) + Number(transaction.amount),
            TransactionStatus.FINISHED,
          );

          break;
        case TransactionType.WITHDRAW:
          if (Number(balance) < Number(transaction.amount)) {
            await this.transactionRepository.updateTransactionStatus(
              transaction.id,
              TransactionStatus.INVALID,
              'Insufficient balance',
            );

            returnException(
              this.logger,
              { message: 'Insufficient balance' },
              HttpStatus.NOT_ACCEPTABLE,
            );
          }

          await this.finishDepositOrWithdrawData(
            transaction.id,
            user.id,
            Number(balance) - Number(transaction.amount),
            TransactionStatus.FINISHED,
          );
          break;
        case TransactionType.TRANSFER:
          if (Number(balance) < Number(transaction.amount)) {
            await this.transactionRepository.updateTransactionStatus(
              transaction.id,
              TransactionStatus.INVALID,
              'Insufficient balance',
            );

            returnException(
              this.logger,
              { message: 'Insufficient balance' },
              HttpStatus.NOT_ACCEPTABLE,
            );
          }

          const receiver = await this.usersService.findOne(
            transaction.userPayee.id,
          );

          if (!receiver) {
            await this.transactionRepository.updateTransactionStatus(
              transaction.id,
              TransactionStatus.INVALID,
              `Receiver ${transaction.userPayee.id} not found`,
            );

            returnException(
              this.logger,
              { message: `Receiver ${transaction.userPayee.id} not found` },
              HttpStatus.NOT_ACCEPTABLE,
            );
          }

          await this.finishTransferData(
            transaction.id,
            user.id,
            Number(balance) - Number(transaction.amount),
            receiver.id,
            Number(receiver.account.balance) + Number(transaction.amount),
            TransactionStatus.FINISHED,
          );

          break;
        default:
          break;
      }
    }
  }

  async cancelTransaction(id: number, userId: number) {
    const transaction = await this.transactionRepository.findByIdAndUser(
      id,
      userId,
    );

    if (!transaction) {
      returnException(
        this.logger,
        { message: `Transaction ${id} with user ${userId} not found` },
        HttpStatus.NOT_FOUND,
      );
    }

    if (transaction.status === TransactionStatus.PENDING) {
      await this.transactionRepository.updateTransactionStatus(
        id,
        TransactionStatus.CANCELLED,
        'Cancelled by user',
      );
    }

    if (transaction.status === TransactionStatus.FINISHED) {
      if (
        transaction.type === TransactionType.DEPOSIT ||
        transaction.type === TransactionType.WITHDRAW
      ) {
        const user = await this.usersService.findOne(transaction.userOwner.id);

        if (user && user.account) {
          if (
            transaction.type === TransactionType.DEPOSIT &&
            Number(user.account.balance) < Number(transaction.amount)
          ) {
            await this.transactionRepository.updateTransactionStatus(
              transaction.id,
              TransactionStatus.INVALID,
              'Insufficient balance',
            );

            returnException(
              this.logger,
              { message: 'Insufficient balance' },
              HttpStatus.NOT_ACCEPTABLE,
            );
          }
          const amount =
            transaction.type === TransactionType.DEPOSIT
              ? Number(user.account.balance) - Number(transaction.amount)
              : Number(user.account.balance) + Number(transaction.amount);

          await this.finishDepositOrWithdrawData(
            id,
            user.id,
            amount,
            TransactionStatus.CANCELLED,
          );
        } else {
          await this.transactionRepository.updateTransactionStatus(
            transaction.id,
            TransactionStatus.INVALID,
            `User ${user.id} has no account`,
          );

          returnException(
            this.logger,
            { message: `User ${user.id} has no account` },
            HttpStatus.NOT_FOUND,
          );
        }
      } else {
        const user = await this.usersService.findOne(transaction.userOwner.id);

        if (user && user.account) {
          const receiver = await this.usersService.findOne(
            transaction.userPayee.id,
          );

          if (receiver && receiver.account) {
            if (Number(receiver.account.balance) < Number(transaction.amount)) {
              await this.transactionRepository.updateTransactionStatus(
                transaction.id,
                TransactionStatus.INVALID,
                `Insufficient balance`,
              );

              returnException(
                this.logger,
                { message: 'Insufficient balance' },
                HttpStatus.NOT_ACCEPTABLE,
              );
            } else {
              await this.finishTransferData(
                id,
                user.id,
                Number(user.account.balance) + Number(transaction.amount),
                receiver.id,
                Number(receiver.account.balance) - Number(transaction.amount),
                TransactionStatus.CANCELLED,
              );
            }
          } else {
            await this.transactionRepository.updateTransactionStatus(
              transaction.id,
              TransactionStatus.INVALID,
              `Receiver ${transaction.userPayee.id} not found`,
            );

            returnException(
              this.logger,
              { message: `Receiver ${transaction.userPayee.id} not found` },
              HttpStatus.NOT_FOUND,
            );
          }
        } else {
          await this.transactionRepository.updateTransactionStatus(
            transaction.id,
            TransactionStatus.INVALID,
            `User ${user.id} has no account`,
          );

          returnException(
            this.logger,
            { message: `User ${user.id} has no account` },
            HttpStatus.NOT_FOUND,
          );
        }
      }
    }

    return true;
  }
}
