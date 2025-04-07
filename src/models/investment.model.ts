import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  BeforeInsert,
  BeforeUpdate
} from 'typeorm'
import { User } from './user.model'
import { Profit } from './profit.model'
import { v4 as uuidv4 } from 'uuid'

export enum InvestmentStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  TERMINATED = 'terminated',
  PAUSED = 'paused'
}

@Entity()
export class Investment {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string = uuidv4()

  @Column({ type: 'varchar', length: 36 })
  userId!: string

  @Column('float')
  initialDeposit!: number

  @Column('float', { nullable: true })
  currentCompoundedAmount!: number

  @Column('boolean', { default: true })
  autocompounded!: boolean

  @Index()
  @Column({ type: 'varchar', length: 20, default: InvestmentStatus.OPEN })
  status!: InvestmentStatus

  @Column({ nullable: true})
  pausedReason!: string

  @Column('timestamp', { nullable: true })
  pausedAt!: Date

  @Column()
  investmentName!: string

  @Column()
  investmentTier!: string

  @Column('float')
  minimumDeposit!: number

  @Column('int')
  duration!: number

  @Column('float', { default: 0 })
  terminationFee!: number

  @Column('int', { default: 0 })
  daysCompleted!: number

  @Column('timestamp', { nullable: true })
  lastProfitDistributedAt!: Date

  @Column('float', { default: 0, nullable: true })
  lastProfitAmount!: number

  @Column('boolean', { nullable: true })
  hasTransferedProfitToWallet!: boolean

  @Column('float')
  expectedReturnRate!: number

  @Column('float', { nullable: true })
  autocompoundedReturnRate!: number

  @Column('float')
  expectedTotalReturns!: number

  @Column('float')
  currentTotalReturns!: number

  @Column('timestamp', { nullable: true })
  closedAt!: Date

  @Column('timestamp', { nullable: true })
  terminatedAt!: Date

  @Column({ nullable: true })
  terminator!: string

  @Column('text', { nullable: true })
  terminationReason!: string

  @Column('boolean', { nullable: true, default: false })
  terminationFeeApplied!: boolean

  @Column('timestamp')
  createdAt!: Date

  @Column('timestamp')
  updatedAt!: Date

  @ManyToOne(() => User, (user) => user.investments)
  @JoinColumn()
  user!: User

  @OneToMany(() => Profit, (profit) => profit.investment)
  profits!: Profit[]

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

/* // investment.model.ts
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index
} from 'typeorm'
import { User } from './user.model'
import { Profit } from './profit.model'

export enum InvestmentStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  TERMINATED = 'terminated'
}

@Entity()
export class Investment {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column('uuid')
  userId!: string

  @Column('float')
  initialDeposit!: number

  @Column('float', { nullable: true })
  currentCompoundedAmount!: number

  @Column('boolean', { default: true })
  autocompounded!: boolean

  @Index()
  @Column({
    type: 'enum',
    enum: InvestmentStatus,
    default: InvestmentStatus.OPEN
  })
  status!: InvestmentStatus

  @Column()
  investmentName!: string

  @Column()
  investmentTier!: string

  @Column('float')
  minimumDeposit!: number

  @Column('int')
  duration!: number

  @Column('float', { default: 0 })
  terminationFee!: number

  @Column('int', { default: 0 })
  daysCompleted!: number

  @Column('timestamptz', { nullable: true })
  lastProfitDistributedAt!: Date

  @Column('float', { default: 0, nullable: true })
  lastProfitAmount!: number

  @Column('boolean', { nullable: true })
  hasTransferedProfitToWallet!: boolean

  @Column('float')
  expectedReturnRate!: number

  @Column('float', { nullable: true })
  autocompoundedReturnRate!: number

  @Column('float')
  expectedTotalReturns!: number

  @Column('float')
  currentTotalReturns!: number

  @Column('timestamptz', { nullable: true })
  closedAt!: Date

  @Column('timestamptz', { nullable: true })
  terminatedAt!: Date

  @Column({ nullable: true })
  terminator!: string

  @Column('text', { nullable: true })
  terminationReason!: string

  @Column('boolean', { nullable: true, default: false })
  terminationFeeApplied!: boolean

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  @ManyToOne(() => User, (user) => user.investments)
  @JoinColumn()
  user!: User

  @OneToMany(() => Profit, (profit) => profit.investment)
  profits!: Profit[]
}
 */
