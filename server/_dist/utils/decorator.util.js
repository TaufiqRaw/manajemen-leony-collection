"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMiddleware = void 0;
const middleware_base_1 = require("../bases/middleware.base");
function getMiddleware(target, propertyKey, container) {
    const rawMetadata = propertyKey
        ? Reflect.getMetadata("middleware", target, propertyKey)
        : Reflect.getMetadata("middleware", target);
    const metadata = rawMetadata ? rawMetadata.map((metadata, i) => {
        if (metadata instanceof middleware_base_1.DependentMiddleware) {
            //if container is not provided which is when controller mapping, return an empty function
            if (!container)
                return () => { };
            return metadata.getMiddleware(container);
        }
        return metadata;
    }) : undefined;
    return metadata;
}
exports.getMiddleware = getMiddleware;
