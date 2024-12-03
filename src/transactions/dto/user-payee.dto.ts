import { ApiProperty } from '@nestjs/swagger';

export class UserPayeeDto {
  @ApiProperty({
    type: Number,
    description: 'User Payee id',
  })
  id: number;
}
