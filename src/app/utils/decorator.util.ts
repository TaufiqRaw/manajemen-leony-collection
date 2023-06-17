import { NextFunction, Request, RequestHandler, Response } from "express"
import httpContext from "express-http-context"
import { Container } from "inversify"
import { Middleware } from "../bases/middleware.base"
import { MiddlewareObject } from "../decorators/controller.decorator"
import { Class } from "../types/class.type"
import { isConstructor } from "./common.util"
import { bindDependencies } from "./inversify.util"

type middlewareDecoratorType = (RequestHandler|MiddlewareObject)

export function getMiddleware(target : Object, propertyKey ?: string) : RequestHandler[] | undefined {
  const rawMetadata = 
    propertyKey 
      ? Reflect.getMetadata("middleware", target, propertyKey) as middlewareDecoratorType[] 
      : Reflect.getMetadata("middleware", target) as middlewareDecoratorType[] 
  const metadata = rawMetadata ? rawMetadata.map((metadata, i)=>{
    if(typeof metadata === "object"){
      return bindDependencies(metadata.run, metadata.dependencies)()
    }
    return metadata
  }) : undefined
  
  return metadata as RequestHandler[]
}