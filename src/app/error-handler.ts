import { NextFunction, Request, Response } from "express";
import { dependentMiddleware } from "./bases/middleware.base";
import { ExpressError } from "./errors/express.error";
import { devLog, LOG_LEVEL, LOG_TYPE } from "./utils/development.util";

export const errorHandler = dependentMiddleware(()=>{
  return (err : ExpressError,req,res,next)=>{
    devLog(LOG_LEVEL.ERROR, LOG_TYPE.EXPRESS,err.stack)
    if(!err.statusCode)
      return res.status(500).send("internal server error")
    res.status(err.statusCode).send(err.message)
    return;
  }
}, [])