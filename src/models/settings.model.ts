import {
  Entity,
  Column,
  PrimaryColumn,
  BeforeInsert,
  BeforeUpdate
} from 'typeorm'
import { v4 as uuidv4 } from 'uuid'

@Entity()
export class Settings {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string = uuidv4()

  @Column()
  adminWalletAddress!: string

  @Column()
  adminNetwork!: string

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

/* // settings.model.ts
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn
} from 'typeorm'

@Entity()
export class Settings {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  adminWalletAddress!: string

  @Column()
  adminNetwork!: string

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
 */
