import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    type: String,
    description: 'The email used for login',
  })
  username: string;

  @ApiProperty({
    type: String,
    description: 'The password used for login',
  })
  password: string;
}
