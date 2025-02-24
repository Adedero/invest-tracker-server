"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const env_1 = __importDefault(require("../utils/env"));
const corsConfig = (0, cors_1.default)({
    origin: [env_1.default.get('CLIENT_URL')],
    methods: ['GET', 'PATCH', 'POST', 'PUT', 'DELETE']
    //allowedHeaders: ['Content-Type', 'Authorization']
});
exports.default = corsConfig;
