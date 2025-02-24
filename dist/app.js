"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
require("express-async-errors");
const error_handler_1 = __importDefault(require("./middleware/error-handler"));
const cors_config_1 = __importDefault(require("./config/cors.config"));
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("./routes"));
//import { job } from './cron/cron-job'
const app = (0, express_1.default)();
//job.start()
//Middleware
app.use(cors_config_1.default);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: false }));
app.use(express_1.default.static('public'));
app.get('/', (req, res) => {
    res.status(200).json({
        title: 'Invest Tracker Server',
        version: '1.0.0',
        description: 'The official server for the Invest Tracker Webiste',
        author: 'Invest Tracker',
        created: 'Jan 01, 2020'
    });
});
app.use((0, routes_1.default)());
//Error handling middleware must be the last
app.use(error_handler_1.default);
exports.default = app;
