"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Investment = exports.InvestmentStatus = void 0;
const typeorm_1 = require("typeorm");
const user_model_1 = require("./user.model");
const profit_model_1 = require("./profit.model");
const uuid_1 = require("uuid");
var InvestmentStatus;
(function (InvestmentStatus) {
    InvestmentStatus["OPEN"] = "open";
    InvestmentStatus["CLOSED"] = "closed";
    InvestmentStatus["TERMINATED"] = "terminated";
})(InvestmentStatus || (exports.InvestmentStatus = InvestmentStatus = {}));
let Investment = class Investment {
    constructor() {
        this.id = (0, uuid_1.v4)();
    }
    setCreationDates() {
        const now = new Date();
        this.createdAt = now;
        this.updatedAt = now;
    }
    updateTimestamp() {
        this.updatedAt = new Date();
    }
};
exports.Investment = Investment;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], Investment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], Investment.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], Investment.prototype, "initialDeposit", void 0);
__decorate([
    (0, typeorm_1.Column)('float', { nullable: true }),
    __metadata("design:type", Number)
], Investment.prototype, "currentCompoundedAmount", void 0);
__decorate([
    (0, typeorm_1.Column)('boolean', { default: true }),
    __metadata("design:type", Boolean)
], Investment.prototype, "autocompounded", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: InvestmentStatus.OPEN }),
    __metadata("design:type", String)
], Investment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Investment.prototype, "investmentName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Investment.prototype, "investmentTier", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], Investment.prototype, "minimumDeposit", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], Investment.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.Column)('float', { default: 0 }),
    __metadata("design:type", Number)
], Investment.prototype, "terminationFee", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { default: 0 }),
    __metadata("design:type", Number)
], Investment.prototype, "daysCompleted", void 0);
__decorate([
    (0, typeorm_1.Column)('timestamp', { nullable: true }),
    __metadata("design:type", Date)
], Investment.prototype, "lastProfitDistributedAt", void 0);
__decorate([
    (0, typeorm_1.Column)('float', { default: 0, nullable: true }),
    __metadata("design:type", Number)
], Investment.prototype, "lastProfitAmount", void 0);
__decorate([
    (0, typeorm_1.Column)('boolean', { nullable: true }),
    __metadata("design:type", Boolean)
], Investment.prototype, "hasTransferedProfitToWallet", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], Investment.prototype, "expectedReturnRate", void 0);
__decorate([
    (0, typeorm_1.Column)('float', { nullable: true }),
    __metadata("design:type", Number)
], Investment.prototype, "autocompoundedReturnRate", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], Investment.prototype, "expectedTotalReturns", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], Investment.prototype, "currentTotalReturns", void 0);
__decorate([
    (0, typeorm_1.Column)('timestamp', { nullable: true }),
    __metadata("design:type", Date)
], Investment.prototype, "closedAt", void 0);
__decorate([
    (0, typeorm_1.Column)('timestamp', { nullable: true }),
    __metadata("design:type", Date)
], Investment.prototype, "terminatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Investment.prototype, "terminator", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], Investment.prototype, "terminationReason", void 0);
__decorate([
    (0, typeorm_1.Column)('boolean', { nullable: true, default: false }),
    __metadata("design:type", Boolean)
], Investment.prototype, "terminationFeeApplied", void 0);
__decorate([
    (0, typeorm_1.Column)('timestamp'),
    __metadata("design:type", Date)
], Investment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)('timestamp'),
    __metadata("design:type", Date)
], Investment.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_model_1.User, (user) => user.investments),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", user_model_1.User)
], Investment.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => profit_model_1.Profit, (profit) => profit.investment),
    __metadata("design:type", Array)
], Investment.prototype, "profits", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Investment.prototype, "setCreationDates", null);
__decorate([
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Investment.prototype, "updateTimestamp", null);
exports.Investment = Investment = __decorate([
    (0, typeorm_1.Entity)()
], Investment);
/* // investment.model.ts
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index
} from 'typeorm'
import { User } from './user.model'
import { Profit } from './profit.model'

export enum InvestmentStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  TERMINATED = 'terminated'
}

@Entity()
export class Investment {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column('uuid')
  userId!: string

  @Column('float')
  initialDeposit!: number

  @Column('float', { nullable: true })
  currentCompoundedAmount!: number

  @Column('boolean', { default: true })
  autocompounded!: boolean

  @Index()
  @Column({
    type: 'enum',
    enum: InvestmentStatus,
    default: InvestmentStatus.OPEN
  })
  status!: InvestmentStatus

  @Column()
  investmentName!: string

  @Column()
  investmentTier!: string

  @Column('float')
  minimumDeposit!: number

  @Column('int')
  duration!: number

  @Column('float', { default: 0 })
  terminationFee!: number

  @Column('int', { default: 0 })
  daysCompleted!: number

  @Column('timestamptz', { nullable: true })
  lastProfitDistributedAt!: Date

  @Column('float', { default: 0, nullable: true })
  lastProfitAmount!: number

  @Column('boolean', { nullable: true })
  hasTransferedProfitToWallet!: boolean

  @Column('float')
  expectedReturnRate!: number

  @Column('float', { nullable: true })
  autocompoundedReturnRate!: number

  @Column('float')
  expectedTotalReturns!: number

  @Column('float')
  currentTotalReturns!: number

  @Column('timestamptz', { nullable: true })
  closedAt!: Date

  @Column('timestamptz', { nullable: true })
  terminatedAt!: Date

  @Column({ nullable: true })
  terminator!: string

  @Column('text', { nullable: true })
  terminationReason!: string

  @Column('boolean', { nullable: true, default: false })
  terminationFeeApplied!: boolean

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  @ManyToOne(() => User, (user) => user.investments)
  @JoinColumn()
  user!: User

  @OneToMany(() => Profit, (profit) => profit.investment)
  profits!: Profit[]
}
 */ 
