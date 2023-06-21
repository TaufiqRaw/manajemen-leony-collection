"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteHandlerMap = void 0;
const path_to_regexp_1 = require("path-to-regexp");
class RouteHandlerMap extends Map {
    constructor() {
        super();
    }
    get(key) {
        for (const [k, v] of this.entries()) {
            if (k[0] !== key[0].toLocaleLowerCase())
                continue;
            const keyRegex = (0, path_to_regexp_1.pathToRegexp)(k[1]);
            if (keyRegex.test(key[1]))
                return v;
        }
        const keysWithColon = [];
        return undefined;
    }
    set(key, value) {
        return super.set([key[0], key[1]], value);
    }
    delete(key) {
        for (const [k, v] of this.entries()) {
            if (k[0] === key[0] && k[1] === key[1]) {
                return super.delete(k);
            }
        }
        return false;
    }
}
exports.RouteHandlerMap = RouteHandlerMap;
