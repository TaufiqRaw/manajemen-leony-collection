import { RequestHandler } from "express";
import "reflect-metadata";
import { devLog } from "../utils/helper";

const METHOD ={
  GET : "get",
  POST : "post",
  PUT : "put",
  DELETE : "delete"
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

export function Middleware(middleware: RequestHandler[] | RequestHandler) {
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



