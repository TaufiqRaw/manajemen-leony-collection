require('module-alias/register')
import { Server } from "../server";
import Express, { NextFunction, Request, Response } from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { UserModule } from "./modules/user/user.module";
import httpContext from "express-http-context";
import config from "./mikro-orm.config";
import { AuthenticationModule } from "./modules/authentication/authentication.module";

const port = process.env.PORT || 5000;

new Server({
  port,
  modules : [AuthenticationModule, UserModule],
  plugins: [
    cookieParser(),
    cors({
      origin: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With', 'X-Access-Token', 'X-Key', 'Cookies', 'Cache-Control', 'Set-Cookie'],
      credentials: true
    }),
    helmet({
      crossOriginResourcePolicy: false,
    }),
    Express.urlencoded({extended: true}),
    httpContext.middleware
  ],
  databaseConfig : config
}).run();