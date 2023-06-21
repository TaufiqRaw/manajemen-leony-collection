"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const middleware_base_1 = require("./bases/middleware.base");
const development_util_1 = require("./utils/development.util");
exports.errorHandler = (0, middleware_base_1.dependentMiddleware)(() => {
    return (err, req, res, next) => {
        (0, development_util_1.devLog)(development_util_1.LOG_LEVEL.ERROR, development_util_1.LOG_TYPE.EXPRESS, err.stack);
        if (!err.statusCode)
            return res.status(500).send("internal server error");
        res.status(err.statusCode).send(err.message);
        return;
    };
}, []);
