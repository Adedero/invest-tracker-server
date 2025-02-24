import {
  Entity,
  Column,
  PrimaryColumn,
  OneToOne,
  OneToMany,
  BeforeInsert,
  BeforeUpdate
} from 'typeorm'
import { v4 as uuidv4 } from 'uuid'
import { Token } from './token.model'
import { Investment } from './investment.model'
import { Transaction } from './transaction.model'
import { Account } from './account.model'
import { Notification } from './notification.model'

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

@Entity()
export class User {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string = uuidv4()

  @Column()
  name!: string

  @Column({ unique: true })
  email!: string

  @Column({ default: false })
  isEmailVerified!: boolean

  @Column({ select: false })
  password!: string

  // Store role as a string since enums aren't supported natively in PG 8.4
  @Column({ type: 'varchar', length: 20, default: UserRole.USER })
  role!: UserRole

  @Column('text', { nullable: true })
  image!: string

  @Column({ nullable: true })
  phoneNumber!: string

  @Column('text', { nullable: true })
  address!: string

  @Column('text', { nullable: true })
  country!: string

  @Column('text', { nullable: true })
  region!: string

  @Column('timestamp')
  createdAt!: Date

  @Column('timestamp')
  updatedAt!: Date

  @OneToOne(() => Account, (account) => account.user, {
    cascade: true,
    onDelete: 'CASCADE'
  })
  account!: Account

  @OneToOne(() => Token, (token) => token.user, {
    cascade: true,
    onDelete: 'CASCADE'
  })
  verificationToken!: Token

  @OneToMany(() => Investment, (investment) => investment.user, {
    cascade: true,
    onDelete: 'CASCADE'
  })
  investments!: Investment[]

  @OneToMany(() => Transaction, (transaction) => transaction.user, {
    cascade: true,
    onDelete: 'CASCADE'
  })
  transactions!: Transaction[]

  @OneToMany(() => Notification, (notification) => notification.user, {
    cascade: true,
    onDelete: 'CASCADE'
  })
  notifications!: Notification[]

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

/* import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToOne,
  OneToMany
} from 'typeorm'
import { Token } from './token.model'
import { Investment } from './investment.model'
import { Transaction } from './transaction.model'
import { Account } from './account.model'
import { Notification } from './notification.model'

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  name!: string

  @Column({ unique: true })
  email!: string

  @Column({ default: false })
  isEmailVerified!: boolean

  @Column({ select: false })
  password!: string

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role!: UserRole

  @Column('text', { nullable: true })
  image!: string

  @Column({ nullable: true })
  phoneNumber!: string

  @Column('text', { nullable: true })
  address!: string

  @Column('text', { nullable: true })
  country!: string

  @Column('text', { nullable: true })
  region!: string

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  @OneToOne(() => Account, (account) => account.user, {
    cascade: true,
    onDelete: 'CASCADE'
  })
  account!: Account

  @OneToOne(() => Token, (token) => token.user, {
    cascade: true,
    onDelete: 'CASCADE'
  })
  verificationToken!: Token

  @OneToMany(() => Investment, (investment) => investment.user, {
    cascade: true,
    onDelete: 'CASCADE'
  })
  investments!: Investment[]

  @OneToMany(() => Transaction, (transaction) => transaction.user, {
    cascade: true,
    onDelete: 'CASCADE'
  })
  transactions!: Transaction[]

  @OneToMany(() => Notification, (notification) => notification.user, {
    cascade: true,
    onDelete: 'CASCADE'
  })
  notifications!: Notification[]
}
 */
