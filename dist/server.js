"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_http_1 = __importDefault(require("node:http"));
const logger_1 = __importDefault(require("./utils/logger"));
const constants_1 = require("./utils/constants");
const env_1 = __importDefault(require("./utils/env"));
const app_1 = __importDefault(require("./app"));
const PORT = env_1.default.get('PORT', '5000');
const server = node_http_1.default.createServer(app_1.default);
server.listen(PORT, () => {
    if (!constants_1.IS_PRODUCTION_ENV) {
        logger_1.default.info(`Server running on http://localhost:${PORT}`);
    }
});
process.on('SIGINT', () => {
    server.close(() => {
        logger_1.default.info('Server closed.');
        process.exit(0);
    });
});
