import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'accounts' })
@Index(['user'])
@Index(['accountNumber'])
export class Account {
  @ApiProperty({
    type: Number,
    description: 'Account ID',
  })
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @OneToOne(() => User, (user) => user.account, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({
    type: String,
    description: 'Account number',
  })
  @Column({
    type: 'varchar',
    length: 7,
    default: true,
    unique: true,
    name: 'account_number',
  })
  accountNumber: string;

  @ApiProperty({
    type: Number,
    description: 'Account balance',
  })
  @Column({ type: 'decimal', default: 0, precision: 14, scale: 2 })
  balance: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp' })
  deletedAt: Date;
}
