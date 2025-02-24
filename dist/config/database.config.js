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
exports.initDataSource = exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const user_model_1 = require("../models/user.model");
const token_model_1 = require("../models/token.model");
const env_1 = __importDefault(require("../utils/env"));
const logger_1 = __importDefault(require("../utils/logger"));
const constants_1 = require("../utils/constants");
const investment_plan_model_1 = require("../models/investment-plan.model");
const investment_model_1 = require("../models/investment.model");
const account_model_1 = require("../models/account.model");
const profit_model_1 = require("../models/profit.model");
const notification_model_1 = require("../models/notification.model");
const transaction_model_1 = require("./../models/transaction.model");
const currency_model_1 = require("../models/currency.model");
const faq_model_1 = require("../models/faq.model");
exports.AppDataSource = new typeorm_1.DataSource({
    type: env_1.default.get('DB_TYPE', 'postgres'),
    host: env_1.default.get('DB_HOST', '127.0.0.1'),
    port: parseInt(env_1.default.get('DB_PORT', '5432')),
    username: env_1.default.get('DB_USER', 'test'),
    password: env_1.default.get('DB_PASSWORD', 'test'),
    database: env_1.default.get('DB_NAME', 'invest_tracker'),
    synchronize: true,
    logging: false,
    entities: [
        user_model_1.User,
        account_model_1.Account,
        token_model_1.Token,
        investment_model_1.Investment,
        investment_plan_model_1.InvestmentPlan,
        profit_model_1.Profit,
        transaction_model_1.Transaction,
        notification_model_1.Notification,
        currency_model_1.Currency,
        faq_model_1.Faq
    ],
    subscribers: [],
    migrations: []
});
if (!constants_1.IS_PRODUCTION_ENV) {
    global._dataSource = exports.AppDataSource;
}
const initDataSource = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!exports.AppDataSource.isInitialized) {
        try {
            yield exports.AppDataSource.initialize();
        }
        catch (error) {
            logger_1.default.error(`Database connection error: ${error}`);
        }
    }
    const model = {
        User: exports.AppDataSource.getRepository(user_model_1.User),
        Account: exports.AppDataSource.getRepository(account_model_1.Account),
        Token: exports.AppDataSource.getRepository(token_model_1.Token),
        Investment: exports.AppDataSource.getRepository(investment_model_1.Investment),
        InvestmentPlan: exports.AppDataSource.getRepository(investment_plan_model_1.InvestmentPlan),
        Profit: exports.AppDataSource.getRepository(profit_model_1.Profit),
        Transaction: exports.AppDataSource.getRepository(transaction_model_1.Transaction),
        Notification: exports.AppDataSource.getRepository(notification_model_1.Notification),
        Currency: exports.AppDataSource.getRepository(currency_model_1.Currency),
        Faq: exports.AppDataSource.getRepository(faq_model_1.Faq)
    };
    return { dataSource: exports.AppDataSource, model };
});
exports.initDataSource = initDataSource;
