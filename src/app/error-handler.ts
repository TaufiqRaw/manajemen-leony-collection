import { NextFunction, Request, Response } from "express";
import { ExpressError } from "./errors/express.error";
import { devLog, LOG_LEVEL, LOG_TYPE } from "./utils/development.util";

export function errorHandler(err : ExpressError,req : Request,res : Response,next : NextFunction){
  devLog(LOG_LEVEL.ERROR, LOG_TYPE.EXPRESS,err.stack)
  if(!err.statusCode)
    res.status(500).send("internal server error")
  res.status(err.statusCode).send(err.message)
  return;
}