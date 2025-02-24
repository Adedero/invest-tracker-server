"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.verifyEmail = exports.sendEmailVerificationToken = void 0;
const helpers_1 = require("../../../utils/helpers");
const repository_1 = __importDefault(require("../../../utils/repository"));
const token_1 = require("../../../utils/token");
const token_model_1 = require("../../../models/token.model");
const jwt = __importStar(require("jsonwebtoken"));
const env_1 = __importDefault(require("../../../utils/env"));
const mail_1 = require("../../../utils/mail");
const handlers_1 = require("../../../utils/handlers");
const typeorm_1 = require("typeorm");
const emails_1 = require("./../../../utils/emails");
const sendEmailVerificationToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, emailSubject } = req.query;
    const { email } = req.body;
    if (!userId) {
        (0, helpers_1.sendResponse)(res, 400, 'Failed to send OTP because the user could not be verified. Try again later');
        return;
    }
    const users = yield (0, repository_1.default)('User');
    const [error, user] = yield users.findOne({
        where: { id: userId },
        relations: { verificationToken: true }
    });
    if (error) {
        (0, helpers_1.sendResponse)(res, 500, error.message);
        return;
    }
    if (!user) {
        (0, helpers_1.sendResponse)(res, 400, 'Your account does not exist or may have been deleted. You may need to register a new account.');
        return;
    }
    let token = user.verificationToken;
    if (!token || (0, token_1.isTokenExpired)(token.expiresIn)) {
        token = token || new token_model_1.Token();
        token.value = (0, token_1.generateToken)(6, 'numeric');
        token.expiresIn = (0, token_1.setTokenExpiry)('1 hour');
        user.verificationToken = token;
        const [error] = yield users.save(user);
        if (error) {
            (0, helpers_1.sendResponse)(res, 500, error.message);
            return;
        }
    }
    const encryptedToken = jwt.sign({ token: token.value }, env_1.default.get('JWT_SECRET'), { expiresIn: '1hr' });
    const emailToVerify = email || user.email;
    const verificationLink = new URL(`auth/email-verification?userId=${user.id}&token=${encryptedToken}&email=${btoa(emailToVerify)}`, env_1.default.get('CLIENT_URL')).href;
    const emailError = yield (0, mail_1.sendEmail)({
        toEmail: emailToVerify,
        subject: (emailSubject === null || emailSubject === void 0 ? void 0 : emailSubject.toString()) || 'Invest Tracker',
        html: (0, emails_1.emailTemplate)({
            subject: (emailSubject === null || emailSubject === void 0 ? void 0 : emailSubject.toString()) || 'Invest Tracker',
            name: user.name,
            intro: `Your one-time password is <div style="font-size: 1.65rem; font-weight: 600; color: #285baa">${token.value}</div>`,
            info: `You can also copy and paste the following link into your browser to complete your request: <div><strong>${verificationLink}</strong></div>`,
            cta: {
                intro: 'Or click the button below',
                href: verificationLink,
                buttonLabel: 'Verify'
            },
            outro: 'The link and OTP expires in 1 hour.',
            footer: 'If you did not recently open an account with us or request for an email change or request a password reset, please ignore this email. Your account is safe and secure.'
        })
    });
    if (emailError) {
        (0, helpers_1.sendResponse)(res, 400, emailError.message);
        return;
    }
    const data = {
        id: user.id,
        name: user.name,
        email: emailToVerify
    };
    (0, helpers_1.sendResponse)(res, 200, data);
    return;
});
exports.sendEmailVerificationToken = sendEmailVerificationToken;
const verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { userId, otp, token } = req.query;
    const { email } = req.body;
    const [users, tokens] = yield Promise.all([
        (0, repository_1.default)('User'),
        (0, repository_1.default)('Token')
    ]);
    if (email) {
        const existingUser = yield users.model.findOne({
            where: { id: (0, typeorm_1.Not)(userId), email }
        });
        if (existingUser) {
            (0, helpers_1.sendResponse)(res, 400, 'This email address is not available');
            return;
        }
    }
    const [error, user] = yield users.findOne({
        where: { id: userId },
        relations: { verificationToken: true }
    });
    if (error) {
        (0, helpers_1.sendResponse)(res, 500, error.message);
        return;
    }
    if (!user) {
        (0, helpers_1.sendResponse)(res, 400, 'Your account does not exist or may have been deleted. You may need to register a new account.');
        return;
    }
    let providedToken = otp === null || otp === void 0 ? void 0 : otp.toString();
    if (!providedToken && token) {
        try {
            const payload = jwt.verify(token.toString(), env_1.default.get('JWT_SECRET'));
            if (!payload || !payload.token) {
                (0, helpers_1.sendResponse)(res, 400, 'Invalid or expired OTP. Try again later');
                return;
            }
            providedToken = payload.token;
        }
        catch (err) {
            if (err.message === 'jwt expired') {
                yield tokens.delete((_a = user.verificationToken) === null || _a === void 0 ? void 0 : _a.id);
                user.verificationToken = null;
                yield users.save(user);
            }
            (0, helpers_1.sendResponse)(res, 400, 'Invalid or expired OTP. Try again later.');
            return;
        }
    }
    if (!user.verificationToken) {
        (0, helpers_1.sendResponse)(res, 400, 'Invalid or expired OTP. Try again later.');
        return;
    }
    if ((0, token_1.isTokenExpired)(user.verificationToken.expiresIn)) {
        (0, helpers_1.sendResponse)(res, 400, 'Invalid or expired OTP. Try again later.');
        return;
    }
    if (providedToken !== user.verificationToken.value) {
        (0, helpers_1.sendResponse)(res, 400, 'Invalid or expired OTP. Check your email and try again, or use the verification link sent to your email.');
        return;
    }
    user.isEmailVerified = true;
    const verifiedEmail = email || user.email;
    user.email = verifiedEmail;
    yield tokens.delete((_b = user.verificationToken) === null || _b === void 0 ? void 0 : _b.id);
    user.verificationToken = null;
    yield users.save(user);
    yield Promise.all([
        (0, handlers_1.createNotification)({
            userId: user.id,
            title: 'Email Verified',
            description: `Your email ${user.email} was successfully verified.`,
            user: user
        }),
        (0, mail_1.sendEmail)({
            toEmail: user.email,
            fromEmail: env_1.default.get('EMAIL_USER'),
            subject: 'Email Verified',
            html: (0, emails_1.emailTemplate)({
                subject: 'Email Verified',
                name: user.name,
                intro: `Your email ${user.email} was successfully verified.`,
                cta: {
                    intro: 'Please, log in to continue on Invest Tracker',
                    buttonLabel: 'Log in',
                    href: `${env_1.default.get('CLIENT_URL')}/auth/login`
                },
                footer: 'You received this email because you completed an email verification process.'
            })
        })
    ]);
    (0, helpers_1.sendResponse)(res, 200, { message: 'Email verified' });
    return;
});
exports.verifyEmail = verifyEmail;
