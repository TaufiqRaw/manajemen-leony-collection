import { Module } from "@app/module";
import { UserController } from "./user.controller";
import { User } from "./user.entity";
import { UserService } from "./user.service";

export class UserModule extends Module{
  config(){
    return {
      controllers: [UserController],
      services: [UserService],
      entities: [User]
    }
  }
}