import 'reflect-metadata';
import { Controller, Get, Middleware } from "@server/.";
import { UserService } from './user.service';
import { Request, Response } from "express";
import { injectable } from 'inversify';
import { AuthenticationService } from '../authentication/authentication.service';


@injectable()
@Controller('user')
@Middleware((req, res, next) => {
  next()
})
export class UserController {

  constructor(
    private readonly userService: UserService,
    private readonly authenticationService: AuthenticationService,
  ) {}
  
  @Middleware(async (req, res, next) => {
            return next();
          })
  @Get("test")
  async test(req : Request, res: Response){
    return await this.userService.getUser(1);
  }
}