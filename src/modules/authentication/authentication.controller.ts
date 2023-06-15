import 'reflect-metadata';
import { Controller, Get,Middleware } from "../../app/decorators/controller.decorator";
import { Request, Response } from "express";
import { AuthenticationService } from './authentication.service';
import { injectable } from 'inversify';
import { isLogin } from './middlewares/is-login.middleware';

@injectable()
@Controller('auth')
export class AuthenticationController {

  constructor(
    private readonly authenticationService: AuthenticationService
  ) {}
  
  @Get("check")
  @Middleware(isLogin)
  async check(req : Request, res: Response){
    return "logged in bruh";
  }

  @Get(":id")
  async login(req : Request, res: Response){
    return this.authenticationService.login();
  }
}