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
exports.default = onDistributeProfit;
const logger_1 = __importDefault(require("../../utils/logger"));
const emails_1 = require("../../utils/emails");
const env_1 = __importDefault(require("../../utils/env"));
const handlers_1 = require("../../utils/handlers");
const mail_1 = require("../../utils/mail");
function onDistributeProfit(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const { investment, profit, user } = data;
        try {
            const subject = 'Daily Return on Investment';
            const message = (name) => {
                if (name) {
                    return `You received a daily return of $${profit.amount.toLocaleString()} on your investment ${investment.investmentName} (${investment.investmentTier} Tier).`;
                }
                else {
                    return `${user.name} received a daily return of $${profit.amount.toLocaleString()} on their investment ${investment.investmentName} (${investment.investmentTier} Tier).`;
                }
            };
            const html = (name) => {
                return (0, emails_1.emailTemplate)({
                    subject,
                    name: name || 'Invest Tracker Admin',
                    intro: message(name),
                    details: {
                        Investment: investment.investmentName,
                        Tier: investment.investmentTier,
                        'Today\'s Return': `$${profit.amount.toLocaleString()}`,
                        'Days Completed': `${investment.daysCompleted} / ${investment.duration}`,
                        'Total Returns': `$${investment.currentTotalReturns.toLocaleString()}`
                    },
                    footer: 'This message was sent from Invest Tracker because a daily return was distributed.'
                });
            };
            yield Promise.all([
                (0, handlers_1.createNotification)({
                    userId: user.id,
                    title: subject,
                    description: message(user.name),
                    user: user
                }),
                (0, mail_1.sendEmail)({ toEmail: user.email, subject, html: html(user.name) }),
                (0, mail_1.sendEmail)({ toEmail: env_1.default.get('EMAIL_USER'), subject, html: html() })
            ]);
        }
        catch (error) {
            logger_1.default.error(`Error sending profit distribution alerts: ${error.message || error}`, error);
        }
    });
}
