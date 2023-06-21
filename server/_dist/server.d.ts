import { Options } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { Module } from "./module";
import { ClassOf } from "./types/class.type";
interface ServerConfig {
    port: number | string;
    plugins?: any[];
    modules?: ClassOf<Module>[];
    databaseConfig: Options<PostgreSqlDriver>;
}
export declare class Server {
    private application;
    private port;
    private databaseConfig;
    private _modules;
    private _plugins;
    private moduleInstancesMap;
    private moduleInstances;
    private routeHandlerMap;
    private errorBinder;
    private memoryTrack;
    constructor({ port, plugins, modules, databaseConfig }: ServerConfig);
    private onRequest;
    run(): Promise<void>;
}
export {};
//# sourceMappingURL=server.d.ts.map