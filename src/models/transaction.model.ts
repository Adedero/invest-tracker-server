import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  Index,
  BeforeInsert,
  BeforeUpdate
} from 'typeorm'
import { User } from './user.model'
import { v4 as uuidv4 } from 'uuid'

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  INVESTMENT = 'investment',
  PROFIT = 'profit'
}

export enum TransactionStatus {
  SUCCESSFUL = 'successful',
  PENDING = 'pending',
  FAILED = 'failed'
}

@Entity()
export class Transaction {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string = uuidv4()

  @Index()
  @Column({ type: 'varchar', length: 36 })
  userId!: string

  @Column({ type: 'varchar', length: 36, nullable: true })
  investmentId!: string

  @Column('float')
  amountInUSD!: number

  @Column('float')
  charge!: number

  @Column('float')
  actualAmountInUSD!: number

  @Column('float')
  rate!: number

  @Index()
  @Column({ type: 'varchar', length: 20 })
  transactionType!: TransactionType

  @Index()
  @Column({ type: 'varchar', length: 20 })
  status!: TransactionStatus

  @Column('text', { nullable: true })
  failureReason!: string

  @Column()
  currency!: string

  @Column('float')
  amountInCurrency!: number

  @Column('boolean')
  isWireTransfer!: boolean

  @Column('text', { nullable: true })
  wireTransferEmail!: string

  @Column({ nullable: true })
  depositWalletAddress!: string

  @Column({ nullable: true })
  depositWalletNetwork!: string

  @Column({ nullable: true })
  withdrawalWalletAddress!: string

  @Column({ nullable: true })
  withdrawalWalletNetwork!: string

  @Column('timestamp', { nullable: true })
  approvedAt!: Date

  @Column('text', { nullable: true })
  description!: string

  @Column('timestamp')
  createdAt!: Date

  @Column('timestamp')
  updatedAt!: Date

  @ManyToOne(() => User, (user) => user.transactions)
  user!: User

  @BeforeInsert()
  setCreationDates() {
    const now = new Date()
    this.createdAt = now
    this.updatedAt = now
  }

  @BeforeUpdate()
  updateTimestamp() {
    this.updatedAt = new Date()
  }
}

/* // transaction.model.ts
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  Index
} from 'typeorm'
import { User } from './user.model'

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  INVESTMENT = 'investment',
  PROFIT = 'profit'
}

export enum TransactionStatus {
  SUCCESSFUL = 'successful',
  PENDING = 'pending',
  FAILED = 'failed'
}

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Index()
  @Column('uuid')
  userId!: string

  @Column('uuid', { nullable: true })
  investmentId!: string

  @Column('float')
  amountInUSD!: number

  @Column('float')
  charge!: number

  @Column('float')
  actualAmountInUSD!: number

  @Column('float')
  rate!: number

  @Index()
  @Column({ type: 'enum', enum: TransactionType })
  transactionType!: TransactionType

  @Index()
  @Column({ type: 'enum', enum: TransactionStatus })
  status!: TransactionStatus

  @Column('text', { nullable: true })
  failureReason!: string

  @Column()
  currency!: string

  @Column('float')
  amountInCurrency!: number

  @Column('boolean')
  isWireTransfer!: boolean

  @Column('text', { nullable: true })
  wireTransferEmail!: string

  @Column({ nullable: true })
  depositWalletAddress!: string

  @Column({ nullable: true })
  depositWalletNetwork!: string

  @Column({ nullable: true })
  withdrawalWalletAddress!: string

  @Column({ nullable: true })
  withdrawalWalletNetwork!: string

  @Column('timestamptz', { nullable: true })
  approvedAt!: Date

  @Column({ type: 'text', nullable: true })
  description!: string

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  @ManyToOne(() => User, (user) => user.transactions)
  user!: User
}
 */
