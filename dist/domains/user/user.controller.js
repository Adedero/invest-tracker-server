"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const contact_service_1 = require("./services/contact.service");
const currency_service_1 = require("./services/currency.service");
const dashboard_1 = __importDefault(require("./services/pages/dashboard"));
const wallet_1 = require("./services/pages/wallet");
exports.default = {
    dashboardPage: dashboard_1.default,
    walletPage: wallet_1.walletPage,
    currencyRate: currency_service_1.currencyRate,
    contact: contact_service_1.contact
};
