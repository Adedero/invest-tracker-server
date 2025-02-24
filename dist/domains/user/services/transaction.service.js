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
exports.createDeposit = exports.createWithdrawal = void 0;
const repository_1 = __importDefault(require("../../../utils/repository"));
const helpers_1 = require("../../../utils/helpers");
const database_config_1 = require("../../../config/database.config");
const transaction_model_1 = require("../../../models/transaction.model");
const alert_event_1 = require("../../../events/alert.event");
const typeorm_1 = require("typeorm");
const createWithdrawal = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { data } = req.body;
    if (!data || Object.keys(data).length === 0) {
        (0, helpers_1.sendResponse)(res, 400, 'No data provided');
        return;
    }
    if (data.transactionType !== 'withdrawal') {
        next();
        return;
    }
    try {
        const users = yield (0, repository_1.default)('User');
        const transactions = yield (0, repository_1.default)('Transaction');
        const user = yield users.model.findOne({
            where: { id: req.user.id },
            relations: { account: true }
        });
        if (!user) {
            (0, helpers_1.sendResponse)(res, 404, 'User not found');
            return;
        }
        //Check the last withdrawal request
        //If pending and made less that 2 minutes ago, send message for duplicate request
        const lastWithdrawalRequest = yield transactions.model.findOne({
            where: {
                transactionType: 'withdrawal',
                status: 'pending',
                userId: user.id,
                amountInUSD: data.amountInUSD,
                createdAt: (0, typeorm_1.MoreThan)(new Date(Date.now() - 3 * 60 * 1000))
            }
        });
        if (lastWithdrawalRequest) {
            (0, helpers_1.sendResponse)(res, 400, 'Possible duplicate withdrawal request detected. Please, wait a little before proceeding.');
            return;
        }
        // Check if the user has enough balance
        if (user.account.walletBalance < data.amountInUSD) {
            (0, helpers_1.sendResponse)(res, 400, 'Insufficient balance');
            return;
        }
        // Deduct the amount from the wallet balance
        user.account.walletBalance -= data.amountInUSD;
        const { dataSource } = yield (0, database_config_1.initDataSource)();
        yield dataSource.manager.transaction((manager) => __awaiter(void 0, void 0, void 0, function* () {
            // Create and save the transaction
            const transaction = manager.create(transaction_model_1.Transaction, Object.assign(Object.assign({}, data), { userId: user.id, transactionType: 'withdrawal', status: 'pending' }));
            yield manager.save(transaction);
            yield manager.save(user.account);
            alert_event_1.alertEmitter.emit('withdrawal', Object.assign(Object.assign({}, transaction), { user }));
            (0, helpers_1.sendResponse)(res, 200, 'Withdrawal successful');
        }));
    }
    catch (error) {
        console.error(error);
        (0, helpers_1.sendResponse)(res, 500, error.message);
    }
});
exports.createWithdrawal = createWithdrawal;
const createDeposit = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { data } = req.body;
    if (!data || Object.keys(data).length === 0) {
        (0, helpers_1.sendResponse)(res, 400, 'No data provided');
        return;
    }
    if (data.transactionType !== 'deposit') {
        next();
        return;
    }
    try {
        const [users, transactions] = yield Promise.all([
            (0, repository_1.default)('User'),
            (0, repository_1.default)('Transaction')
        ]);
        const user = yield users.model.findOne({
            where: { id: req.user.id },
            relations: { account: true }
        });
        if (!user) {
            (0, helpers_1.sendResponse)(res, 404, 'User not found');
            return;
        }
        const lastDepositRequest = yield transactions.model.findOne({
            where: {
                transactionType: 'deposit',
                status: 'pending',
                userId: user.id,
                amountInUSD: data.amountInUSD,
                createdAt: (0, typeorm_1.MoreThan)(new Date(Date.now() - 3 * 60 * 1000))
            }
        });
        if (lastDepositRequest) {
            (0, helpers_1.sendResponse)(res, 400, 'Possible duplicate deposit request detected. Please, wait a little before proceeding.');
            return;
        }
        const transaction = transactions.model.create(data);
        yield transactions.model.save(transaction);
        alert_event_1.alertEmitter.emit('deposit', Object.assign(Object.assign({}, transaction), { user }));
        (0, helpers_1.sendResponse)(res, 200, 'Deposit request successful');
    }
    catch (error) {
        (0, helpers_1.sendResponse)(res, 500, error.message);
    }
});
exports.createDeposit = createDeposit;
