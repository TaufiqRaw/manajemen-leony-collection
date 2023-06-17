import { NextFunction, Request, Response } from "express";
import { injectable } from "inversify";

@injectable()
export abstract class Middleware {
  abstract run(req : Request, res : Response, next : NextFunction) : Promise<void> | void
}