import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Account } from 'src/accounts/entities/account.entity';

import * as bcrypt from 'bcrypt';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'users' })
@Index(['documentNumber'])
export class User {
  @ApiProperty({
    type: Number,
    description: 'User ID',
  })
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ApiProperty({
    type: String,
    description: 'The name of the user',
  })
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ApiProperty({
    type: String,
    description: 'The document number of the user',
  })
  @Column({
    type: 'varchar',
    length: 20,
    unique: true,
    name: 'document_number',
  })
  documentNumber: string;

  @ApiProperty({
    type: String,
    description: 'The email of the user',
  })
  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @ApiProperty({
    type: String,
    description: 'The phone of the user',
  })
  @Column({ type: 'varchar', length: 14, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 100 })
  @Exclude({ toPlainOnly: true })
  password: string;

  @ApiProperty({
    type: Boolean,
    description: 'The status of the user',
  })
  @Column('boolean', { name: 'is_active', default: true })
  isActive: boolean;

  @ApiProperty({
    type: Object,
    description: 'The account of the user',
  })
  @OneToOne(() => Account, (account) => account.user, {
    cascade: true,
  })
  account: Account;

  @OneToMany(() => Transaction, (transaction) => transaction.userOwner, {
    cascade: true,
  })
  transactions: Transaction[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp' })
  deletedAt: Date;

  checkPassword(password: string) {
    return bcrypt.compareSync(password, this.password);
  }
}
