import 'reflect-metadata';
import { UserService } from './user.service';
import { Request, Response } from "express";
import { AuthenticationService } from '../authentication/authentication.service';
export declare class UserController {
    private readonly userService;
    private readonly authenticationService;
    constructor(userService: UserService, authenticationService: AuthenticationService);
    test(req: Request, res: Response): Promise<import("@mikro-orm/core").Loaded<import("./user.entity").User, never> | null>;
}
