import { ClassOf } from "../types/class.type";
import { Module } from "../module";
export declare class ModuleInstanceMap {
    private _entries;
    constructor();
    get(module: ClassOf<Module>): Module | undefined;
    add(module: Module): void;
    remove(module: ClassOf<Module>): void;
    forEach(callback: (module: Module) => void): void;
}
//# sourceMappingURL=module-instance-map.util.d.ts.map