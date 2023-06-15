import { RequestHandler } from "express";
import "reflect-metadata";

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

export function Middleware(...middleware: RequestHandler[]) {
  return function (target: any, propertyKey?: string) {
    propertyKey ? 
      Reflect.defineMetadata("middleware", middleware, target, propertyKey) 
      : Reflect.defineMetadata("middleware", middleware, target.prototype);
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



