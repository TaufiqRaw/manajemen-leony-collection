import { NextFunction, Request, RequestHandler, Response } from "express";
import "reflect-metadata";
import { Middleware as MiddlewareType } from "../bases/middleware.base";
import { devLog } from "../utils/development.util";
import httpContext from "express-http-context"
import { Container } from "inversify";
import { Class, ClassOf } from "../types/class.type";

const METHOD ={
  GET : "get",
  POST : "post",
  PUT : "put",
  DELETE : "delete"
}
export type MiddlewareObject = {
  run : (...args : any[])=>(req:Request,res:Response,next:NextFunction)=> void | Promise<void>
  dependencies : ClassOf<any>[]
}

export type ControllerDecoratorMetadata = {
  method: "get" | "post" | "put" | "delete",
  path: string
}

export function Controller(path : string | undefined) {
  return function (target: any) {
    Reflect.defineMetadata("controller", path, target.prototype);
  };
}

export function Middleware(...middleware: (RequestHandler | MiddlewareObject)[]) {
  const arrayMiddleware = Array.isArray(middleware) ? middleware : [middleware]
  return function (target: any, propertyKey?: string) {
    propertyKey ? 
      Reflect.defineMetadata("middleware", arrayMiddleware, target, propertyKey) 
      : Reflect.defineMetadata("middleware", arrayMiddleware, target.prototype);
  };
}

export function Get(metadata ?: string) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata("controller", {method : METHOD.GET, path : metadata || ""}, target, propertyKey);
  };
}

export function Post(metadata ?: string) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata("controller", {method : METHOD.POST, path : metadata || ""}, target, propertyKey);
  };
}

export function Put(metadata ?: string) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata("controller", {method : METHOD.PUT, path : metadata || ""}, target, propertyKey);
  };
}

export function Delete(metadata ?: string) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata("controller", {method : METHOD.DELETE, path : metadata || ""}, target, propertyKey);
  };
}



