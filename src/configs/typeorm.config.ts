import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: '.env' });

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host:
    process.env.NODE_ENV === 'development'
      ? process.env.DATABASE_HOST_DEV
      : process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  //database: process.env.DATABASE_NAME,
  synchronize: true,
  schema: process.env.DATABASE_SCHEMA,
  autoLoadEntities: true,
  ssl: false,
  cache: true,
};
