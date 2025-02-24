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
exports.default = login;
const repository_1 = __importDefault(require("../../../utils/repository"));
const helpers_1 = require("../../../utils/helpers");
const argon = __importStar(require("argon2"));
const jwt = __importStar(require("jsonwebtoken"));
const env_1 = __importDefault(require("../../../utils/env"));
function login(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email, password } = req.body;
        const users = yield (0, repository_1.default)('User');
        const [error, user] = yield users.findOne({
            where: { email },
            select: [
                'id',
                'name',
                'email',
                'password',
                'role',
                'isEmailVerified',
                'image'
            ]
        });
        if (error) {
            (0, helpers_1.sendResponse)(res, 500, error.message);
            return;
        }
        if (!user) {
            (0, helpers_1.sendResponse)(res, 400, 'Incorrect email or password');
            return;
        }
        const isPasswordCorrect = yield argon.verify(user.password, password);
        if (!isPasswordCorrect) {
            (0, helpers_1.sendResponse)(res, 400, 'Incorrect email or password');
            return;
        }
        const jwtPayload = { id: user.id, role: user.role };
        const token = jwt.sign(jwtPayload, env_1.default.get('JWT_SECRET'), { expiresIn: '1h' });
        const responsePayload = {
            success: true,
            message: 'Log in successful',
            user: Object.assign(Object.assign({}, user), { password: undefined, token })
        };
        (0, helpers_1.sendResponse)(res, 200, responsePayload);
    });
}
