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
exports.default = onDeposit;
const emails_1 = require("../../utils/emails");
const env_1 = __importDefault(require("../../utils/env"));
const handlers_1 = require("../../utils/handlers");
const mail_1 = require("../../utils/mail");
function onDeposit(txn) {
    return __awaiter(this, void 0, void 0, function* () {
        const subject = 'New Deposit Request';
        const message = (name) => {
            if (name) {
                return `You initiated a deposit request of $${txn.amountInUSD.toLocaleString()} into your wallet.`;
            }
            else {
                return `A new deposit request of $${txn.amountInUSD.toLocaleString()} was initiated by ${txn.user.name}.`;
            }
        };
        const html = (name) => {
            return (0, emails_1.emailTemplate)({
                subject,
                name: name || 'Invest Tracker Admin',
                intro: message(name),
                details: Object.assign(Object.assign({ Amount: `$${txn.amountInUSD.toLocaleString()}`, Medium: txn.isWireTransfer ? 'Wire Transfer' : txn.currency }, (!txn.isWireTransfer && {
                    Rate: `$${txn.rate}`,
                    'Amount In Selected Currency': `${txn.amountInCurrency} ${txn.currency}`,
                    'Deposited To Wallet Address': txn.depositWalletAddress
                })), { Status: txn.status }),
                info: txn.isWireTransfer
                    ? 'The deposit request has been submitted and the details of the wire transfer will emailed shortly.'
                    : 'The deposit request will be processed within 24 hours.',
                footer: 'This email was sent because a deposit request was initiated.'
            });
        };
        yield Promise.all([
            (0, handlers_1.createNotification)({
                userId: txn.userId,
                title: subject,
                description: message(txn.user.name),
                user: txn.user
            }),
            (0, mail_1.sendEmail)({ toEmail: txn.user.email, subject, html: html(txn.user.name) }),
            (0, mail_1.sendEmail)({ toEmail: env_1.default.get('EMAIL_USER'), subject, html: html() })
        ]);
    });
}
