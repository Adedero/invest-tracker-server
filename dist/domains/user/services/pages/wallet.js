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
exports.walletPage = void 0;
const repository_1 = __importDefault(require("../../../../utils/repository"));
const helpers_1 = require("../../../../utils/helpers");
const walletPage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const userId = req.user.id;
    const [users, profits, transactions] = yield Promise.all([
        (0, repository_1.default)('User'),
        (0, repository_1.default)('Profit'),
        (0, repository_1.default)('Transaction')
    ]);
    const [user, latestProfit, userTransactions] = yield Promise.all([
        users.model.findOne({
            where: { id: userId },
            relations: { account: true }
        }),
        profits.model.findOne({ where: { userId }, order: { createdAt: 'DESC' } }),
        transactions.model.find({
            where: { userId },
            take: 20,
            order: { createdAt: 'DESC' }
        })
    ]);
    (0, helpers_1.sendResponse)(res, 200, {
        walletBalance: (_b = (_a = user === null || user === void 0 ? void 0 : user.account) === null || _a === void 0 ? void 0 : _a.walletBalance) !== null && _b !== void 0 ? _b : 0,
        profit: latestProfit,
        transactions: userTransactions
    });
});
exports.walletPage = walletPage;
