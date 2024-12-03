import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Put,
  Param,
  UseGuards,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Request } from 'express';
import { UserLoggedInDto } from 'src/users/dto/user-logged-in.dto';
import { JwtAuthGuard } from 'src/auth/jwt-strategy/jwt-strategy.guard';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { Transaction } from './entities/transaction.entity';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly TransactionsService: TransactionsService) {}

  @ApiOperation({
    summary: `Create a new transaction for logged user.`,
  })
  @ApiBody({ type: CreateTransactionDto })
  @ApiResponse({
    status: 201,
    type: Transaction,
  })
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Req() req: Request,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    const user = req.user as UserLoggedInDto;

    createTransactionDto.userOwner = { id: user.id };
    return await this.TransactionsService.create(createTransactionDto);
  }

  @ApiOperation({
    summary: `List transaction for logged user.`,
  })
  @ApiResponse({
    status: 200,
    type: Array<Transaction>,
  })
  @UseGuards(JwtAuthGuard)
  @Get()
  async findByUserId(@Req() req: Request) {
    const user = req.user as UserLoggedInDto;

    return await this.TransactionsService.findByUserId(user.id);
  }

  @ApiOperation({
    summary: `Cancel transaction for logged user.`,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Id of the transaction',
  })
  @ApiResponse({
    status: 200,
    type: Boolean,
  })
  @UseGuards(JwtAuthGuard)
  @Put('/cancel/:id')
  async cancelTransaction(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as UserLoggedInDto;

    return await this.TransactionsService.cancelTransaction(+id, user.id);
  }
}
