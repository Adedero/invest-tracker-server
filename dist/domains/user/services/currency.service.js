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
exports.currencyRate = void 0;
const repository_1 = __importDefault(require("../../../utils/repository"));
const helpers_1 = require("../../../utils/helpers");
const axios_1 = __importDefault(require("axios"));
const env_1 = __importDefault(require("../../../utils/env"));
const COINLAYER_API = env_1.default.get('COINLAYER_API');
const COINLAYER_API_KEY = env_1.default.get('COINLAYER_API_KEY');
const currencyRate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { symbol } = req.params;
    const { amount } = req.query;
    const parsedAmount = Number(amount);
    if (!amount || isNaN(parsedAmount)) {
        (0, helpers_1.sendResponse)(res, 400, 'Invalid or missing amount');
        return;
    }
    const currencies = yield (0, repository_1.default)('Currency');
    const [error, currency] = yield currencies.findOne({
        where: { abbr: symbol.toUpperCase() }
    });
    if (error) {
        (0, helpers_1.sendResponse)(res, 500, error.message);
        return;
    }
    if (!currency) {
        (0, helpers_1.sendResponse)(res, 404, 'Currency not found');
        return;
    }
    const result = parsedAmount / (currency.rate || 1);
    const payload = {
        amount: Number(amount),
        currency,
        result
    };
    const oneDayAgo = new Date().getTime() - 24 * 60 * 60 * 1000;
    const updatedAt = currency.rateUpdatedAt ? new Date(currency.rateUpdatedAt).getTime() : null;
    if (updatedAt && updatedAt >= oneDayAgo) {
        (0, helpers_1.sendResponse)(res, 200, payload);
        return;
    }
    let data = {};
    const uri = `${COINLAYER_API}/live?access_key=${COINLAYER_API_KEY}&target=USD&symbols=${currency.abbr.toUpperCase()}`;
    try {
        const response = yield axios_1.default.get(uri);
        data = response.data;
        if (data.error) {
            (0, helpers_1.sendResponse)(res, 200, payload);
            return;
        }
        const rate = data.rates[currency.abbr.toUpperCase()];
        if (rate) {
            currency.rate = rate !== null && rate !== void 0 ? rate : currency.rate;
            currency.rateUpdatedAt = new Date();
            yield currencies.save(currency);
            payload.currency.rate = rate;
            payload.result = parsedAmount / rate;
        }
        (0, helpers_1.sendResponse)(res, 200, payload);
    }
    catch (error) {
        (0, helpers_1.sendResponse)(res, 500, error.message);
        return;
    }
});
exports.currencyRate = currencyRate;
