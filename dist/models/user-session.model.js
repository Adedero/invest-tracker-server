'use strict'
/* import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToOne,
  Relation
} from 'typeorm'
import { User } from './user.model'

@Entity()
export class UserSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column('date')
  lastLogin!: Date

  @Column('array')
  ipAddresses!: string[]

  @Column('array')
  userAgents!: string[]

  @Column({ default: false })
  isFlagged!: boolean

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  @OneToOne(() => User, (user) => user.session, {
    cascade: true
  })
  user!: Relation<User>
}
 */
