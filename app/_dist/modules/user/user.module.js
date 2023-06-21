"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModule = void 0;
const _1 = require("@server/.");
const authentication_module_1 = require("../authentication/authentication.module");
const user_controller_1 = require("./user.controller");
const user_entity_1 = require("./user.entity");
const user_service_1 = require("./user.service");
class UserModule extends _1.Module {
    config() {
        return {
            imports: [authentication_module_1.AuthenticationModule],
            controllers: [user_controller_1.UserController],
            services: [user_service_1.UserService],
            entities: [user_entity_1.User]
        };
    }
}
exports.UserModule = UserModule;
