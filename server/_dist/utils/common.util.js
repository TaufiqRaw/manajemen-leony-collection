"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isConstructor = void 0;
function isConstructor(f) {
    if (typeof f !== 'function')
        return false;
    const descriptor = Object.getOwnPropertyDescriptor(f, 'prototype');
    if (!descriptor)
        return false;
    return !descriptor.writable;
}
exports.isConstructor = isConstructor;
