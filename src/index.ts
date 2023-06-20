require('module-alias/register')
import { Server } from "./app/server";
import Express, { NextFunction, Request, Response } from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { AuthenticationModule } from "@modules/authentication/authentication.module";
import { UserModule } from "./modules/user/user.module";
import httpContext from "express-http-context";
import { devLog, LOG_LEVEL, LOG_TYPE } from "./app/utils/development.util";

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
  ]
}).run();