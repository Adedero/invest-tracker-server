"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = __importDefault(require("./auth.controller"));
const login_validator_1 = __importDefault(require("./validators/login.validator"));
const register_validator_1 = __importDefault(require("./validators/register.validator"));
const verify_email_validator_1 = __importDefault(require("./validators/verify-email.validator"));
const handlers_1 = require("../../utils/handlers");
const router = (0, express_1.Router)();
router.post('/login', login_validator_1.default, auth_controller_1.default.login);
router.post('/register', register_validator_1.default, auth_controller_1.default.register);
router.post('/email-verification-token', auth_controller_1.default.sendEmailVerificationToken);
router.post('/verify-email', verify_email_validator_1.default, auth_controller_1.default.verifyEmail);
router.get('/check-user', auth_controller_1.default.checkIfUserExists);
router.post('/password-reset', auth_controller_1.default.resetPassword);
//Users
router.get('/users/:id?', (0, handlers_1.getHandler)('User'));
exports.default = router;
