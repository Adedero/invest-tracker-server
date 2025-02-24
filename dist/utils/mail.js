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
exports.sendEmail = sendEmail;
const nodemailer_config_1 = require("../config/nodemailer.config");
const env_1 = __importDefault(require("./env"));
const EMAIL_USER = env_1.default.get('EMAIL_USER', 'support@investtrackeer.live');
function sendEmail(options) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const result = yield nodemailer_config_1.transporter.sendMail(Object.assign(Object.assign({ from: EMAIL_USER, to: options.toEmail }, (options.fromEmail && { replyTo: options.fromEmail })), { subject: options.subject, text: (_a = options.text) !== null && _a !== void 0 ? _a : '', html: (_b = options.html) !== null && _b !== void 0 ? _b : '' }));
            if (result.rejected.length > 0) {
                throw new Error(result.response);
            }
            return null;
        }
        catch (err) {
            return err;
        }
    });
}
