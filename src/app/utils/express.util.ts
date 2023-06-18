import "reflect-metadata"
import { NextFunction, Request, RequestHandler, Response } from "express";
import { Class } from "../types/class.type";

export function routeHandlerWrapper(requestHandler : RequestHandler){
  return (req : Request, res : Response,next : NextFunction)=>{
    const result = requestHandler(req,res,next) as Promise<any> | any;
    //if result is a promise, wait for it to resolve before sending response
    if(result instanceof Promise){
      result.then((result : any)=>{
        res.send(result)
      })
      result.catch(next)
    }else{
      res.send(result)
    }
  }
}

export class ExecutionContext {
  constructor(
    private readonly _handler : RequestHandler,
    private readonly _class : Class
  ){}

  public getHandler(){
    return this._handler
  }

  public getClass(){
    return this._class.prototype
  }

  public getClassDecorator<T>(key : string):T{
    return Reflect.getMetadata(key, this._class.prototype)
  }

  public getClassDecoratorKeys():string[]{
    return Reflect.getMetadataKeys(this._class.prototype)
  }

  public getHandlerDecorator<T>(key : string):T{
    return Reflect.getMetadata(key, this._class.prototype, this._handler.name)
  }

  public getHandlerDecoratorKeys():string[]{
    return Reflect.getMetadataKeys(this._class.prototype, this._handler.name)
  }

} 