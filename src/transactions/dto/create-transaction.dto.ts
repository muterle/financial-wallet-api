import { ApiProperty } from '@nestjs/swagger';
import { UserOwnerDto } from './user-owner.dto';
import { UserPayeeDto } from './user-payee.dto';

export class CreateTransactionDto {
  @ApiProperty({
    type: UserOwnerDto,
    description: 'User owner of the transaction',
  })
  userOwner: UserOwnerDto;

  @ApiProperty({
    type: UserPayeeDto,
    description: 'User payee of the transaction',
  })
  userPayee: UserPayeeDto;

  @ApiProperty({
    description: 'Type of the transaction',
    enum: ['deposit', 'withdraw', 'transfer'],
  })
  type: string;

  @ApiProperty({
    type: Number,
    description: 'Amount of the transaction',
    minimum: 1,
  })
  amount: number;

  observation: string;
}
