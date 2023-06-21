import 'reflect-metadata';
import { Request, Response } from "express";
import { AuthenticationService } from './authentication.service';
export declare class AuthenticationController {
    private readonly authenticationService;
    constructor(authenticationService: AuthenticationService);
    check(req: Request, res: Response): Promise<string>;
    login(req: Request, res: Response): Promise<string>;
}
