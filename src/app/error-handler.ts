import { NextFunction, Request, Response } from "express";
import { ExpressError } from "./errors/express.error";

export function errorHandler(err : ExpressError,req : Request,res : Response,next : NextFunction){
  console.log(err.stack)
  if(!err.statusCode)
    res.status(500).send("internal server error")
  res.status(err.statusCode).send(err.message)
  return;
}