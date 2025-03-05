"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.alertEmitter = void 0;
const node_events_1 = require("node:events");
const logger_1 = __importDefault(require("../utils/logger"));
const terminate_investment_1 = __importDefault(require("./handlers/terminate-investment"));
const create_investment_1 = __importDefault(require("./handlers/create-investment"));
const update_transaction_status_1 = __importDefault(require("./handlers/update-transaction-status"));
const deposit_1 = __importDefault(require("./handlers/deposit"));
const withdrawal_1 = __importDefault(require("./handlers/withdrawal"));
const distribute_profit_1 = __importDefault(require("./handlers/distribute-profit"));
const close_investment_1 = __importDefault(require("./handlers/close-investment"));
class AlertEmitter extends node_events_1.EventEmitter {
}
exports.default = AlertEmitter;
exports.alertEmitter = new AlertEmitter();
exports.alertEmitter.on('error', (err) => {
    var _a;
    logger_1.default.error(`Mail Emitter Error: ${(_a = err.message) !== null && _a !== void 0 ? _a : err}`, err);
});
exports.alertEmitter.on('update-transaction-status', update_transaction_status_1.default);
exports.alertEmitter.on('terminate-investment', terminate_investment_1.default);
exports.alertEmitter.on('create-investment', create_investment_1.default);
exports.alertEmitter.on('close-investment', close_investment_1.default);
exports.alertEmitter.on('deposit', deposit_1.default);
exports.alertEmitter.on('withdrawal', withdrawal_1.default);
exports.alertEmitter.on('distribute-profit', distribute_profit_1.default);
