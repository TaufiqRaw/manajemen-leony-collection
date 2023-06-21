import "reflect-metadata";
import { EntityRepository } from "@mikro-orm/postgresql";
import { User } from "./user.entity";
export declare class UserService {
    private readonly userRepository;
    constructor(userRepository: EntityRepository<User>);
    getUser(id: number): Promise<import("@mikro-orm/core").Loaded<User, never> | null>;
}
