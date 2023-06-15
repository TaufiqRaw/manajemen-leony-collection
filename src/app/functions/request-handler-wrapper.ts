import { NextFunction, Request, Response } from "express";

const AsyncFunction = (async () => {}).constructor;

function isAsync(fn : any) {
  return fn instanceof AsyncFunction;
}

function asyncWrapper(asyncRouteHandler : (request : Request, response : Response, next : NextFunction) => Promise<any>) {
  return function routeHandler(request : Request, response : Response, next : NextFunction) {
    return (
      asyncRouteHandler(request, response, next)
        .catch(next)
    );
  };
}

export function requestHandlerWrapper(fn : (req : Request, res : Response, next : NextFunction) => any) {
  console.log(isAsync(fn))
  return isAsync(fn) ? asyncWrapper(fn) : fn;
}