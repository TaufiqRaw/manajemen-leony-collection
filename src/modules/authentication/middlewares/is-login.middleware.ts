import { ExpressError } from "@/app/errors/express.error";
import { NextFunction, Request, Response } from "express";

export function isLogin(req : Request,res : Response, next : NextFunction){
  //@ts-ignore
  const user = req.user
  
  if(user)
    next()
  else
    throw new ExpressError("Unauthorized", 401)
}