import { NextFunction, Request, RequestHandler, Response } from "express";
import { bindDependencies } from "../utils/inversify.util";
import httpContext from "express-http-context";

type DependentMiddlewareFunction = (...args : any[])=>((req : Request, res : Response, next : NextFunction)=>void | Promise<void>);

export function dependentMiddleware(func : DependentMiddlewareFunction, args : any[]){
  return new DependentMiddleware(func, args)
}

export class DependentMiddleware{
  constructor(
    private readonly func : DependentMiddlewareFunction,
    private readonly args : any[]
  ){}

  public getMiddleware(){
    return bindDependencies(this.func, this.args)()
  }
}