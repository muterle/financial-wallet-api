import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, Min } from 'class-validator';

export class CreateAccountDto {
  @IsNotEmpty({
    message: 'User ID is required',
  })
  @ApiProperty({
    type: Number,
    description: 'The user ID is required',
  })
  userId: number;

  @IsOptional()
  accountNumber?: string;

  @Min(0)
  @ApiProperty({
    type: Number,
    description: 'The balance is wont to be greater than 0',
  })
  balance: number;
}
