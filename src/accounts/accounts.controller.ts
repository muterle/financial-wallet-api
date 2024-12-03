import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { Account } from './entities/account.entity';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-strategy/jwt-strategy.guard';
import { UserLoggedInDto } from 'src/users/dto/user-logged-in.dto';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @ApiOperation({
    summary: `Get account by user ID.`,
  })
  @ApiOkResponse({
    description: 'Account by user.',
    type: Account,
  })
  @UseGuards(JwtAuthGuard)
  @Get('/by-user')
  async findByLoggedInUser(@Req() req: Request): Promise<Account> {
    const user = req.user as UserLoggedInDto;

    return await this.accountsService.findByUserId(user.id);
  }
}
