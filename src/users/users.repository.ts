import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

import * as bcrypt from 'bcrypt';
import { passwordSalt } from 'src/shared/constants';
import { QueryParametersDefault } from 'src/shared/dtos';
import { SortOrder } from 'src/shared/enums';
import { UpdateUserDto } from './dto/update-user.dto';
import { returnException } from 'src/shared/utils/httpException';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class UsersRepository extends Repository<User> {
  private readonly logger = new Logger(UsersRepository.name);

  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      const userCreated = await this.save({
        ...createUserDto,
        password: bcrypt.hashSync(createUserDto.password, passwordSalt),
      });

      return userCreated;
    } catch (error) {
      returnException(this.logger, error);
    }
  }

  async findAll(
    query: QueryParametersDefault,
  ): Promise<{ total: number; users: User[] }> {
    try {
      let { page, take, sort } = query;
      if (!page) page = 1;
      if (!take) take = 20;
      if (!sort) sort = SortOrder.ASC;

      const [users, total] = await this.findAndCount({
        skip: (page - 1) * take,
        take: take,
        order: { name: sort },
        relations: ['account'],
      });

      return { total, users };
    } catch (error) {
      returnException(this.logger, error);
    }
  }

  async findAllActives(): Promise<User[]> {
    try {
      const users = await this.find({
        where: { isActive: true },
        relations: ['account'],
      });

      return users;
    } catch (error) {
      returnException(this.logger, error);
    }
  }

  async findById(id: number): Promise<User> {
    try {
      return await this.findOne({ where: { id }, relations: ['account'] });
    } catch (error) {
      returnException(this.logger, error);
    }
  }

  async findByEmail(email: string): Promise<User> {
    try {
      return await this.findOne({ where: { email } });
    } catch (error) {
      returnException(this.logger, error);
    }
  }

  async updateUser(id: number, userUpdateDto: UpdateUserDto): Promise<User> {
    try {
      await this.update({ id }, { ...userUpdateDto });

      return await this.findById(id);
    } catch (error) {
      returnException(this.logger, error);
    }
  }

  async deleteUser(id: number): Promise<void> {
    try {
      await this.update({ id }, { isActive: false, deletedAt: new Date() });
    } catch (error) {
      returnException(this.logger, error);
    }
  }
}
