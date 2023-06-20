import { Module } from "@app/module";
import { AuthenticationController } from "./authentication.controller";
import { AuthenticationService } from "./authentication.service";

export class AuthenticationModule extends Module{
  config(){
    return {
      controllers: [AuthenticationController],
      services: [AuthenticationService],
      exports : [AuthenticationService]
    }
  }
}