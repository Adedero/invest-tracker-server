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
exports.default = dashboard;
const repository_1 = __importDefault(require("../../../utils/repository"));
const helpers_1 = require("../../../utils/helpers");
const account_model_1 = require("../../../models/account.model");
function dashboard(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const userId = req.user.id;
        const [users, profits] = yield Promise.all([
            (0, repository_1.default)('User'),
            (0, repository_1.default)('Profit')
        ]);
        const [error, user] = yield users.findOne({
            where: { id: userId },
            relations: {
                account: true,
                investments: true
            }
        });
        if (error || !user) {
            (0, helpers_1.sendResponse)(res, error ? 500 : 403, (_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : 'Not authorized');
            return;
        }
        if (!user.account) {
            user.account = new account_model_1.Account();
            yield users.save(user);
        }
        let withdrawableProfit = 0;
        let nonWithdrawableProfit = 0;
        let totalInvestmentDeposit = 0;
        user.investments.forEach((investment) => {
            if (investment.status === 'open') {
                totalInvestmentDeposit += investment.initialDeposit;
                if (investment.autocompounded) {
                    nonWithdrawableProfit += investment.expectedTotalProfit;
                }
                else {
                    withdrawableProfit += investment.expectedTotalProfit;
                }
            }
        });
        const [errorGettingProfits, recentProfits] = yield profits.findAll({
            where: { userId },
            relations: { investment: true },
            take: 20,
            order: { createdAt: "DESC" }
        });
        if (errorGettingProfits) {
            (0, helpers_1.sendResponse)(res, 500, errorGettingProfits.message);
            return;
        }
        const data = {
            walletBalance: user.account.walletBalance,
            totalInvestmentDeposit,
            withdrawableProfit,
            nonWithdrawableProfit,
            recentProfits
        };
        (0, helpers_1.sendResponse)(res, 200, data);
        return;
    });
}
