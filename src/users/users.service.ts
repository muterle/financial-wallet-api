import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';
import { User } from './entities/user.entity';
import { QueryParametersDefault } from 'src/shared/dtos';
import { returnException } from 'src/shared/utils/httpException';
import { AccountsService } from 'src/accounts/accounts.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly accountsService: AccountsService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const userCreated = await this.usersRepository.createUser(createUserDto);

    const accountCreated = await this.accountsService.create({
      userId: userCreated.id,
      balance: 0,
    });

    userCreated.account = accountCreated;

    return userCreated;
  }

  async findAll(
    query: QueryParametersDefault,
  ): Promise<{ total: number; users: User[] }> {
    return await this.usersRepository.findAll(query);
  }

  async findAllActives(): Promise<User[]> {
    return await this.usersRepository.findAllActives();
  }

  async findOne(id: number) {
    return await this.usersRepository.findById(id);
  }

  async findByEmail(email: string) {
    return await this.usersRepository.findByEmail(email);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const userExists = await this.usersRepository.findById(id);

    if (!userExists) {
      returnException(
        this.logger,
        { message: `User ${id} not found` },
        HttpStatus.NOT_FOUND,
      );
    }

    return await this.usersRepository.updateUser(id, updateUserDto);
  }

  async remove(id: number) {
    const userExists = await this.usersRepository.findById(id);

    if (!userExists) {
      returnException(
        this.logger,
        { message: `User ${id} not found` },
        HttpStatus.NOT_FOUND,
      );
    }

    await this.usersRepository.deleteUser(id);

    return true;
  }
}
