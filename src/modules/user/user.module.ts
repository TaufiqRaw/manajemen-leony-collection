import { Module } from "@app/module";
import { AuthenticationModule } from "../authentication/authentication.module";
import { UserController } from "./user.controller";
import { User } from "./user.entity";
import { UserService } from "./user.service";

export class UserModule extends Module{
  config(){
    return {
      imports : [AuthenticationModule],
      controllers: [UserController],
      services: [UserService],
      entities: [User]
    }
  }
}