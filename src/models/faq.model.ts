import {
  Entity,
  Column,
  PrimaryColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm'
import { v4 as uuidv4 } from 'uuid'

@Entity()
export class Faq {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string = uuidv4()

  @Index()
  @Column({ unique: true })
  slug!: string

  @Column()
  title!: string

  @Column('text')
  description!: string

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


/* // notification.model.ts
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  Index
} from 'typeorm'

@Entity()
export class Faq {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Index()
  @Column({ unique: true })
  slug!: string

  @Column()
  title!: string

  @Column('text')
  description!: string

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
 */