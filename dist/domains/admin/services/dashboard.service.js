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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardData = getDashboardData;
const database_config_1 = require("../../../config/database.config");
const helpers_1 = require("../../../utils/helpers");
function getDashboardData(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { dataSource } = yield (0, database_config_1.initDataSource)();
        const userRepo = dataSource.getRepository('User');
        const ivnRepo = dataSource.getRepository('Investment');
        const txnRepo = dataSource.getRepository('Transaction');
        const curRepo = dataSource.getRepository('Currency');
        const ivnPlanRepo = dataSource.getRepository('InvestmentPlan');
        const [usersCount, adminsCount, openInvestmentsCount, currenciesCount, investmentPlansCount, recentTransactions, recentInvestments] = yield Promise.all([
            userRepo.count({ where: { role: 'user' } }),
            userRepo.count({ where: { role: 'admin' } }),
            ivnRepo.count({ where: { status: 'open' } }),
            curRepo.count(),
            ivnPlanRepo.count(),
            txnRepo.find({ relations: { user: true }, take: 3, order: { createdAt: 'DESC' } }),
            ivnRepo.find({ relations: { user: true }, where: { status: 'open' }, take: 3, order: { createdAt: 'DESC' } })
        ]);
        const data = {
            usersCount,
            adminsCount,
            openInvestmentsCount,
            currenciesCount,
            investmentPlansCount,
            recentTransactions,
            recentInvestments
        };
        (0, helpers_1.sendResponse)(res, 200, data);
    });
}
