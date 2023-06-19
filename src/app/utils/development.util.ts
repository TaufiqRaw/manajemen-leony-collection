import dotenv from "dotenv/config"
import { NextFunction, Request, RequestHandler, Response } from "express"
import "reflect-metadata"
import {injectable} from "inversify"
import minimist from "minimist"

export enum LOG_LEVEL {
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
  DEBUG = "debug",
}

export enum LOG_TYPE {
  SERVER = "server",
  MEMORY = "memory",
  ALL = "all",
  EXPRESS = "express",
}

export function isDevelopment(){
  return process.env.NODE_ENV === "development"
}

export function isDevelopmentFor(type : LOG_TYPE){
  return isDevelopment() && minimist(process.argv.slice(2)).type?.split(",").includes(type)
}

export function devLog(level : LOG_LEVEL = LOG_LEVEL.DEBUG ,type : [LOG_TYPE] | LOG_TYPE = LOG_TYPE.ALL, ...message : any[]){
  if(!isDevelopment()) return;

  const logLevelPriority = [LOG_LEVEL.ERROR, LOG_LEVEL.WARN, LOG_LEVEL.DEBUG,LOG_LEVEL.INFO]

  const logLevel = minimist(process.argv.slice(2)).level || LOG_LEVEL.INFO;
  const logType = (minimist(process.argv.slice(2)).type as string)?.split(",") || LOG_TYPE.ALL;

  if(logLevelPriority.indexOf(level) > logLevelPriority.indexOf(logLevel)) return;
  //if user logType is not on type and if the user logType not ONLY type.ALL, exit this function
  if((Array.isArray(type) ?
      !type.every(type => logType.includes(type)) : 
      !logType.includes(type))
    && (logType.length === 1 ?
      !(logType[0] === LOG_TYPE.ALL) :
      true)
      ) return;
  
  console.log(...message)
}