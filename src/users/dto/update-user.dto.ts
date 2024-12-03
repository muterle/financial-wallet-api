import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

@ApiSchema({
  name: 'UpdateUser',
})
export class UpdateUserDto {
  @IsNotEmpty({
    message: 'Name is required',
  })
  @MaxLength(100, {
    message: 'Name must be less than 100 characters',
  })
  @ApiProperty({
    type: String,
    description: 'The name is required and must be less than 100 characters',
  })
  name: string;

  @ApiProperty({
    type: String,
    description: 'The document number is required and must be CPF or CNPJ',
  })
  @IsNotEmpty({
    message: 'Document number is required',
  })
  documentNumber: string;

  @ApiProperty({
    type: String,
    description: 'The email is required and must be less than 100 characters',
  })
  @IsNotEmpty({
    message: 'Email is required',
  })
  @IsEmail(
    {},
    {
      message: 'Email is not valid',
    },
  )
  @MaxLength(100, {
    message: 'Email must be less than 100 characters',
  })
  email: string;

  @ApiProperty({
    type: String,
    description:
      'The phone is not required and must be less than 14 characters',
  })
  @MaxLength(14, {
    message: 'Phone must be less than 14 characters',
  })
  phone?: string;

  isActive: boolean;
}
