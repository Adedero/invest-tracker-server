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
const helpers_1 = require("../../../utils/helpers");
function default_1(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const Schema = zod_1.z.object({
            fullName: zod_1.z
                .string({ message: 'Full name is required' })
                .min(2, { message: 'Enter a valid name' })
                .trim(),
            email: zod_1.z.string().email({ message: 'Enter a valid email address' }).trim(),
            password1: zod_1.z
                .string()
                .min(8, { message: 'Password must be at least 8 characters' })
                .trim(),
            password2: zod_1.z
                .string()
                .min(8, { message: 'Password must be at least 8 characters' })
                .trim()
        });
        const result = yield Schema.safeParseAsync(req.body);
        if (result.success) {
            const { password1, password2 } = result.data;
            if (password2 !== password1) {
                (0, helpers_1.sendResponse)(res, 400, 'Passwords do not match. Please, confirm your password.');
            }
            next();
            return;
        }
        res.status(400).json({
            success: false,
            message: result.error.errors[0].message
        });
    });
}
