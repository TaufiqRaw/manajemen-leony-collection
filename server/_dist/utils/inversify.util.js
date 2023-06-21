"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bindDependencies = void 0;
function bindDependencies(func, dependencies, container) {
    let injections = dependencies.map((dependency) => {
        return container.get(dependency);
    });
    return func.bind(func, ...injections);
}
exports.bindDependencies = bindDependencies;
