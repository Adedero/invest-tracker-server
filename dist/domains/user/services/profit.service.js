"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.distributeProfit = void 0;
const database_config_1 = require("../../../config/database.config");
const investment_model_1 = require("../../../models/investment.model");
const profit_model_1 = require("../../../models/profit.model");
const handlers_1 = require("../../../utils/handlers");
const logger_1 = __importDefault(require("../../../utils/logger"));
const repository_1 = __importDefault(require("../../../utils/repository"));
const transaction_model_1 = require("./../../../models/transaction.model");
const distributeProfit = () => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info('Distributing profit');
    const [investmentRepo, userRepo] = yield Promise.all([
        (0, repository_1.default)('Investment'),
        (0, repository_1.default)('User')
    ]);
    try {
        const { dataSource } = yield (0, database_config_1.initDataSource)();
        const openInvestments = yield investmentRepo.model.find({
            where: { status: investment_model_1.InvestmentStatus.OPEN },
            relations: { user: true }
        });
        if (!openInvestments.length) {
            logger_1.default.info('No open investments found');
            return;
        }
        for (const investment of openInvestments) {
            const user = yield userRepo.model.findOne({
                where: { id: investment.userId },
                relations: { account: true }
            });
            if (!user || !user.account) {
                logger_1.default.warn(`User or account not found for investment ${investment.id}`);
                continue;
            }
            if (investment.daysCompleted >= investment.duration) {
                const shortfall = investment.expectedTotalReturns - investment.currentTotalReturns;
                if (shortfall > 0) {
                    yield dataSource.transaction((manager) => __awaiter(void 0, void 0, void 0, function* () {
                        const profit = new profit_model_1.Profit();
                        profit.userId = investment.userId;
                        profit.accountId = user.account.id;
                        profit.investmentId = investment.id;
                        profit.amount = shortfall;
                        profit.status = investment.autocompounded
                            ? profit_model_1.ProfitStatus.FROZEN
                            : profit_model_1.ProfitStatus.DISTRIBUTED;
                        if (!investment.autocompounded)
                            profit.distributedAt = new Date();
                        profit.investment = investment;
                        const txn = new transaction_model_1.Transaction();
                        txn.actualAmountInUSD = profit.amount;
                        txn.amountInCurrency = profit.amount;
                        txn.amountInUSD = profit.amount;
                        txn.charge = 0;
                        txn.createdAt = new Date();
                        txn.currency = 'USD';
                        txn.description = `Daily return on ${investment.investmentName} (${investment.investmentTier} Tier)`;
                        txn.investmentId = investment.id;
                        txn.isWireTransfer = false;
                        txn.rate = 1;
                        txn.status = transaction_model_1.TransactionStatus.SUCCESSFUL;
                        txn.transactionType = transaction_model_1.TransactionType.PROFIT;
                        txn.userId = investment.userId;
                        txn.user = user;
                        yield manager.save(profit);
                        yield manager.save(txn);
                        if (investment.autocompounded) {
                            investment.currentCompoundedAmount =
                                (investment.currentCompoundedAmount ||
                                    investment.initialDeposit) + shortfall;
                        }
                        investment.currentTotalReturns += shortfall;
                        user.account.walletBalance += investment.currentTotalReturns;
                        yield manager.save(user);
                        investment.status = investment_model_1.InvestmentStatus.CLOSED;
                        investment.closedAt = new Date();
                        yield manager.save(investment);
                        yield (0, handlers_1.createNotification)({
                            userId: user.id,
                            title: 'Close of Investment',
                            description: `Your investment on ${investment.investmentName} plan, ${investment.investmentTier} tier has completed its duration and is now closed.`,
                            user: user
                        }, manager);
                    }));
                }
                else {
                    investment.status = investment_model_1.InvestmentStatus.CLOSED;
                    investment.closedAt = new Date();
                    yield investmentRepo.model.save(investment);
                }
                continue;
            }
            const remainingDays = investment.duration - investment.daysCompleted;
            const totalReturnsLeft = investment.expectedTotalReturns - investment.currentTotalReturns;
            const avgDailyReturn = totalReturnsLeft / remainingDays;
            const FLUCTUATION_MIN = 0.8;
            const FLUCTUATION_MAX = 1.2;
            const fluctuationFactor = FLUCTUATION_MIN + Math.random() * (FLUCTUATION_MAX - FLUCTUATION_MIN);
            const dailyReturn = Math.max(0, parseFloat((avgDailyReturn * fluctuationFactor).toFixed(2)));
            yield dataSource.transaction((manager) => __awaiter(void 0, void 0, void 0, function* () {
                const profit = new profit_model_1.Profit();
                profit.userId = investment.userId;
                profit.accountId = user.account.id;
                profit.investmentId = investment.id;
                profit.amount = dailyReturn;
                profit.status = investment.autocompounded
                    ? profit_model_1.ProfitStatus.FROZEN
                    : profit_model_1.ProfitStatus.DISTRIBUTED;
                if (!investment.autocompounded)
                    profit.distributedAt = new Date();
                profit.investment = investment;
                const txn = new transaction_model_1.Transaction();
                txn.actualAmountInUSD = profit.amount;
                txn.amountInCurrency = profit.amount;
                txn.amountInUSD = profit.amount;
                txn.charge = 0;
                txn.createdAt = new Date();
                txn.currency = 'USD';
                txn.description = `Daily return on ${investment.investmentName} (${investment.investmentTier} Tier)`;
                txn.investmentId = investment.id;
                txn.isWireTransfer = false;
                txn.rate = 1;
                txn.status = transaction_model_1.TransactionStatus.SUCCESSFUL;
                txn.transactionType = transaction_model_1.TransactionType.PROFIT;
                txn.userId = investment.userId;
                txn.user = user;
                yield manager.save(profit);
                if (investment.autocompounded) {
                    investment.currentCompoundedAmount = parseFloat(((investment.currentCompoundedAmount ||
                        investment.initialDeposit) + dailyReturn).toFixed(2));
                }
                else {
                    user.account.walletBalance = parseFloat((user.account.walletBalance + dailyReturn).toFixed(2));
                    yield manager.save(user);
                }
                investment.currentTotalReturns = parseFloat((investment.currentTotalReturns + dailyReturn).toFixed(2));
                investment.daysCompleted += 1;
                investment.lastProfitDistributedAt = new Date();
                investment.lastProfitAmount = dailyReturn;
                yield manager.save(investment);
                yield (0, handlers_1.createNotification)({
                    userId: user.id,
                    title: 'Daily Return',
                    description: `Investment: ${investment.investmentName}\nTier: ${investment.investmentTier}\nAmount: $${profit.amount.toLocaleString()}`,
                    user: user
                }, manager);
            }));
        }
    }
    catch (error) {
        logger_1.default.error('Error during profit distribution:', error);
    }
});
exports.distributeProfit = distributeProfit;
