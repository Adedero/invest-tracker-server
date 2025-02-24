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
Object.defineProperty(exports, "__esModule", { value: true });
exports.contact = void 0;
const helpers_1 = require("../../../utils/helpers");
const mail_1 = require("../../../utils/mail");
const emails_1 = require("../../../utils/emails");
const contact = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
        (0, helpers_1.sendResponse)(res, 400, 'No name, email or message provided');
        return;
    }
    const error = yield (0, mail_1.sendEmail)({
        toEmail: email,
        subject,
        html: (0, emails_1.emailTemplate)({
            subject: 'Support Request',
            name: 'Invest Tracker Admin',
            intro: 'You have received a support request',
            details: {
                'Name': name,
                'Email': email,
                'Subject': subject,
                'Message': message
            }
        })
    });
    if (error) {
        (0, helpers_1.sendResponse)(res, 500, error.message);
        return;
    }
    (0, helpers_1.sendResponse)(res, 200, 'Message delivered');
});
exports.contact = contact;
