import { ApiProperty } from '@nestjs/swagger';

export class UserOwnerDto {
  @ApiProperty({
    type: Number,
    description: 'User Owner id',
  })
  id: number;
}
