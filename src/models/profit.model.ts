import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  Index,
  BeforeInsert,
  BeforeUpdate
} from 'typeorm'
import { Investment } from './investment.model'
import { v4 as uuidv4 } from 'uuid'

export enum ProfitStatus {
  FROZEN = 'frozen',
  DISTRIBUTED = 'distributed',
  PENDING = 'pending'
}

@Entity()
export class Profit {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string = uuidv4()

  @Index()
  @Column({ type: 'varchar', length: 36 })
  userId!: string

  @Column({ type: 'varchar', length: 36, nullable: true })
  accountId!: string

  @Column({ type: 'varchar', length: 36, nullable: true })
  investmentId!: string

  @Column('float')
  amount!: number

  @Column({ type: 'varchar', length: 20, default: ProfitStatus.FROZEN })
  status!: ProfitStatus

  @Column('timestamp', { nullable: true })
  distributedAt!: Date

  @Column('timestamp')
  createdAt!: Date

  @Column('timestamp')
  updatedAt!: Date

  @ManyToOne(() => Investment, (investment) => investment.profits, {
    cascade: true
  })
  investment!: Investment

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

/* // profit.model.ts
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  Index
} from 'typeorm'
import { Investment } from './investment.model'

export enum ProfitStatus {
  FROZEN = 'frozen',
  DISTRIBUTED = 'distributed',
  PENDING = 'pending'
}

@Entity()
export class Profit {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Index()
  @Column('uuid')
  userId!: string

  @Column('uuid', { nullable: true })
  accountId!: string

  @Column('uuid', { nullable: true })
  investmentId!: string

  @Column('float')
  amount!: number

  @Column({ type: 'enum', enum: ProfitStatus, default: ProfitStatus.FROZEN })
  status!: ProfitStatus

  @Column('timestamptz', { nullable: true })
  distributedAt!: Date

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  @ManyToOne(() => Investment, (investment) => investment.profits, {
    cascade: true
  })
  investment!: Investment
}
 */
