import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './configs/typeorm.config';
import { UsersModule } from './users/users.module';
import { AccountsModule } from './accounts/accounts.module';
import { AuthModule } from './auth/auth.module';
import { TransactionsModule } from './transactions/transactions.module';
import { LoggerModule } from 'nestjs-pino';
import { CustomLogger } from './shared/logger/custom.logger';

@Module({
  imports: [
    LoggerModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    UsersModule,
    AccountsModule,
    AuthModule,
    TransactionsModule,
  ],
  controllers: [],
  providers: [CustomLogger],
  exports: [CustomLogger],
})
export class AppModule {}
