import { Module } from "@server/.";
import { AuthenticationController } from "./authentication.controller";
import { AuthenticationService } from "./authentication.service";
export declare class AuthenticationModule extends Module {
    config(): {
        controllers: (typeof AuthenticationController)[];
        services: (typeof AuthenticationService)[];
        exports: (typeof AuthenticationService)[];
    };
}
