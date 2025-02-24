"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = __importDefault(require("./../utils/env"));
const constants_1 = require("../utils/constants");
const EMAIL_USER = env_1.default.get('EMAIL_USER');
const EMAIL_HOST = env_1.default.get('EMAIL_HOST');
const EMAIL_SERVICE = env_1.default.get('EMAIL_SERVICE');
const EMAIL_PASSWORD = env_1.default.get('EMAIL_PASSWORD');
exports.transporter = nodemailer_1.default.createTransport(Object.assign(Object.assign({}, (!constants_1.IS_PRODUCTION_ENV && { service: EMAIL_SERVICE })), { host: EMAIL_HOST, port: 465, secure: true, auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD
    } }));
