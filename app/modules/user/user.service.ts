import "reflect-metadata";
import { injectable } from "inversify";
import { EntityRepository } from "@mikro-orm/postgresql";
import { User } from "./user.entity";

@injectable()
export class UserService {
  constructor(
    private readonly userRepository: EntityRepository<User>
  ) {}

  async getUser(id : number) {
    return await this.userRepository.findOne({id});
  }
}