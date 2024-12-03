import { Injectable, Logger } from '@nestjs/common';
import { Account } from './entities/account.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CreateAccountDto } from './dto/create-account.dto';
import { returnException } from 'src/shared/utils/httpException';

@Injectable()
export class AccountsRepository extends Repository<Account> {
  private readonly logger = new Logger(AccountsRepository.name);

  constructor(private dataSource: DataSource) {
    super(Account, dataSource.createEntityManager());
  }

  async createAccount(accountCreateDto: CreateAccountDto): Promise<Account> {
    try {
      return await this.save({
        ...accountCreateDto,
        user: { id: accountCreateDto.userId },
      });
    } catch (error) {
      returnException(this.logger, error);
    }
  }

  async findByUserId(userId: number): Promise<Account> {
    try {
      return await this.findOne({
        where: { user: { id: userId } },
        relations: ['user'],
      });
    } catch (error) {
      returnException(this.logger, error);
    }
  }

  async updateBalance(
    userId: number,
    balance: number,
    entityManager: EntityManager = null,
  ): Promise<Account> {
    try {
      if (entityManager) {
        await entityManager
          .getRepository(Account)
          .update({ user: { id: userId } }, { balance });
      } else {
        await this.update({ user: { id: userId } }, { balance });
      }

      return await this.findByUserId(userId);
    } catch (error) {
      returnException(this.logger, error);
    }
  }

  async getLastAccountNumber() {
    try {
      const lastAccount = await this.find({
        order: { accountNumber: 'DESC' },
        take: 1,
      });

      if (lastAccount.length > 0) {
        return lastAccount[0].accountNumber;
      } else {
        return null;
      }
    } catch (error) {
      returnException(this.logger, error);
    }
  }
}
