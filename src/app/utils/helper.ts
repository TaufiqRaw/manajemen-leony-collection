import dotenv from "dotenv/config"
import { NextFunction, Request, RequestHandler, Response } from "express"

export function isDevelopment(){
  return process.env.NODE_ENV === "development"
}

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

export function devLog(...message : any[]){
  if(isDevelopment()){
    console.log(...message)
  }
}