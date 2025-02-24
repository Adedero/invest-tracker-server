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
exports.terminateInvestment = terminateInvestment;
const helpers_1 = require("../../../utils/helpers");
const logger_1 = __importDefault(require("../../../utils/logger"));
const database_config_1 = require("../../../config/database.config");
const alert_event_1 = require("../../../events/alert.event");
function terminateInvestment(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id } = req.params;
        if (!id) {
            (0, helpers_1.sendResponse)(res, 400, 'No investment ID provided');
            return;
        }
        const { terminationReason, terminationFeeApplied } = req.body;
        if (!terminationReason) {
            (0, helpers_1.sendResponse)(res, 400, 'No termination reason provided');
        }
        try {
            const { dataSource } = yield (0, database_config_1.initDataSource)();
            yield dataSource.transaction((manager) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const investmentRepo = manager.getRepository('Investment');
                const accountRepo = manager.getRepository('Account');
                const investment = yield investmentRepo.findOne({
                    where: { id },
                    relations: { user: true }
                });
                if (!investment) {
                    throw new Error('Investment not found');
                }
                if (investment.status === 'terminated' || investment.status === 'closed') {
                    throw new Error('Investment is already resolved and cannot be terminated');
                }
                const account = yield accountRepo.findOne({
                    where: { userId: investment.userId }
                });
                if (!account) {
                    throw new Error('User account not found');
                }
                const terminationFee = terminationFeeApplied ? ((_a = investment.terminationFee) !== null && _a !== void 0 ? _a : 0) : 0;
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
                investment.terminator = 'admin';
                investment.terminatedAt = new Date();
                investment.closedAt = new Date();
                investment.terminationFeeApplied = terminationFeeApplied;
                investment.terminationReason = terminationReason;
                yield investmentRepo.save(investment);
                yield accountRepo.save(account);
                alert_event_1.alertEmitter.emit('terminate-investment', investment);
                (0, helpers_1.sendResponse)(res, 200, { data: investment });
            }));
        }
        catch (error) {
            const e = error;
            logger_1.default.error(`Error terminating investment: ${e.message}`, e);
            (0, helpers_1.sendResponse)(res, 500, e.message);
        }
    });
}
