"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const logger_1 = __importDefault(require("../utils/logger"));
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
function default_1(err, req, res, next) {
    const message = err.message; //IS_PRODUCTION_ENV ? 'Something went wrong' : err.message
    res.status(500).json({ success: false, message });
    logger_1.default.error(`Server Error: ${message}`, err);
    return;
}
