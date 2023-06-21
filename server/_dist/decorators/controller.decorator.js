"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Delete = exports.Put = exports.Post = exports.Get = exports.Middleware = exports.Controller = void 0;
require("reflect-metadata");
const http_method_constant_1 = require("../constants/http-method.constant");
function Controller(path) {
    return function (target) {
        Reflect.defineMetadata("controller", path, target.prototype);
    };
}
exports.Controller = Controller;
function Middleware(...middleware) {
    const arrayMiddleware = Array.isArray(middleware) ? middleware : [middleware];
    return function (target, propertyKey) {
        propertyKey ?
            Reflect.defineMetadata("middleware", arrayMiddleware, target, propertyKey)
            : Reflect.defineMetadata("middleware", arrayMiddleware, target.prototype);
    };
}
exports.Middleware = Middleware;
function Get(metadata) {
    return function (target, propertyKey) {
        Reflect.defineMetadata("controller", { method: http_method_constant_1.HTTP_METHOD.GET, path: metadata || "" }, target, propertyKey);
    };
}
exports.Get = Get;
function Post(metadata) {
    return function (target, propertyKey) {
        Reflect.defineMetadata("controller", { method: http_method_constant_1.HTTP_METHOD.POST, path: metadata || "" }, target, propertyKey);
    };
}
exports.Post = Post;
function Put(metadata) {
    return function (target, propertyKey) {
        Reflect.defineMetadata("controller", { method: http_method_constant_1.HTTP_METHOD.PUT, path: metadata || "" }, target, propertyKey);
    };
}
exports.Put = Put;
function Delete(metadata) {
    return function (target, propertyKey) {
        Reflect.defineMetadata("controller", { method: http_method_constant_1.HTTP_METHOD.DELETE, path: metadata || "" }, target, propertyKey);
    };
}
exports.Delete = Delete;
