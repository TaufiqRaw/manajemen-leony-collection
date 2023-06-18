import { NextFunction, Request, RequestHandler, Response } from "express"
import httpContext from "express-http-context"
import { Container } from "inversify"
import { DependentMiddleware } from "../bases/middleware.base"
import { Class } from "../types/class.type"
import { isConstructor } from "./common.util"
import { bindDependencies } from "./inversify.util"

type middlewareDecoratorType = (RequestHandler|DependentMiddleware)

export function getMiddleware(target : Object, propertyKey ?: string) : RequestHandler[] | undefined {
  const rawMetadata = 
    propertyKey 
      ? Reflect.getMetadata("middleware", target, propertyKey) as middlewareDecoratorType[] 
      : Reflect.getMetadata("middleware", target) as middlewareDecoratorType[] 
  const metadata = rawMetadata ? rawMetadata.map((metadata, i)=>{
    if(metadata instanceof DependentMiddleware){
      return metadata.getMiddleware()
    }
    return metadata
  }) : undefined
  
  return metadata as RequestHandler[]
}