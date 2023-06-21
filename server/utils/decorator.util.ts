import { NextFunction, Request, RequestHandler, Response } from "express"
import { Container } from "inversify"
import { DependentMiddleware } from "../bases/middleware.base"

type middlewareDecoratorType = (RequestHandler|DependentMiddleware)

export function getMiddleware(target : Object, propertyKey ?: string, container ?: Container) : RequestHandler[] | undefined {
  const rawMetadata = 
    propertyKey 
      ? Reflect.getMetadata("middleware", target, propertyKey) as middlewareDecoratorType[] 
      : Reflect.getMetadata("middleware", target) as middlewareDecoratorType[] 
  const metadata = rawMetadata ? rawMetadata.map((metadata, i)=>{
    if(metadata instanceof DependentMiddleware){
      //if container is not provided which is when controller mapping, return an empty function
      if(!container)
        return ()=>{}
      return metadata.getMiddleware(container)
    }
    return metadata
  }) : undefined
  
  return metadata as RequestHandler[]
}