import 'reflect-metadata';
import { Controller, Get,Middleware } from "../../app/decorators/controller.decorator";
import { Request, Response } from "express";
import { AuthenticationService } from './authentication.service';
import { injectable } from 'inversify';
import { UserService } from '../user/user.service';

@injectable()
@Controller('auth')
export class AuthenticationController {

  constructor(
    private readonly authenticationService: AuthenticationService,
  ) {}
  
  @Get("check")
  async check(req : Request, res: Response){
    return "logged in bruh";
  }

  @Get(":id")
  async login(req : Request, res: Response){
    return this.authenticationService.login();
  }
}