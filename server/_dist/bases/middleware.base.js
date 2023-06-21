"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependentMiddleware = exports.dependentMiddleware = void 0;
const inversify_util_1 = require("../utils/inversify.util");
function dependentMiddleware(func, args) {
    return new DependentMiddleware(func, args);
}
exports.dependentMiddleware = dependentMiddleware;
class DependentMiddleware {
    constructor(func, args) {
        this.func = func;
        this.args = args;
    }
    getMiddleware(container) {
        if (this.args.length > 0)
            return (0, inversify_util_1.bindDependencies)(this.func, this.args, container)();
        else
            return this.func();
    }
}
exports.DependentMiddleware = DependentMiddleware;
