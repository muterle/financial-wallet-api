import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { TransactionStatus, TransactionType } from 'src/shared/enums';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'transactions' })
@Index(['userOwner'])
@Index(['userPayee'])
@Index(['type'])
@Index(['status'])
export class Transaction {
  @ApiProperty({
    type: Number,
    description: 'Transaction ID',
  })
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ApiProperty({
    type: Object,
    description: 'User owner of the transaction',
  })
  @ManyToOne(() => User, (user) => user.transactions, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_owner_id' })
  userOwner: User;

  @ApiProperty({
    type: Object,
    description: 'User payee of the transaction',
  })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_payee_id', referencedColumnName: 'id' })
  userPayee: User;

  @ApiProperty({
    description: 'Type of the transaction',
    enum: ['deposit', 'withdraw', 'transfer'],
  })
  @Column({
    type: 'enum',
    enum: TransactionType,
    default: TransactionType.DEPOSIT,
  })
  type: string;

  @ApiProperty({
    description: 'Status of the transaction',
    enum: ['pending', 'finished', 'cancelled', 'invalid'],
  })
  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: string;

  @ApiProperty({
    type: Number,
    description: 'Amount of the transaction',
    minimum: 1,
  })
  @Column({ type: 'decimal', default: 0, precision: 14, scale: 2 })
  amount: number;

  @ApiProperty({
    type: String,
    description: 'Observation of the transaction',
  })
  @Column({ type: 'varchar', length: 150, nullable: true })
  observation: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp' })
  deletedAt: Date;
}
