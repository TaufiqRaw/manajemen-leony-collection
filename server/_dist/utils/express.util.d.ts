/// <reference types="qs" />
import "reflect-metadata";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { Class } from "../types/class.type";
import { Container } from "inversify";
export declare function routeHandlerWrapper(requestHandler: RequestHandler, container: Container): (req: Request, res: Response, next: NextFunction) => void;
export declare class ExecutionContext {
    private readonly _handler;
    private readonly _class;
    constructor(_handler: RequestHandler, _class: Class);
    getHandler(): RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    getClass(): any;
    getClassMetadata<T>(key: string): T;
    getClassMetadataKeys(): string[];
    getHandlerMetadata<T>(key: string): T;
    getHandlerMetadataKeys(): string[];
}
//# sourceMappingURL=express.util.d.ts.map