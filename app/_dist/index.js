"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('module-alias/register');
const server_1 = require("../server");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const user_module_1 = require("./modules/user/user.module");
const express_http_context_1 = __importDefault(require("express-http-context"));
const mikro_orm_config_1 = __importDefault(require("./mikro-orm.config"));
const authentication_module_1 = require("./modules/authentication/authentication.module");
const port = process.env.PORT || 5000;
new server_1.Server({
    port,
    modules: [authentication_module_1.AuthenticationModule, user_module_1.UserModule],
    plugins: [
        (0, cookie_parser_1.default)(),
        (0, cors_1.default)({
            origin: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With', 'X-Access-Token', 'X-Key', 'Cookies', 'Cache-Control', 'Set-Cookie'],
            credentials: true
        }),
        (0, helmet_1.default)({
            crossOriginResourcePolicy: false,
        }),
        express_1.default.urlencoded({ extended: true }),
        express_http_context_1.default.middleware
    ],
    databaseConfig: mikro_orm_config_1.default
}).run();
