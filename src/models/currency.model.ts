import {
  Entity,
  Column,
  PrimaryColumn,
  BeforeInsert,
  BeforeUpdate
} from 'typeorm'
import { v4 as uuidv4 } from 'uuid'

@Entity()
export class Currency {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string = uuidv4()

  @Column()
  name!: string

  @Column()
  symbol!: string

  @Column()
  abbr!: string

  @Column('text', { nullable: true })
  image!: string

  @Column('float', { default: 1 })
  rate!: number

  @Column('timestamp', { nullable: true })
  rateUpdatedAt!: Date

  @Column()
  walletAddress!: string

  @Column({ nullable: true })
  walletAddressNetwork!: string

  @Column()
  isAvailableForUserWithdrawal!: boolean

  @Column('float', { default: 0 })
  withdrawalCharge!: number

  @Column('timestamp')
  createdAt!: Date

  @Column('timestamp')
  updatedAt!: Date

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

/* // currency.model.ts
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn
} from 'typeorm'

@Entity()
export class Currency {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  name!: string

  @Column()
  symbol!: string

  @Column()
  abbr!: string

  @Column('text', { nullable: true })
  image!: string

  @Column('float', { default: 1 })
  rate!: number

  @Column('timestamptz', { nullable: true })
  rateUpdatedAt!: Date

  @Column()
  walletAddress!: string

  @Column({ nullable: true })
  walletAddressNetwork!: string

  @Column()
  isAvailableForUserWithdrawal!: boolean

  @Column('float', { default: 0 })
  withdrawalCharge!: number

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
 */
