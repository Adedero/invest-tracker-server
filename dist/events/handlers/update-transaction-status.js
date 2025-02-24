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
exports.default = onUpdateTransactionStatus;
const emails_1 = require("../../utils/emails");
const env_1 = __importDefault(require("../../utils/env"));
const handlers_1 = require("../../utils/handlers");
const helpers_1 = require("../../utils/helpers");
const logger_1 = __importDefault(require("../../utils/logger"));
const mail_1 = require("../../utils/mail");
function onUpdateTransactionStatus(txn) {
    return __awaiter(this, void 0, void 0, function* () {
        const subject = 'Transaction Status Updated';
        const message = (name) => txn.status === 'failed'
            ? `The ${txn.transactionType} request with transaction ID ${txn.id} failed ${txn.failureReason ? `with reason: ${txn.failureReason}` : 'without reason'}.\n${txn.transactionType === 'withdrawal' && name ? `$${txn.actualAmountInUSD.toLocaleString()} has been refunded to your wallet.` : ''}`
            : `The ${txn.transactionType} request with transaction ID ${txn.id} has been approved.\n${txn.transactionType === 'withdrawal' && name ? `Your wallet has been credited with $${txn.amountInUSD.toLocaleString()}.` : ''}`;
        const html = (name) => {
            const CLIENT_URL = env_1.default.get('CLIENT_URL');
            return (0, emails_1.emailTemplate)({
                subject,
                name: name !== null && name !== void 0 ? name : 'Invest Tracker Admin',
                intro: message(name),
                details: Object.assign({ Amount: `$${txn.amountInUSD.toLocaleString()}`, Type: (0, helpers_1.toTitleCase)(txn.transactionType), Status: (0, helpers_1.toTitleCase)(txn.status) }, (txn.status === 'failed' && {
                    'Reason For Failure': txn.failureReason
                })),
                cta: {
                    intro: 'Click the button to view the details of the transaction.',
                    buttonLabel: 'View Transaction',
                    href: name
                        ? `${CLIENT_URL}/user/wallet/transaction/${txn.id}`
                        : `${CLIENT_URL}/admin/transactions/${txn.id}`
                },
                outro: `This message was sent from Invest Tracker because of an update was made to a transaction with ID ${txn.id}`
            });
        };
        try {
            yield Promise.all([
                (0, handlers_1.createNotification)({
                    userId: txn.user.id,
                    title: subject,
                    description: message(txn.user.name),
                    user: txn.user
                }),
                (0, mail_1.sendEmail)({ toEmail: env_1.default.get('EMAIL_USER'), subject, html: html() }),
                (0, mail_1.sendEmail)({ toEmail: txn.user.email, subject, html: html(txn.user.name) })
            ]);
        }
        catch (error) {
            logger_1.default.error(`Error sending investment termination alerts: ${error.message}`, error);
        }
    });
}
