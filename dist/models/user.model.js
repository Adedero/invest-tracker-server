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
exports.User = exports.UserRole = void 0;
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const token_model_1 = require("./token.model");
const investment_model_1 = require("./investment.model");
const transaction_model_1 = require("./transaction.model");
const account_model_1 = require("./account.model");
const notification_model_1 = require("./notification.model");
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["USER"] = "user";
})(UserRole || (exports.UserRole = UserRole = {}));
let User = class User {
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
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isEmailVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({ select: false }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: UserRole.USER }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], User.prototype, "image", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], User.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], User.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], User.prototype, "region", void 0);
__decorate([
    (0, typeorm_1.Column)('timestamp'),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)('timestamp'),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => account_model_1.Account, (account) => account.user, {
        cascade: true,
        onDelete: 'CASCADE'
    }),
    __metadata("design:type", account_model_1.Account)
], User.prototype, "account", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => token_model_1.Token, (token) => token.user, {
        cascade: true,
        onDelete: 'CASCADE'
    }),
    __metadata("design:type", token_model_1.Token)
], User.prototype, "verificationToken", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => investment_model_1.Investment, (investment) => investment.user, {
        cascade: true,
        onDelete: 'CASCADE'
    }),
    __metadata("design:type", Array)
], User.prototype, "investments", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => transaction_model_1.Transaction, (transaction) => transaction.user, {
        cascade: true,
        onDelete: 'CASCADE'
    }),
    __metadata("design:type", Array)
], User.prototype, "transactions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => notification_model_1.Notification, (notification) => notification.user, {
        cascade: true,
        onDelete: 'CASCADE'
    }),
    __metadata("design:type", Array)
], User.prototype, "notifications", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], User.prototype, "setCreationDates", null);
__decorate([
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], User.prototype, "updateTimestamp", null);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)()
], User);
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
