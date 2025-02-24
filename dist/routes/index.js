"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = routes;
const express_1 = require("express");
//Import routes
const auth_routes_1 = __importDefault(require("../domains/auth/auth.routes"));
const admin_routes_1 = __importDefault(require("../domains/admin/admin.routes"));
const user_routes_1 = __importDefault(require("../domains/user/user.routes"));
const authenticate_1 = __importDefault(require("../middleware/authenticate"));
const router = (0, express_1.Router)();
//Register all routes here
function routes() {
    router.use('/auth', auth_routes_1.default);
    router.use('/admin', (0, authenticate_1.default)('admin'), admin_routes_1.default);
    router.use('/user', (0, authenticate_1.default)('user'), user_routes_1.default);
    return router;
}
