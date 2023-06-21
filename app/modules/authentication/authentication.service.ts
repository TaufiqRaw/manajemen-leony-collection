import { injectable } from "inversify";
import "reflect-metadata";

@injectable()
export class AuthenticationService {
  constructor() {}

  login() {
    return "login";
  }
}