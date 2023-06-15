require('module-alias/register')
import { Server } from "./app/server";
import Express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { Authentication } from "@modules/authentication/authentication.module";

const port = process.env.PORT || 5000;

new Server({
  port,
  modules : [Authentication],
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
  ]
}).run();