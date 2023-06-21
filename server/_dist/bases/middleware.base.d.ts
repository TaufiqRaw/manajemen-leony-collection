/// <reference types="qs" />
import { NextFunction, Request, Response } from "express";
import { Container } from "inversify";
type DependentMiddlewareFunction = (...args: any[]) => (((req: Request, res: Response, next: NextFunction) => any | Promise<any>) | ((err: any, req: Request, res: Response, next: NextFunction) => any | Promise<any>));
export declare function dependentMiddleware(func: DependentMiddlewareFunction, args: any[]): DependentMiddleware;
export declare class DependentMiddleware {
    private readonly func;
    private readonly args;
    constructor(func: DependentMiddlewareFunction, args: any[]);
    getMiddleware(container: Container): ((req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => any) | ((err: any, req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => any);
}
export {};
//# sourceMappingURL=middleware.base.d.ts.map