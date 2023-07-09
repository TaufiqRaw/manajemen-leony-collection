import { NextFunction, Request, Response } from "express";

export function asyncWrapper(asyncRouteHandler : (request : Request, response : Response, next : NextFunction) => Promise<any>) {
  return function routeHandler(request : Request, response : Response, next : NextFunction) {
    return (
      asyncRouteHandler(request, response, next)
        .catch(next)
    );
  };
}
