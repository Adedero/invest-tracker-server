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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_jwt_1 = require("passport-jwt");
const env_1 = __importDefault(require("../utils/env"));
const repository_1 = __importDefault(require("../utils/repository"));
const JWT_SECRET = env_1.default.get('JWT_SECRET', 'jwt-secret');
const jwtOptions = {
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET
};
passport_1.default.use(new passport_jwt_1.Strategy(jwtOptions, (payload, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const User = yield (0, repository_1.default)('User');
        const [error, user] = yield User.findOne({
            where: { id: payload.id }
        });
        if (error)
            throw error;
        if (!user)
            return done(null, false);
        //Add more fields as needed
        const authenticatedUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };
        return done(null, authenticatedUser);
    }
    catch (err) {
        return done(err, false);
    }
})));
exports.default = passport_1.default;
