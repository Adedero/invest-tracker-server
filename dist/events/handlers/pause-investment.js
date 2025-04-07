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
exports.default = onToggleInvestmentPause;
const emails_1 = require("../../utils/emails");
const env_1 = __importDefault(require("../../utils/env"));
const handlers_1 = require("../../utils/handlers");
const logger_1 = __importDefault(require("../../utils/logger"));
const mail_1 = require("../../utils/mail");
function onToggleInvestmentPause(investment) {
    return __awaiter(this, void 0, void 0, function* () {
        const message = `The investment ${investment.investmentName} (${investment.investmentTier} Tier) ${investment.status === 'paused' ? 'has been resumed.' : 'was paused by the Invest Tracker admin ' + (investment.pausedReason ? ` with reason: ${investment.pausedReason}` : '')}`;
        const subject = investment.status === 'paused' ? 'Resumption of Investment' : 'Pause of Investment';
        const html = (name) => {
            return (0, emails_1.emailTemplate)({
                subject,
                name,
                intro: message,
                details: Object.assign(Object.assign({ 'Investment Name': investment.investmentName, Tier: investment.investmentTier, 'Status': investment.status === 'paused' ? 'Open' : 'Paused' }, (investment.status === 'open' && !!investment.pausedReason && {
                    'Reason for Pause': investment.pausedReason
                })), { 'Total Returns': `$${investment.currentTotalReturns.toLocaleString()}` }),
                footer: `This message was sent from Invest Tracker because an investment was ${investment.status === 'paused' ? 'resumed' : 'paused'}.`
            });
        };
        try {
            yield (0, handlers_1.createNotification)({
                userId: investment.user.id,
                title: subject,
                description: message,
                user: investment.user
            });
            //Email to be sent to admin and user
            yield Promise.all([
                (0, mail_1.sendEmail)({
                    subject,
                    toEmail: env_1.default.get('EMAIL_USER'),
                    html: html('Invest Tracker Admin')
                }),
                (0, mail_1.sendEmail)({
                    subject,
                    toEmail: investment.user.email,
                    html: html(investment.user.name)
                })
            ]);
        }
        catch (error) {
            logger_1.default.error(`Error sending investment pause toggle alerts: ${error.message}`, error);
        }
    });
}
