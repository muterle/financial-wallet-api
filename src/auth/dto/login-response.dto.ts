import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    type: String,
    description: 'Token for making requests',
  })
  access_token: string;
}
