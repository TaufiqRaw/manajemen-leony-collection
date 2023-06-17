import 'reflect-metadata';
import { Controller, Get, Middleware } from "@app/decorators/controller.decorator";
import { UserService } from './user.service';
import { Request, Response } from "express";
import { injectable } from 'inversify';

@injectable()
@Controller('user')
@Middleware((req, res, next) => {
  next()
})
export class UserController {

  constructor(
    private readonly userService: UserService
  ) {}
  
  @Get("hello")
  async hello(req : Request, res: Response){
    return await this.userService.getUser(1);
  }
}