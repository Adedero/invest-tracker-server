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
exports.Profit = exports.ProfitStatus = void 0;
const typeorm_1 = require("typeorm");
const investment_model_1 = require("./investment.model");
const uuid_1 = require("uuid");
var ProfitStatus;
(function (ProfitStatus) {
    ProfitStatus["FROZEN"] = "frozen";
    ProfitStatus["DISTRIBUTED"] = "distributed";
    ProfitStatus["PENDING"] = "pending";
})(ProfitStatus || (exports.ProfitStatus = ProfitStatus = {}));
let Profit = class Profit {
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
exports.Profit = Profit;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], Profit.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], Profit.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 36, nullable: true }),
    __metadata("design:type", String)
], Profit.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 36, nullable: true }),
    __metadata("design:type", String)
], Profit.prototype, "investmentId", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], Profit.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: ProfitStatus.FROZEN }),
    __metadata("design:type", String)
], Profit.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('timestamp', { nullable: true }),
    __metadata("design:type", Date)
], Profit.prototype, "distributedAt", void 0);
__decorate([
    (0, typeorm_1.Column)('timestamp'),
    __metadata("design:type", Date)
], Profit.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)('timestamp'),
    __metadata("design:type", Date)
], Profit.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => investment_model_1.Investment, (investment) => investment.profits, {
        cascade: true
    }),
    __metadata("design:type", investment_model_1.Investment)
], Profit.prototype, "investment", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Profit.prototype, "setCreationDates", null);
__decorate([
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Profit.prototype, "updateTimestamp", null);
exports.Profit = Profit = __decorate([
    (0, typeorm_1.Entity)()
], Profit);
/* // profit.model.ts
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  Index
} from 'typeorm'
import { Investment } from './investment.model'

export enum ProfitStatus {
  FROZEN = 'frozen',
  DISTRIBUTED = 'distributed',
  PENDING = 'pending'
}

@Entity()
export class Profit {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Index()
  @Column('uuid')
  userId!: string

  @Column('uuid', { nullable: true })
  accountId!: string

  @Column('uuid', { nullable: true })
  investmentId!: string

  @Column('float')
  amount!: number

  @Column({ type: 'enum', enum: ProfitStatus, default: ProfitStatus.FROZEN })
  status!: ProfitStatus

  @Column('timestamptz', { nullable: true })
  distributedAt!: Date

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  @ManyToOne(() => Investment, (investment) => investment.profits, {
    cascade: true
  })
  investment!: Investment
}
 */
