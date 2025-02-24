import {
  Entity,
  Column,
  PrimaryColumn,
  BeforeInsert,
  BeforeUpdate,
  OneToOne,
  JoinColumn,
  type Relation,
} from 'typeorm'
import { v4 as uuidv4 } from 'uuid'
import { User } from './user.model'

@Entity()
export class Token {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string = uuidv4()

  @Column()
  value!: string

  // Use timestamp instead of timestamptz
  @Column('timestamp')
  expiresIn!: Date

  @Column('timestamp')
  createdAt!: Date

  @Column('timestamp')
  updatedAt!: Date

  @OneToOne(() => User, (user) => user.verificationToken)
  @JoinColumn()
  user!: Relation<User>

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
  type Relation,
  OneToOne,
  JoinColumn
} from 'typeorm'
import { User } from './user.model'

@Entity()
export class Token {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  value!: string

  @Column('timestamptz')
  expiresIn!: Date

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  @OneToOne(() => User, (user) => user.verificationToken)
  @JoinColumn()
  user!: Relation<User>
}
 */