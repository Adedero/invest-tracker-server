"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = __importDefault(require("node:path"));
const env_1 = __importDefault(require("./env"));
const swagger_autogen_1 = __importDefault(require("swagger-autogen"));
const doc = {
    info: {
        version: '1.0.0',
        title: 'Invest Tracker REST API'
    },
    host: env_1.default.get('BASE_URL', 'localhost:5000'),
    basePath: '/',
    schemes: ['http', 'https']
};
const outputFile = node_path_1.default.resolve('docs/swagger-doc.json');
const routes = ['../app.js'];
(0, swagger_autogen_1.default)(outputFile, routes, doc);
//.then(() => require('../server'))
