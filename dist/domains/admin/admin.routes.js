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
// admin.routes.ts
const express_1 = require("express");
//import AdminController from './admin.controller'
const handlers_1 = require("../../utils/handlers");
const argon2_1 = require("argon2");
const transaction_service_1 = require("./services/transaction.service");
const investment_service_1 = require("./services/investment.service");
const dashboard_service_1 = require("./services/dashboard.service");
const repository_1 = __importDefault(require("../../utils/repository"));
const alert_event_1 = require("../../events/alert.event");
const logger_1 = __importDefault(require("../../utils/logger"));
const router = (0, express_1.Router)();
router.get('/dashboard', dashboard_service_1.getDashboardData);
//Utitlites
router.post('/email', handlers_1.emailHandler);
//Users
router.get('/users/:id?', (0, handlers_1.getHandler)('User'));
router.post('/users', (0, handlers_1.postHandler)('User'));
router.put('/users/:id', (0, handlers_1.putHandler)('User', {
    onBeforeUpdate: (ctx, data) => __awaiter(void 0, void 0, void 0, function* () {
        const password = data.password;
        if (password) {
            const h = yield (0, argon2_1.hash)(password);
            data.password = h;
            return data;
        }
        return data;
    })
}));
router.delete('/users/:id', (0, handlers_1.deleteHandler)('User'));
router.get('/count/users', (0, handlers_1.countHandler)('User'));
//Accounts
router.get('/accounts/:id?', (0, handlers_1.getHandler)('Account'));
router.post('/accounts', (0, handlers_1.postHandler)('Account'));
router.put('/accounts/:id', (0, handlers_1.putHandler)('Account'));
//router.delete('/accounts/:id', deleteHandler('Account'))
//Investments
router.get('/investments/:id?', (0, handlers_1.getHandler)('Investment'));
router.patch('/investments/:id', investment_service_1.terminateInvestment);
router.put('/investments/:id', (0, handlers_1.putHandler)('Investment', {
    onBeforeUpdate: (ctx, data) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = ctx.req.params;
        const { isPausing, status } = data;
        if (isPausing === undefined || isPausing === null || !status) {
            delete data.isPausing;
            return data;
        }
        try {
            const investment = yield (yield (0, repository_1.default)('Investment')).model.findOne({ where: { id }, relations: { user: true } });
            if (!investment) {
                delete data.isPausing;
                return data;
            }
            alert_event_1.alertEmitter.emit('toggle-investment-pause', Object.assign(Object.assign({}, investment), { pausedReason: data.pausedReason }));
        }
        catch (error) {
            logger_1.default.error(`Error toggling investment pause: ${error.message}`, error);
        }
        delete data.isPausing;
        return data;
    })
}));
//Transactions
router.get('/transactions/:id?', (0, handlers_1.getHandler)('Transaction'));
router.put('/transactions/:id', (0, handlers_1.putHandler)('Transaction'));
router.put('/transaction-status/:id', transaction_service_1.updateTransaction);
//Investment Plans
router.get('/investment-plans/:id?', (0, handlers_1.getHandler)('InvestmentPlan'));
router.post('/investment-plans', (0, handlers_1.postHandler)('InvestmentPlan'));
router.put('/investment-plans/:id', (0, handlers_1.putHandler)('InvestmentPlan'));
router.delete('/investment-plans/:id', (0, handlers_1.deleteHandler)('InvestmentPlan'));
//Currencies
router.get('/currencies/:id?', (0, handlers_1.getHandler)('Currency'));
router.post('/currencies', (0, handlers_1.postHandler)('Currency'));
router.put('/currencies/:id', (0, handlers_1.putHandler)('Currency'));
router.delete('/currencies/:id', (0, handlers_1.deleteHandler)('Currency'));
//FAQs
router.get('/faqs/:id?', (0, handlers_1.getHandler)('Faq'));
router.post('/faqs', (0, handlers_1.postHandler)('Faq'));
router.put('/faqs/:id', (0, handlers_1.putHandler)('Faq'));
router.delete('/faqs/:id', (0, handlers_1.deleteHandler)('Faq'));
//Notifications
router.get('/notifications/:id?', (0, handlers_1.getHandler)('Notification'));
router.post('/notifications', (0, handlers_1.postHandler)('Notification'));
router.put('/notifications', (0, handlers_1.putHandler)('Notification'));
router.delete('/notifications/:id?', (0, handlers_1.deleteHandler)('Notification'));
exports.default = router;
