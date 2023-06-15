import { Module } from "@app/module";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

export class User extends Module{
  config(){
    return {
      controllers: [UserController],
      services: [UserService]
    }
  }
}