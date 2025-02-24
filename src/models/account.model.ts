import {
  Entity,
  Column,
  PrimaryColumn,
  BeforeInsert,
  BeforeUpdate,
  OneToOne,
  JoinColumn
} from 'typeorm'
import { v4 as uuidv4 } from 'uuid'
import { User } from './user.model'

export enum KycStatus {
  UNVERIFIED = 'unverified',
  PENDING = 'pending',
  VERIFIED = 'verified'
}

@Entity()
export class Account {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string = uuidv4()

  @Column({ type: 'varchar', length: 36 })
  userId!: string

  @Column('float', { default: 0 })
  walletBalance!: number

  @Column({ nullable: true })
  kycIdType!: string

  @Column('text', { nullable: true })
  kycDocument!: string

  @Column({ nullable: true })
  kycDocumentExt!: string

  @Column({ type: 'varchar', length: 20, default: KycStatus.UNVERIFIED })
  kycStatus!: KycStatus

  @Column('timestamp', { nullable: true })
  kycSubmittedAt!: Date

  @Column('timestamp', { nullable: true })
  kycVerifiedAt!: Date

  @Column('timestamp')
  createdAt!: Date

  @Column('timestamp')
  updatedAt!: Date

  @OneToOne(() => User, (user) => user.account)
  @JoinColumn()
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

/* // account.model.ts
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm'
import { User } from './user.model'

export enum KycStatus {
  UNVERIFIED = 'unverified',
  PENDING = 'pending',
  VERIFIED = 'verified'
}

@Entity()
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column('uuid')
  userId!: string

  @Column('float', { default: 0 })
  walletBalance!: number

  @Column({ nullable: true })
  kycIdType!: string

  @Column('text', { nullable: true })
  kycDocument!: string

  @Column({ nullable: true })
  kycDocumentExt!: string

  @Column({ type: 'enum', enum: KycStatus, default: KycStatus.UNVERIFIED })
  kycStatus!: KycStatus

  @Column('timestamptz', { nullable: true })
  kycSubmittedAt!: Date

  @Column('timestamptz', { nullable: true })
  kycVerifiedAt!: Date

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  @OneToOne(() => User, (user) => user.account)
  @JoinColumn()
  user!: User
}
 */
