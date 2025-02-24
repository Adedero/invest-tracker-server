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
exports.resetPassword = exports.checkIfUserExists = void 0;
const helpers_1 = require("../../../utils/helpers");
const repository_1 = __importDefault(require("../../../utils/repository"));
const token_1 = require("../../../utils/token");
const jwt = __importStar(require("jsonwebtoken"));
const env_1 = __importDefault(require("../../../utils/env"));
const argon = __importStar(require("argon2"));
const mail_1 = require("../../../utils/mail");
const handlers_1 = require("../../../utils/handlers");
const emails_1 = require("../../../utils/emails");
const checkIfUserExists = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { field, value } = req.query;
    if (!field || !value) {
        (0, helpers_1.sendResponse)(res, 400, 'Bad request');
        return;
    }
    const users = yield (0, repository_1.default)('User');
    const parsedField = field.toString();
    const parsedValue = value.toString();
    const [error, user] = yield users.findOne({
        where: {
            [parsedField]: parsedValue
        },
        select: ['id']
    });
    if (error) {
        (0, helpers_1.sendResponse)(res, 500, error.message);
        return;
    }
    const userExists = !!user;
    (0, helpers_1.sendResponse)(res, 200, { userExists, userId: (user === null || user === void 0 ? void 0 : user.id) || null });
});
exports.checkIfUserExists = checkIfUserExists;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { userId, otp, token } = req.query;
    const { password } = req.body;
    if (!password) {
        (0, helpers_1.sendResponse)(res, 400, 'No password provided');
        return;
    }
    if (password.length < 8) {
        (0, helpers_1.sendResponse)(res, 400, 'Password must be at least 8 characters long');
        return;
    }
    const [users, tokens] = yield Promise.all([
        (0, repository_1.default)('User'),
        (0, repository_1.default)('Token')
    ]);
    const [error, user] = yield users.findOne({
        where: { id: userId },
        relations: { verificationToken: true },
        select: ['id', 'password', 'name', 'email']
    });
    if (error) {
        (0, helpers_1.sendResponse)(res, 500, error.message);
        return;
    }
    if (!user) {
        (0, helpers_1.sendResponse)(res, 400, 'Your account does not exist or may have been deleted. You may need to register a new account.');
        return;
    }
    const isOldPassword = yield argon.verify(user.password, password);
    if (isOldPassword) {
        (0, helpers_1.sendResponse)(res, 400, 'New password cannot be the same as the old password');
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
    const hash = yield argon.hash(password);
    user.password = hash;
    yield tokens.delete((_b = user.verificationToken) === null || _b === void 0 ? void 0 : _b.id);
    user.verificationToken = null;
    yield users.save(user);
    yield Promise.all([
        (0, handlers_1.createNotification)({
            userId: user.id,
            title: 'Password Reset',
            description: 'Your password has been reset successfully. If you did not initiate this action, contact us immediately.',
            user: user
        }),
        (0, mail_1.sendEmail)({
            toEmail: user.email,
            fromEmail: env_1.default.get('EMAIL_USER'),
            subject: 'Password Reset',
            html: (0, emails_1.emailTemplate)({
                subject: 'Password Reset',
                name: user.name,
                intro: 'Your password has been successfully reset.',
                cta: {
                    intro: 'Please, log in to continue on Invest Tracker',
                    buttonLabel: 'Log in',
                    href: `${env_1.default.get('CLIENT_URL')}/auth/login`
                },
                outro: '<span style="color: red">If you did not initiate a password reset, please contact us immediately by replying to this email.</span>',
                footer: 'You received this email because you completed a password reset.'
            })
        })
    ]);
    (0, helpers_1.sendResponse)(res, 200, { message: 'Password reset complete' });
    return;
});
exports.resetPassword = resetPassword;
