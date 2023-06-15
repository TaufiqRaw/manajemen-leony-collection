import 'reflect-metadata';
import { Controller, Get } from "@app/decorators/controller.decorator";
import { UserService } from './user.service';
import { Request, Response } from "express";
import { injectable } from 'inversify';

@injectable()
@Controller('user')
export class UserController {

  constructor(
    private readonly userService: UserService
  ) {}
  
  @Get("hello")
  async hello(req : Request, res: Response){
    return this.userService.getHello();
  }
}