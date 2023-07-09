import "reflect-metadata"
import { Application, NextFunction, Request, RequestHandler, Response } from "express";
import { Class } from "../types/class.type";
import { Container } from "inversify";
import { Renderable } from "../types/renderable.type";

export function routeHandlerWrapper(requestHandler : RequestHandler){
  return (req : Request, res : Response,next : NextFunction)=>{
    const result : any = Promise.resolve(requestHandler(req,res,next)).catch((err)=>{
      return next(err)
    }).then((result : any | void)=>{
      if(!result){
        return;
      } else if(result instanceof Renderable){
        return res.render(result.filename, result.data)
      } else{
        return res.send(result)
      }
    })
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

  public getClassMetadata<T>(key : string):T{
    return Reflect.getMetadata(key, this._class.prototype)
  }

  public getClassMetadataKeys():string[]{
    return Reflect.getMetadataKeys(this._class.prototype)
  }

  public getHandlerMetadata<T>(key : string):T{
    return Reflect.getMetadata(key, this._class.prototype, this._handler.name)
  }

  public getHandlerMetadataKeys():string[]{
    return Reflect.getMetadataKeys(this._class.prototype, this._handler.name)
  }

} 