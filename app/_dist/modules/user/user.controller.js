"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
require("reflect-metadata");
const _1 = require("@server/.");
const user_service_1 = require("./user.service");
const inversify_1 = require("inversify");
const authentication_service_1 = require("../authentication/authentication.service");
let UserController = exports.UserController = class UserController {
    constructor(userService, authenticationService) {
        this.userService = userService;
        this.authenticationService = authenticationService;
    }
    test(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userService.getUser(1);
        });
    }
};
__decorate([
    (0, _1.Middleware)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        return next();
    })),
    (0, _1.Get)("test"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "test", null);
exports.UserController = UserController = __decorate([
    (0, inversify_1.injectable)(),
    (0, _1.Controller)('user'),
    (0, _1.Middleware)((req, res, next) => {
        next();
    }),
    __metadata("design:paramtypes", [user_service_1.UserService,
        authentication_service_1.AuthenticationService])
], UserController);
