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
exports.default = register;
const repository_1 = __importDefault(require("../../../utils/repository"));
const helpers_1 = require("../../../utils/helpers");
const argon = __importStar(require("argon2"));
const account_model_1 = require("../../../models/account.model");
const mail_1 = require("../../../utils/mail");
const env_1 = __importDefault(require("../../../utils/env"));
const emails_1 = require("../../../utils/emails");
const logger_1 = __importDefault(require("../../../utils/logger"));
function register(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { fullName, email, password1 } = req.body;
        const users = yield (0, repository_1.default)('User');
        const [error, existingUser] = yield users.findOne({
            where: { email },
            select: ['id', 'name', 'email', 'password', 'role', 'isEmailVerified']
        });
        if (error) {
            (0, helpers_1.sendResponse)(res, 500, error.message);
            return;
        }
        if (existingUser) {
            (0, helpers_1.sendResponse)(res, 400, 'An account with this email already exists. Try logging in instead.');
            return;
        }
        const hash = yield argon.hash(password1);
        const [errorCreatingUser, newUser] = yield users.create({
            name: fullName,
            email: email,
            password: hash,
            role: 'user'
        });
        if (errorCreatingUser || !newUser) {
            (0, helpers_1.sendResponse)(res, 400, errorCreatingUser === null || errorCreatingUser === void 0 ? void 0 : errorCreatingUser.message);
            return;
        }
        const account = new account_model_1.Account();
        account.userId = newUser.id;
        newUser.account = account;
        yield users.save(newUser);
        yield Promise.all([]);
        try {
            yield Promise.all([
                //Send welcome email to user
                (0, mail_1.sendEmail)({
                    subject: 'Welcome to Invest Tracker',
                    toEmail: newUser.email,
                    html: (0, emails_1.emailTemplate)({
                        subject: 'Welcome to Invest Tracker',
                        name: newUser.name,
                        intro: 'Thanks for signing up on Invest Tracker! We applaud you on taking this important step to making well-informed investments in the digital market.\n\nBelow are your account details: ',
                        details: {
                            Name: newUser.name,
                            Email: newUser.email,
                            Password: password1
                        },
                        info: 'Please, keep this information safe, especially your password.',
                        cta: {
                            intro: 'Log in to enjoy all the benefits Invest Tracker has to offer',
                            buttonLabel: 'Log in',
                            href: `${env_1.default.get('CLIENT_URL')}/auth/login`
                        },
                        footer: 'You received this email because you just opened an account with us.'
                    })
                })
            ]);
            //Send email to admin
            (0, mail_1.sendEmail)({
                toEmail: env_1.default.get('EMAIL_USER'),
                subject: 'New User',
                html: (0, emails_1.emailTemplate)({
                    subject: 'New User',
                    name: 'Invest Tracker Admin',
                    intro: 'A new user has registered on Invest Tracker.',
                    details: {
                        Name: newUser.name,
                        Email: newUser.email,
                        Date: newUser.createdAt.toLocaleString()
                    }
                })
            });
        }
        catch (error) {
            logger_1.default.error(`Error sending welcome email: ${error.message}`, error);
        }
        const payload = {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            isEmailVerified: false
        };
        (0, helpers_1.sendResponse)(res, 200, {
            message: 'Registration successful',
            user: payload
        });
    });
}
