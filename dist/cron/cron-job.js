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
exports.job = void 0;
const cron_1 = require("cron");
const profit_service_1 = require("../domains/user/services/profit.service");
const logger_1 = __importDefault(require("../utils/logger"));
exports.job = new cron_1.CronJob('0 * * * *', // Runs at the start of every hour
function () {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, profit_service_1.distributeProfit)();
        logger_1.default.info('Profit Distributed');
    });
}, null, // onComplete
true);
