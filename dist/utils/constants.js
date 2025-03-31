"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOGIN_SESSION_DURATION = exports.IS_PRODUCTION_ENV = void 0;
exports.IS_PRODUCTION_ENV = process.env.NODE_ENV === 'production';
exports.LOGIN_SESSION_DURATION = '4h';
