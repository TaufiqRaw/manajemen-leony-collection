"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionContext = exports.routeHandlerWrapper = void 0;
require("reflect-metadata");
function routeHandlerWrapper(requestHandler, container) {
    return (req, res, next) => {
        const result = requestHandler(req, res, next);
        //if result is a promise, wait for it to resolve before sending response
        if (result instanceof Promise) {
            result.then((result) => {
                res.send(result);
            });
            result.catch(next);
        }
        else {
            res.send(result);
        }
    };
}
exports.routeHandlerWrapper = routeHandlerWrapper;
class ExecutionContext {
    constructor(_handler, _class) {
        this._handler = _handler;
        this._class = _class;
    }
    getHandler() {
        return this._handler;
    }
    getClass() {
        return this._class.prototype;
    }
    getClassMetadata(key) {
        return Reflect.getMetadata(key, this._class.prototype);
    }
    getClassMetadataKeys() {
        return Reflect.getMetadataKeys(this._class.prototype);
    }
    getHandlerMetadata(key) {
        return Reflect.getMetadata(key, this._class.prototype, this._handler.name);
    }
    getHandlerMetadataKeys() {
        return Reflect.getMetadataKeys(this._class.prototype, this._handler.name);
    }
}
exports.ExecutionContext = ExecutionContext;
