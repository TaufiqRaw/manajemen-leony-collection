"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleInstanceMap = void 0;
class ModuleInstanceMap {
    constructor() {
        this._entries = [];
    }
    get(module) {
        return this._entries.find(entry => entry instanceof module);
    }
    add(module) {
        this._entries.push(module);
    }
    remove(module) {
        this._entries = this._entries.filter(entry => !(entry instanceof module));
    }
    forEach(callback) {
        this._entries.forEach(callback);
    }
}
exports.ModuleInstanceMap = ModuleInstanceMap;
