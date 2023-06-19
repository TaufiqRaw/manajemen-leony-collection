import { RequestHandler } from "express";

export type RouteBinder = Map<string, RequestHandler[]>