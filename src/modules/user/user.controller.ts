import 'reflect-metadata';
import { Controller, Get, Middleware } from "@app/decorators/controller.decorator";
import { UserService } from './user.service';
import { Request, Response } from "express";
import { injectable } from 'inversify';
import { Class } from '@/app/types/class.type';
import { AuthenticationService } from '../authentication/authentication.service';
import { dependentMiddleware} from '@/app/bases/middleware.base';
import { ExecutionContext } from '@/app/utils/express.util';
import { getExecutionContext } from '../common/utils/get-execution-context.util';


@injectable()
@Controller('user')
@Middleware((req, res, next) => {
  next()
})
export class UserController {

  constructor(
    private readonly userService: UserService
  ) {}
  
  @Middleware(async (req, res, next) => {
            return next();
          })
  @Get("test")
  async test(req : Request, res: Response){
    return await this.userService.getUser(1);
  }
}