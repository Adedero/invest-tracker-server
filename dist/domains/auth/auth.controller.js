"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const email_verification_1 = require("./services/email-verification");
const login_1 = __importDefault(require("./services/login"));
const password_reset_1 = require("./services/password-reset");
const register_1 = __importDefault(require("./services/register"));
exports.default = {
    login: login_1.default,
    register: register_1.default,
    sendEmailVerificationToken: email_verification_1.sendEmailVerificationToken,
    verifyEmail: email_verification_1.verifyEmail,
    resetPassword: password_reset_1.resetPassword,
    checkIfUserExists: password_reset_1.checkIfUserExists
};
