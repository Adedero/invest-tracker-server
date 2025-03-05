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
exports.default = onCloseInvestment;
const emails_1 = require("../../utils/emails");
const env_1 = __importDefault(require("../../utils/env"));
const handlers_1 = require("../../utils/handlers");
const logger_1 = __importDefault(require("../../utils/logger"));
const mail_1 = require("../../utils/mail");
function onCloseInvestment(investment) {
    return __awaiter(this, void 0, void 0, function* () {
        const subject = 'Investment Closure';
        const message = (name) => `${name ? 'Your' : `${investment.user.name}'s`} investment on ${investment.investmentName} plan, ${investment.investmentTier} tier has completed its duration and is now closed.`;
        const html = (name) => {
            return (0, emails_1.emailTemplate)({
                subject,
                name: name || 'Invest Tracker Admin',
                intro: message(name),
                details: {
                    'Investment Name': investment.investmentName,
                    Tier: investment.investmentTier,
                    Deposit: `$${investment.initialDeposit.toLocaleString()}`,
                    Duration: `${investment.duration} days`,
                    'Total Returns': `$${investment.currentTotalReturns.toLocaleString()}`
                },
                info: investment.autocompounded
                    ? `This investment was autocompounded. The returns from this investment have been added to ${name ? 'your' : "the client's"} account balance.`
                    : `This investment was not autocompounded. The returns from this investment were added daily to ${name ? 'your' : "the client's"} account balance.`,
                footer: 'This message was sent from Invest Tracker because an investment was closed.'
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
            logger_1.default.error(`Error sending investment closure alerts: ${error.message}`, error);
        }
    });
}
