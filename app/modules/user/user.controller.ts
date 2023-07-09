import 'reflect-metadata';
import { Controller, dependentMiddleware, Get, Middleware, Renderable} from "@server/.";
import { UserService } from './user.service';
import { NextFunction, Request, Response } from "express";
import { injectable } from 'inversify';
import { AuthenticationService } from '../authentication/authentication.service';
import { ExpressError } from '@app/../server/errors/express.error';


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
  
  @Middleware(dependentMiddleware((authenticationService : AuthenticationService)=>
  async (req : Request, res : Response,next : NextFunction)=>{
    console.log(authenticationService.login())
    next()
  }
  , [AuthenticationService]))
  @Get("test")
  async test(req : Request, res: Response, next: NextFunction){
    const user = await this.userService.getUser(1);
    return new Renderable("test", {data:user?.name});
  }
}