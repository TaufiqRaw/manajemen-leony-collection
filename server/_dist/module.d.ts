import { EntityManager } from '@mikro-orm/postgresql';
import { Application } from 'express';
import { Container } from 'inversify';
import 'reflect-metadata';
import { Class, ClassOf } from './types/class.type';
import { RouteHandlerMap } from './utils/route-handler-map.base';
interface ModuleConfig {
    imports?: Class[];
    services?: (Class | {
        token: Class;
        bindTo: Class;
    })[];
    controllers?: Class[];
    entities?: Class[];
    exports?: Class[];
}
export declare abstract class Module {
    readonly _imports: ClassOf<Module>[];
    private _services;
    private _controllers;
    private _entities;
    readonly _exports: Class[];
    private app;
    private routeBinder;
    constructor(app: Application, routeHandlerMap: RouteHandlerMap);
    abstract config(): ModuleConfig;
    init(routeHandlerMap: RouteHandlerMap): void;
    rebind(globalContainer: Container, container: Container, em: EntityManager): void;
}
export {};
//# sourceMappingURL=module.d.ts.map