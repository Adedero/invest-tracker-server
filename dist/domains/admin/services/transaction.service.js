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
exports.updateTransaction = void 0;
const helpers_1 = require("../../../utils/helpers");
const database_config_1 = require("../../../config/database.config");
const logger_1 = __importDefault(require("../../../utils/logger"));
const alert_event_1 = require("../../../events/alert.event");
const updateTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { status, reason } = req.body;
    if (!id) {
        (0, helpers_1.sendResponse)(res, 400, 'No transaction ID provided');
        return;
    }
    if (!status) {
        (0, helpers_1.sendResponse)(res, 400, 'No transaction status provided');
        return;
    }
    if (status === 'failed' && !reason) {
        (0, helpers_1.sendResponse)(res, 400, 'No reason for failure provided');
        return;
    }
    try {
        const { dataSource } = yield (0, database_config_1.initDataSource)();
        yield dataSource.transaction((manager) => __awaiter(void 0, void 0, void 0, function* () {
            const txnRepo = manager.getRepository('Transaction');
            const userRepo = manager.getRepository('User');
            const txn = yield txnRepo.findOne({ where: { id } });
            if (!txn) {
                throw new Error('Transaction not found');
            }
            if (txn.status === status) {
                throw new Error('Transaction has already been resolved with the status: ' + status);
            }
            const user = yield userRepo.findOne({
                where: { id: txn.userId },
                relations: { account: true }
            });
            if (!user) {
                throw new Error('User not found');
            }
            if (!user.account) {
                throw new Error('User account not found');
            }
            if (status === 'failed') {
                //If transaction is a failed withdrawal, credit the user their money back
                if (txn.transactionType === 'withdrawal') {
                    user.account.walletBalance = (parseFloat(user.account.walletBalance) + txn.amountInUSD).toFixed(2);
                }
                //Send notification
                //Send email
            }
            if (status === 'successful') {
                //If transaction is a successful deposit, credit the user's wallet balance
                if (txn.transactionType === 'deposit') {
                    user.account.walletBalance = (parseFloat(user.account.walletBalance) + txn.amountInUSD).toFixed(2);
                }
            }
            txn.status = status;
            txn.approvalDate = status === 'failed' ? null : new Date();
            txn.failureReason = status === 'failed' && reason ? reason : null;
            yield txnRepo.save(txn);
            yield userRepo.save(user);
            alert_event_1.alertEmitter.emit('update-transaction-status', Object.assign(Object.assign({}, txn), { user: Object.assign({}, user) }));
            (0, helpers_1.sendResponse)(res, 200, { data: txn });
        }));
    }
    catch (e) {
        const err = e;
        logger_1.default.error(`Error updating transaction status: ${err.message}`, err);
        (0, helpers_1.sendResponse)(res, 500, err.message);
    }
});
exports.updateTransaction = updateTransaction;
