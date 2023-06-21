"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.devLog = exports.isDevelopmentFor = exports.isDevelopment = exports.LOG_TYPE = exports.LOG_LEVEL = void 0;
require("reflect-metadata");
const minimist_1 = __importDefault(require("minimist"));
var LOG_LEVEL;
(function (LOG_LEVEL) {
    LOG_LEVEL["INFO"] = "info";
    LOG_LEVEL["WARN"] = "warn";
    LOG_LEVEL["ERROR"] = "error";
    LOG_LEVEL["DEBUG"] = "debug";
})(LOG_LEVEL || (exports.LOG_LEVEL = LOG_LEVEL = {}));
var LOG_TYPE;
(function (LOG_TYPE) {
    LOG_TYPE["SERVER"] = "server";
    LOG_TYPE["MEMORY"] = "memory";
    LOG_TYPE["ALL"] = "all";
    LOG_TYPE["EXPRESS"] = "express";
})(LOG_TYPE || (exports.LOG_TYPE = LOG_TYPE = {}));
function isDevelopment() {
    return process.env.NODE_ENV === "development";
}
exports.isDevelopment = isDevelopment;
function isDevelopmentFor(type) {
    var _a;
    return isDevelopment() && ((_a = (0, minimist_1.default)(process.argv.slice(2)).type) === null || _a === void 0 ? void 0 : _a.split(",").includes(type));
}
exports.isDevelopmentFor = isDevelopmentFor;
function devLog(level = LOG_LEVEL.DEBUG, type = LOG_TYPE.ALL, ...message) {
    var _a;
    if (!isDevelopment())
        return;
    const logLevelPriority = [LOG_LEVEL.ERROR, LOG_LEVEL.WARN, LOG_LEVEL.DEBUG, LOG_LEVEL.INFO];
    const logLevel = (0, minimist_1.default)(process.argv.slice(2)).level || LOG_LEVEL.INFO;
    const rawLogType = ((_a = (0, minimist_1.default)(process.argv.slice(2)).type) === null || _a === void 0 ? void 0 : _a.split(",")) || LOG_TYPE.ALL;
    const logType = Array.isArray(rawLogType) ? rawLogType : [rawLogType];
    if (logLevelPriority.indexOf(level) > logLevelPriority.indexOf(logLevel))
        return;
    //if user logType is not on type and if the user logType not ONLY type.ALL, exit this function
    if ((Array.isArray(type) ?
        !type.every(type => logType.includes(type)) :
        !logType.includes(type))
        && (logType.length === 1 ?
            !(logType[0] === LOG_TYPE.ALL) :
            true))
        return;
    console.log(...message);
}
exports.devLog = devLog;
