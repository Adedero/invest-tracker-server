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
exports.default = onCreateInvestment;
const emails_1 = require("../../utils/emails");
const env_1 = __importDefault(require("../../utils/env"));
const handlers_1 = require("../../utils/handlers");
const logger_1 = __importDefault(require("../../utils/logger"));
const mail_1 = require("../../utils/mail");
function onCreateInvestment(investment) {
    return __awaiter(this, void 0, void 0, function* () {
        const subject = 'New Investment';
        const message = (name) => `A new ${investment.investmentName} (${investment.investmentTier} Tier) was started by ${name ? 'you' : investment.user.name} with an initial deposit of $${investment.initialDeposit.toLocaleString()}`;
        const html = (name) => {
            return (0, emails_1.emailTemplate)({
                subject,
                name: name || 'Invest Tracker Admin',
                intro: message(name),
                details: {
                    'Investment Name': investment.investmentName,
                    Tier: investment.investmentTier,
                    Deposit: `$${investment.initialDeposit.toLocaleString()}`,
                    Duration: `${investment.duration} days`
                },
                info: investment.autocompounded
                    ? `This investment is autocompounded. The returns from this investment will only be added to ${name ? 'your' : "the client's"} account balance upon completion or termination of the investment`
                    : `This investment is not autocompounded. The daily returns from this investment will be added to ${name ? 'your' : "the client's"} account balance daily.`,
                footer: 'This message was sent from Invest Tracker because a new investment was started.'
            });
        };
        try {
            yield Promise.all([
                (0, handlers_1.createNotification)({
                    userId: investment.user.id,
                    title: subject,
                    description: message(investment.user.name),
                    user: investment.user
                }),
                (0, mail_1.sendEmail)({
                    toEmail: investment.user.email,
                    subject,
                    html: html(investment.user.name)
                }),
                (0, mail_1.sendEmail)({ toEmail: env_1.default.get('EMAIL_USER'), subject, html: html() })
            ]);
        }
        catch (error) {
            logger_1.default.error(`Error sending investment creation alerts: ${error.message}`, error);
        }
    });
}
