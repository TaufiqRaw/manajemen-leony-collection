import { CustomBaseEntity } from "@app/modules/common/bases/custom-base.entity";
import { EntityWithoutBase } from "@app/modules/common/types/entity-without-base";
interface UserProps extends EntityWithoutBase<User> {
}
export declare class User extends CustomBaseEntity {
    name: string;
    password: string;
    isAdmin: boolean;
    profilePicture?: string;
    constructor({ name, isAdmin, password, profilePicture }: UserProps);
}
export {};
