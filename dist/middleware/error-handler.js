"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
//import { IS_PRODUCTION_ENV } from '../utils/constants'
const logger_1 = __importDefault(require("../utils/logger"));
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
function default_1(err, req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
next) {
    const message = err.message; //IS_PRODUCTION_ENV ? 'Something went wrong' : err.message
    logger_1.default.error(`Server Error: ${message}`, err);
    res.status(500).json({ success: false, message });
    return;
}
