import {
  Entity,
  Column,
  PrimaryColumn,
  BeforeInsert,
  BeforeUpdate
} from 'typeorm'
import { v4 as uuidv4 } from 'uuid'

// Transformer to handle JSON serialization/deserialization
const jsonTransformer = {
  to: (value: unknown) => (value ? JSON.stringify(value) : null),
  from: (value: string) => (value ? JSON.parse(value) : null)
}

@Entity()
export class InvestmentPlan {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string = uuidv4()

  @Column()
  name!: string

  @Column({ unique: true })
  slug!: string

  @Column({ nullable: true })
  image!: string

  // Store tiers as text and use a transformer to convert to/from JSON
  @Column('text', { nullable: true, transformer: jsonTransformer })
  tiers!: {
    name: string
    minimumDeposit: number
    duration: number
    expectedReturnRate: number
    terminationFee?: number
  }[]

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

/* // investment-plan.model.ts
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn
} from 'typeorm'

@Entity()
export class InvestmentPlan {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  name!: string

  @Column({ unique: true })
  slug!: string

  @Column({ nullable: true })
  image!: string

  @Column('json', { nullable: true })
  tiers!: {
    name: string
    minimumDeposit: number
    duration: number
    expectedReturnRate: number
    terminationFee?: number
  }[]

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
 */
