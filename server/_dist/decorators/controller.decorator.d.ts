import "reflect-metadata";
import { RequestHandler } from "express";
import { DependentMiddleware } from "../bases/middleware.base";
import { HTTP_METHOD } from "../constants/http-method.constant";
export type ControllerDecoratorMetadata = {
    method: HTTP_METHOD;
    path: string;
};
export declare function Controller(path: string | undefined): (target: any) => void;
export declare function Middleware(...middleware: (RequestHandler | DependentMiddleware)[]): (target: any, propertyKey?: string) => void;
export declare function Get(metadata?: string): (target: any, propertyKey: string) => void;
export declare function Post(metadata?: string): (target: any, propertyKey: string) => void;
export declare function Put(metadata?: string): (target: any, propertyKey: string) => void;
export declare function Delete(metadata?: string): (target: any, propertyKey: string) => void;
//# sourceMappingURL=controller.decorator.d.ts.map