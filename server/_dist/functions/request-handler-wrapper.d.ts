import { NextFunction, Request, Response } from "express";
export declare function asyncWrapper(asyncRouteHandler: (request: Request, response: Response, next: NextFunction) => Promise<any>): (request: Request, response: Response, next: NextFunction) => Promise<any>;
//# sourceMappingURL=request-handler-wrapper.d.ts.map