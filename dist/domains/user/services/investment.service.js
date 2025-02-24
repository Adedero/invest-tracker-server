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
exports.terminateInvestment = exports.createInvestment = void 0;
const helpers_1 = require("../../../utils/helpers");
const database_config_1 = require("../../../config/database.config");
const user_model_1 = require("../../../models/user.model");
const investment_model_1 = require("../../../models/investment.model");
const transaction_model_1 = require("../../../models/transaction.model");
const repository_1 = __importDefault(require("../../../utils/repository"));
const logger_1 = __importDefault(require("../../../utils/logger"));
const alert_event_1 = require("../../../events/alert.event");
const createInvestment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { data } = req.body;
    if (!data || Object.keys(data).length === 0) {
        (0, helpers_1.sendResponse)(res, 400, 'No data provided');
        return;
    }
    const t = new transaction_model_1.Transaction();
    t.amountInUSD = data.initialDeposit;
    t.charge = 0.0;
    t.actualAmountInUSD = data.initialDeposit;
    t.rate = 1.0;
    t.transactionType = transaction_model_1.TransactionType.INVESTMENT;
    t.status = transaction_model_1.TransactionStatus.SUCCESSFUL;
    t.currency = 'Dollar';
    t.amountInCurrency = data.initialDeposit;
    t.isWireTransfer = false;
    t.description = `Investment on ${data.investmentName} plan, ${data.investmentTier} tier`;
    const { dataSource } = yield (0, database_config_1.initDataSource)();
    try {
        yield dataSource.manager.transaction((manager) => __awaiter(void 0, void 0, void 0, function* () {
            const users = manager.getRepository(user_model_1.User);
            const investments = manager.getRepository(investment_model_1.Investment);
            const newInvestment = investments.create(data);
            const user = yield users.findOne({
                where: { id: req.user.id },
                relations: { account: true }
            });
            if (!user) {
                (0, helpers_1.sendResponse)(res, 404, 'User not found');
                return;
            }
            newInvestment.user = user;
            if (user.account.walletBalance < newInvestment.initialDeposit) {
                (0, helpers_1.sendResponse)(res, 400, 'Insufficient balance');
                return;
            }
            user.account.walletBalance = parseFloat((user.account.walletBalance - newInvestment.initialDeposit).toFixed(2));
            const savedInvestment = yield manager.save(newInvestment);
            t.userId = user.id;
            t.user = user;
            t.investmentId = savedInvestment.id;
            yield manager.save(user);
            yield manager.save(t);
            alert_event_1.alertEmitter.emit('create-investment', newInvestment);
            // Send a successful response with the created data
            (0, helpers_1.sendResponse)(res, 201, { data: newInvestment });
        }));
    }
    catch (error) {
        (0, helpers_1.sendResponse)(res, 500, `Failed to create investment: ${error.message}`);
    }
});
exports.createInvestment = createInvestment;
const terminateInvestment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const { id } = req.params;
    const { terminationReason } = req.body;
    if (!id) {
        (0, helpers_1.sendResponse)(res, 400, 'No investment selected');
        return;
    }
    try {
        const { dataSource } = yield (0, database_config_1.initDataSource)();
        yield dataSource.manager.transaction((manager) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const [investments, accounts] = yield Promise.all([
                (0, repository_1.default)('Investment'),
                (0, repository_1.default)('Account')
            ]);
            const investmentRepo = manager.withRepository(investments.model);
            const accountRepo = manager.withRepository(accounts.model);
            const investment = yield investmentRepo.findOne({
                where: { id },
                relations: { user: true }
            });
            const account = yield accountRepo.findOne({ where: { userId } });
            if (!investment) {
                throw new Error('Investment not found');
            }
            if (investment.status === 'terminated' ||
                investment.status === 'closed') {
                throw new Error('Investment is already resolved and cannot be terminated');
            }
            if (!account) {
                throw new Error('User account not found');
            }
            const terminationFee = (_a = investment.terminationFee) !== null && _a !== void 0 ? _a : 0;
            if (investment.autocompounded) {
                if (investment.currentTotalReturns >= investment.initialDeposit) {
                    account.walletBalance +=
                        investment.currentTotalReturns - terminationFee;
                }
                else {
                    const balance = investment.initialDeposit -
                        investment.currentTotalReturns -
                        terminationFee;
                    account.walletBalance += investment.currentTotalReturns + balance;
                }
                investment.hasTransferedProfitToWallet = true;
            }
            if (!investment.autocompounded) {
                if (investment.currentTotalReturns >= investment.initialDeposit) {
                    if (account.walletBalance - terminationFee < 0) {
                        throw new Error('Insufficient balance to pay for the termination fee');
                    }
                    account.walletBalance -= terminationFee;
                }
                else {
                    const balance = investment.initialDeposit -
                        investment.currentTotalReturns -
                        terminationFee;
                    if (account.walletBalance + balance < 0) {
                        throw new Error('Insufficient balance to pay for the termination fee');
                    }
                    account.walletBalance += balance;
                }
            }
            investment.status = 'terminated';
            investment.terminator = 'user';
            investment.terminatedAt = new Date();
            investment.closedAt = new Date();
            investment.terminationFeeApplied = true;
            if (terminationReason) {
                investment.terminationReason = terminationReason;
            }
            yield investmentRepo.save(investment);
            yield accountRepo.save(account);
            alert_event_1.alertEmitter.emit('terminate-investment', investment);
            (0, helpers_1.sendResponse)(res, 200, 'Investment terminated');
        }));
    }
    catch (error) {
        logger_1.default.error(`Failed to terminate investment with id: ${id}`, error);
        (0, helpers_1.sendResponse)(res, 400, error.message);
    }
});
exports.terminateInvestment = terminateInvestment;
