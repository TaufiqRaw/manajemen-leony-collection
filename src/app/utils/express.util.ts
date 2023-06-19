import "reflect-metadata"
import { NextFunction, Request, RequestHandler, Response } from "express";
import { Class } from "../types/class.type";
import { Container } from "inversify";

export function routeHandlerWrapper(requestHandler : RequestHandler, container: Container){
  return (req : Request, res : Response,next : NextFunction)=>{
    const result = requestHandler(req,res,next) as Promise<any> | any;
    //if result is a promise, wait for it to resolve before sending response
    if(result instanceof Promise){
      result.then((result : any)=>{
        //unbind container after request is done
        container.unbindAll()
        res.send(result)
      })
      result.catch(next)
    }else{
      //unbind container after request is done
      container.unbindAll()
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