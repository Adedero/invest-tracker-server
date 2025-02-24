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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const zod_1 = require("zod");
function default_1(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const Schema = zod_1.z.object({
            email: zod_1.z
                .string({ message: 'Email is required' })
                .email({ message: 'Please enter a valid email address' }),
            password: zod_1.z
                .string({ message: 'Password is required' })
                .min(8, { message: 'Password must be at least 8 characters long' })
        });
        const result = yield Schema.safeParseAsync(req.body);
        if (result.success) {
            next();
            return;
        }
        res.status(400).json({
            success: false,
            message: result.error.errors[0].message
        });
    });
}
