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
exports.default = onWithdrawal;
const emails_1 = require("../../utils/emails");
const env_1 = __importDefault(require("../../utils/env"));
const handlers_1 = require("../../utils/handlers");
const mail_1 = require("../../utils/mail");
function onWithdrawal(txn) {
    return __awaiter(this, void 0, void 0, function* () {
        const subject = 'New Withdrawal Request';
        const message = (name) => {
            if (name) {
                return `You initiated a withdrawal request of $${txn.amountInUSD.toLocaleString()} into your wallet.`;
            }
            else {
                return `A new withdrawal request of $${txn.amountInUSD.toLocaleString()} was initiated by ${txn.user.name}.`;
            }
        };
        const html = (name) => {
            return (0, emails_1.emailTemplate)({
                subject,
                name: name || 'Invest Tracker Admin',
                intro: message(name),
                details: {
                    Amount: `$${txn.amountInUSD.toLocaleString()}`,
                    Charge: `$${txn.charge.toLocaleString()}`,
                    'Actual amount to be withdrawn': `$${txn.actualAmountInUSD.toLocaleString()}`,
                    'Selected currency': txn.currency,
                    Rate: `$${txn.rate}`,
                    'Amount in the selected currency': `${txn.amountInCurrency} ${txn.currency}`,
                    'Deposited To Wallet Address': txn.depositWalletAddress,
                    'Provided Wallet Address': txn.withdrawalWalletAddress,
                    Network: txn.withdrawalWalletNetwork,
                    Status: txn.status
                },
                info: `The withdrawal request will be processed within 24 hours. ${name ? `Please contact us if the amount is not credited to your wallet after then.` : ''}`,
                footer: 'This email was sent because a withdrawal request was initiated.'
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
