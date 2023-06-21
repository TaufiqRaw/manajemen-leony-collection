import { Module } from "@server/.";
import { AuthenticationModule } from "../authentication/authentication.module";
import { UserController } from "./user.controller";
import { User } from "./user.entity";
import { UserService } from "./user.service";
export declare class UserModule extends Module {
    config(): {
        imports: (typeof AuthenticationModule)[];
        controllers: (typeof UserController)[];
        services: (typeof UserService)[];
        entities: (typeof User)[];
    };
}
