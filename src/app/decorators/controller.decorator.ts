import "reflect-metadata";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { DependentMiddleware, dependentMiddleware } from "../bases/middleware.base";
import { HTTP_METHOD } from "../constants/http-method.constant";

export type ControllerDecoratorMetadata = {
  method: HTTP_METHOD,
  path: string
}

export function Controller(path : string | undefined) {
  return function (target: any) {
    Reflect.defineMetadata("controller", path, target.prototype);
  };
}

export function Middleware(...middleware: (RequestHandler | DependentMiddleware)[]) {
  const arrayMiddleware = Array.isArray(middleware) ? middleware : [middleware]
  return function (target: any, propertyKey?: string) {
    propertyKey ? 
      Reflect.defineMetadata("middleware", arrayMiddleware, target, propertyKey) 
      : Reflect.defineMetadata("middleware", arrayMiddleware, target.prototype);
  };
}

export function Get(metadata ?: string) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata("controller", {method : HTTP_METHOD.GET, path : metadata || ""}, target, propertyKey);
  };
}

export function Post(metadata ?: string) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata("controller", {method : HTTP_METHOD.POST, path : metadata || ""}, target, propertyKey);
  };
}

export function Put(metadata ?: string) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata("controller", {method : HTTP_METHOD.PUT, path : metadata || ""}, target, propertyKey);
  };
}

export function Delete(metadata ?: string) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata("controller", {method : HTTP_METHOD.DELETE, path : metadata || ""}, target, propertyKey);
  };
}



