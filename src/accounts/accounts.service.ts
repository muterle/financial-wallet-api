import { Injectable } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { AccountsRepository } from './accounts.repository';
import { EntityManager } from 'typeorm';

@Injectable()
export class AccountsService {
  constructor(private readonly accountsRepository: AccountsRepository) {}

  async getNextAccountNumber(): Promise<string> {
    const lastAccountNumber =
      await this.accountsRepository.getLastAccountNumber();

    if (lastAccountNumber) {
      const nextAccountNumber = Number(lastAccountNumber) + 1;

      return nextAccountNumber.toString().padStart(7, '0');
    }

    return '0000001';
  }

  async create(createAccountDto: CreateAccountDto) {
    createAccountDto.accountNumber = await this.getNextAccountNumber();

    return await this.accountsRepository.createAccount(createAccountDto);
  }

  async findByUserId(userId: number) {
    return await this.accountsRepository.findByUserId(userId);
  }

  async getBalanceByUserId(userId: number) {
    const user = await this.findByUserId(userId);

    return user.balance;
  }

  async updateBalance(
    userId: number,
    balance: number,
    entityManager: EntityManager = null,
  ) {
    return await this.accountsRepository.updateBalance(
      userId,
      balance,
      entityManager,
    );
  }
}
