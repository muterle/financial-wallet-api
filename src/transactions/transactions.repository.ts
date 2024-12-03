import { Injectable, Logger } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { returnException } from 'src/shared/utils/httpException';
import { Transaction } from './entities/transaction.entity';
import { TransactionStatus } from 'src/shared/enums';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionRepository extends Repository<Transaction> {
  private readonly logger = new Logger(TransactionRepository.name);

  constructor(private dataSource: DataSource) {
    super(Transaction, dataSource.createEntityManager());
  }

  async createTransaction(
    TransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    try {
      return await this.save(TransactionDto);
    } catch (error) {
      returnException(this.logger, error);
    }
  }

  async findById(id: number): Promise<Transaction> {
    try {
      return await this.findOne({
        where: { id },
      });
    } catch (error) {
      returnException(this.logger, error);
    }
  }

  async findByIdAndUser(id: number, userId: number): Promise<Transaction> {
    try {
      return await this.findOne({
        where: { id, userOwner: { id: userId } },
        relations: ['userOwner', 'userPayee'],
      });
    } catch (error) {
      returnException(this.logger, error);
    }
  }

  async findByUserId(
    userId: number,
    status: TransactionStatus = null,
  ): Promise<Transaction[]> {
    try {
      let where = {};
      where = { userOwner: { id: userId } };

      if (status) {
        where = { ...where, status: status };
      }

      return await this.find({
        where,
        relations: ['userOwner', 'userPayee'],
      });
    } catch (error) {
      returnException(this.logger, error);
    }
  }

  async updateTransactionStatus(
    id: number,
    status: TransactionStatus,
    observation: string = null,
  ): Promise<void> {
    try {
      await this.update({ id }, { status, observation });
    } catch (error) {
      returnException(this.logger, error);
    }
  }
}
