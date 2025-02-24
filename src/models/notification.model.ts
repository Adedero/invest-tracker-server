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

@Entity()
export class Notification {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string = uuidv4()

  @Index()
  @Column({ type: 'varchar', length: 36 })
  userId!: string

  @Column()
  title!: string

  @Column('text')
  description!: string

  @Column('boolean', { default: false })
  isRead!: boolean

  @Column({ nullable: true })
  icon!: string

  @Column('timestamp')
  createdAt!: Date

  @Column('timestamp')
  updatedAt!: Date

  @ManyToOne(() => User, (user) => user.notifications)
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

/* // notification.model.ts
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

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Index()
  @Column('uuid')
  userId!: string

  @Column()
  title!: string

  @Column('text')
  description!: string

  @Column('boolean', { default: false })
  isRead!: boolean

  @Column({ nullable: true })
  icon!: string

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  @ManyToOne(() => User, (user) => user.notifications)
  user!: User
}
 */
