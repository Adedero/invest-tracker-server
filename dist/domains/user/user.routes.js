"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = __importDefault(require("./user.controller"));
const handlers_1 = require("../../utils/handlers");
const transaction_service_1 = require("./services/transaction.service");
const investment_service_1 = require("./services/investment.service");
const router = (0, express_1.Router)();
router.get('/pages/dashboard', user_controller_1.default.dashboardPage);
router.get('/pages/wallet', user_controller_1.default.walletPage);
//User
router.get('/users/:id?', (0, handlers_1.getHandler)('User'));
router.put('/users/:id', (0, handlers_1.putHandler)('User'));
router.put('/change-password/:id', handlers_1.changePasswordHandler);
router.put('/reset-password');
router.post('/contact', user_controller_1.default.contact);
//Account
router.get('/accounts/:id', (0, handlers_1.getHandler)('Account'));
router.put('/accounts/:id', (0, handlers_1.putHandler)('Account'));
//Transactions
router.get('/transactions/:id?', (0, handlers_1.getHandler)('Transaction')); //Get all transactions or one
router.post('/transactions', transaction_service_1.createWithdrawal, transaction_service_1.createDeposit, (0, handlers_1.postHandler)('Transaction'));
//Currency
router.get('/currencies', (0, handlers_1.getHandler)('Currency')); //Get currencies
router.get('/currency-rate/:symbol', user_controller_1.default.currencyRate);
//Investments
router.get('/investments/:id?', (0, handlers_1.getHandler)('Investment'));
router.post('/investments', investment_service_1.createInvestment);
router.get('/investment-plans/:id?', (0, handlers_1.getHandler)('InvestmentPlan'));
router.put('/terminate-investment/:id', investment_service_1.terminateInvestment);
//Notifications
router.get('/notifications', (0, handlers_1.getHandler)('Notification'));
router.put('/notifications', (0, handlers_1.putHandler)('Notification'));
router.delete('/notifications/:id?', (0, handlers_1.deleteHandler)('Notification'));
//FAQs
router.get('/faqs/:id?', (0, handlers_1.getHandler)('Faq'));
exports.default = router;
