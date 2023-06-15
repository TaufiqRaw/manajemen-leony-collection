import "reflect-metadata";
import { injectable } from "inversify";

@injectable()
export class UserService {
  constructor() {}

  getHello() {
    return "hello";
  }
}