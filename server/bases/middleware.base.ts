import { NextFunction, Request, RequestHandler, Response } from "express";
import { Container } from "inversify";
import { bindDependencies } from "../utils/inversify.util";

type DependentMiddlewareFunction = (...args : any[])=>(((req : Request, res : Response, next : NextFunction)=>any | Promise<any> ) | ((err : any,req : Request, res : Response, next : NextFunction)=>any | Promise<any>));

export function dependentMiddleware(func : DependentMiddlewareFunction, args : any[]){
  return new DependentMiddleware(func, args)
}

export class DependentMiddleware{
  constructor(
    private readonly func : DependentMiddlewareFunction,
    private readonly args : any[]
  ){}

  public getMiddleware(container : Container){
    if(this.args.length > 0)
      return bindDependencies(this.func, this.args, container)()
    else
      return this.func()
  }
}
