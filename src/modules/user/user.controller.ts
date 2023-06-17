import 'reflect-metadata';
import { Controller, Get, Middleware } from "@app/decorators/controller.decorator";
import { UserService } from './user.service';
import { Request, Response } from "express";
import { injectable } from 'inversify';
import { Class } from '@/app/types/class.type';
import { AuthenticationService } from '../authentication/authentication.service';

function testMiddleware(req : Request, res : Response, next : Function){
  console.log("test middleware")
  next()
}

@injectable()
@Controller('user')
@Middleware((req, res, next) => {
  next()
})
export class UserController {

  constructor(
    private readonly userService: UserService
  ) {}
  
  @Middleware({dependencies : [UserService, AuthenticationService], run:(userService : UserService, authenticationService : AuthenticationService)=>
    async (req,res,next)=>{
      console.log(await userService.getUser(1), authenticationService.login())
      next()
  }}, testMiddleware)
  @Get("hello")
  async hello(req : Request, res: Response){
    return await this.userService.getUser(1);
  }
}