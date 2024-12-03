import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-strategy/jwt-strategy.guard';
import { UserLoggedInDto } from './dto/user-logged-in.dto';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: `Create a new user and your account with balance equal 0.`,
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    type: User,
  })
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Searches for user data using their logged-in user id',
  })
  @ApiResponse({
    status: 200,
    type: User,
  })
  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  async findOne(@Req() req: Request) {
    const user = req.user as UserLoggedInDto;

    return await this.usersService.findOne(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Changes user data using their logged-in user id' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 201,
    type: User,
  })
  @Patch()
  @UseInterceptors(ClassSerializerInterceptor)
  async update(@Req() req: Request, @Body() updateUserDto: UpdateUserDto) {
    const user = req.user as UserLoggedInDto;

    return await this.usersService.update(user.id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Logically removes the user using their logged-in user id',
  })
  @ApiResponse({
    status: 200,
    type: Boolean,
  })
  @Delete()
  async remove(@Req() req: Request) {
    const user = req.user as UserLoggedInDto;

    return await this.usersService.remove(user.id);
  }
}
