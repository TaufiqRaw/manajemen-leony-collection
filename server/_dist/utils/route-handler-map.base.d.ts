import { HTTP_METHOD } from "../constants/http-method.constant";
import { RequestHandler } from "express";
import { Class } from "../types/class.type";
export declare class RouteHandlerMap extends Map<[HTTP_METHOD, string], [Class, RequestHandler]> {
    constructor();
    get(key: [HTTP_METHOD, string]): [Class, RequestHandler] | undefined;
    set(key: [HTTP_METHOD, string], value: [Class, RequestHandler]): this;
    delete(key: [HTTP_METHOD, string]): boolean;
}
//# sourceMappingURL=route-handler-map.base.d.ts.map