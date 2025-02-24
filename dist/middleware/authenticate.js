"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_config_1 = __importDefault(require("../config/passport.config"));
const authenticate = (role) => {
    return (req, res, next) => {
        passport_config_1.default.authenticate('jwt', (err, user) => {
            var _a;
            if (err) {
                res.status(401).json({
                    success: false,
                    message: `Authentication failed: ${err.message}`
                });
                return;
            }
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'User not authorized'
                });
                return;
            }
            if (role) {
                if (((_a = user.role) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== role.toLowerCase()) {
                    res.status(403).json({ success: false, message: 'Not allowed' });
                    return;
                }
            }
            req.user = Object.assign({}, user);
            next();
        })(req, res, next);
    };
};
exports.default = authenticate;
