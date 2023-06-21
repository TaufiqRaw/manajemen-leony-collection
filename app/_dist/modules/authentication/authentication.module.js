"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationModule = void 0;
const _1 = require("@server/.");
const authentication_controller_1 = require("./authentication.controller");
const authentication_service_1 = require("./authentication.service");
class AuthenticationModule extends _1.Module {
    config() {
        return {
            controllers: [authentication_controller_1.AuthenticationController],
            services: [authentication_service_1.AuthenticationService],
            exports: [authentication_service_1.AuthenticationService]
        };
    }
}
exports.AuthenticationModule = AuthenticationModule;
