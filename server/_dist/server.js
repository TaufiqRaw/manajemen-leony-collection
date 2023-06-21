"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const postgresql_1 = require("@mikro-orm/postgresql");
const express_1 = __importDefault(require("express"));
const inversify_1 = require("inversify");
const process_1 = __importDefault(require("process"));
const error_handler_1 = require("./error-handler");
const development_util_1 = require("./utils/development.util");
const express_http_context_1 = __importDefault(require("express-http-context"));
const minimist_1 = __importDefault(require("minimist"));
const route_handler_map_base_1 = require("./utils/route-handler-map.base");
const express_util_1 = require("./utils/express.util");
const fs_1 = __importDefault(require("fs"));
const module_instance_map_util_1 = require("./utils/module-instance-map.util");
class Server {
    constructor({ port, plugins, modules, databaseConfig }) {
        this.moduleInstancesMap = new module_instance_map_util_1.ModuleInstanceMap();
        this.moduleInstances = [];
        this.routeHandlerMap = new route_handler_map_base_1.RouteHandlerMap();
        this.errorBinder = () => { };
        this.memoryTrack = [];
        this.port = port;
        this.application = (0, express_1.default)();
        this._plugins = plugins || [];
        this._modules = modules || [];
        this.databaseConfig = databaseConfig;
    }
    onRequest(orm, executionContext) {
        console.clear();
        const reqContainer = new inversify_1.Container({ defaultScope: "Request" });
        express_http_context_1.default.set("executionContext", executionContext);
        //checking for memory leaks
        if ((0, development_util_1.isDevelopmentFor)(development_util_1.LOG_TYPE.MEMORY)) {
            const memoryUsage = process_1.default.memoryUsage();
            let key;
            for (const key in memoryUsage) {
                //@ts-ignore
                memoryUsage[key] = Math.round(memoryUsage[key] / 1024 / 1024 * 100) / 100 + " MB";
            }
            (0, development_util_1.devLog)(development_util_1.LOG_LEVEL.DEBUG, development_util_1.LOG_TYPE.MEMORY, memoryUsage);
            this.memoryTrack.push(process_1.default.memoryUsage().heapUsed);
        }
        (0, development_util_1.devLog)(development_util_1.LOG_LEVEL.DEBUG, development_util_1.LOG_TYPE.SERVER, "Route Length =", this.application._router.stack.length);
        //rebind modules
        (0, development_util_1.devLog)(development_util_1.LOG_LEVEL.INFO, development_util_1.LOG_TYPE.SERVER, "Rebinding Modules...");
        this.moduleInstances.forEach((module, i) => {
            const moduleContainer = new inversify_1.Container({ defaultScope: "Request" });
            module.rebind(reqContainer, moduleContainer, orm.em.fork());
            moduleContainer.unbindAll();
            reqContainer.bind(this._modules.find(key => module instanceof key)).toConstantValue(module);
        });
        //rebind error handler
        this.errorBinder = (err, req, res, next) => { error_handler_1.errorHandler.getMiddleware(reqContainer)(err, req, res, next); };
        //done injecting, unbind all from request container
        reqContainer.unbindAll();
        express_http_context_1.default.set("iocStatus", true);
        (0, development_util_1.devLog)(development_util_1.LOG_LEVEL.INFO, development_util_1.LOG_TYPE.SERVER, "Done rebinding");
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //check if development flag is set
                const logLevel = (0, minimist_1.default)(process_1.default.argv.slice(2)).level;
                const logType = (0, minimist_1.default)(process_1.default.argv.slice(2)).type;
                if (logLevel && !(Object.values(development_util_1.LOG_LEVEL).includes(logLevel))) {
                    throw new Error(`Invalid log level: ${logLevel}`);
                }
                if (logType && !(logType.split(",").every(type => Object.values(development_util_1.LOG_TYPE).includes(type)))) {
                    throw new Error(`Invalid log type: ${logType}`);
                }
                //initiate database
                const orm = yield postgresql_1.MikroORM.init(this.databaseConfig);
                //initiate plugins
                console.log("Initiating Plugins...");
                this._plugins.forEach(plugin => this.application.use(plugin));
                //create on request hook, and inject execution context
                this.application.use((req, res, next) => {
                    const path = (req.baseUrl + req.path).split("/").reduce((acc, curr) => acc + (curr !== "" ? "/" + curr : ""), "");
                    const executionContext = this.routeHandlerMap.get([(req.method), path]);
                    (0, development_util_1.devLog)(development_util_1.LOG_LEVEL.DEBUG, development_util_1.LOG_TYPE.SERVER, "Execution Context =", executionContext);
                    this.onRequest(orm, executionContext ? new express_util_1.ExecutionContext(executionContext[1], executionContext[0]) : undefined);
                    next();
                });
                //initiate modules
                console.log("Initiating Modules...");
                this._modules.forEach((module, i) => {
                    console.log(`(${i + 1}/${this._modules.length}) Instantiate Modules [${module.name}]`);
                    this.moduleInstancesMap.add(new module(this.application, this.routeHandlerMap));
                });
                (0, development_util_1.devLog)(development_util_1.LOG_LEVEL.DEBUG, development_util_1.LOG_TYPE.SERVER, "Route Handler Map =", this.routeHandlerMap);
                if (this._modules.length === 0)
                    throw new Error("No module found");
                this._modules.forEach(module => checkCircularDependency(this.moduleInstancesMap.get(module), [], this.moduleInstancesMap));
                this.moduleInstances = sortModulesByDependency(this._modules, this.moduleInstancesMap);
                //start server
                this.application.listen(this.port, () => {
                    console.log(`> Server running on http://localhost:${this.port}`);
                });
                //error handler
                this.application.use((err, req, res, next) => {
                    if (!express_http_context_1.default.get("iocStatus"))
                        return next(err);
                    this.errorBinder(err, req, res, next);
                });
                //log memory usage if development flag is set for memory 
                (0, development_util_1.isDevelopmentFor)(development_util_1.LOG_TYPE.MEMORY) && process_1.default.on("SIGINT", () => __awaiter(this, void 0, void 0, function* () {
                    fs_1.default.writeFileSync("./memory-track.log", this.memoryTrack.reduce((acc, curr) => acc + curr + "\n", ""));
                    process_1.default.exit();
                }));
            }
            catch (err) {
                console.error(err);
                process_1.default.exit(1);
            }
        });
    }
}
exports.Server = Server;
function checkCircularDependency(module, visited = [], moduleInstanceMap) {
    if (visited.includes(module)) {
        throw new Error('Circular dependency detected!');
    }
    visited.push(module);
    for (const importedModule of module._imports) {
        const instance = moduleInstanceMap.get(importedModule);
        checkCircularDependency(instance, visited, moduleInstanceMap);
    }
    visited.pop();
}
function sortModulesByDependency(modules, moduleInstanceMap) {
    const instances = modules.map(module => moduleInstanceMap.get(module));
    let sorted = [];
    const visited = [];
    for (const instance of instances) {
        visitModule(instance);
    }
    function visitModule(module) {
        if (visited.includes(module)) {
            sorted = sorted.filter((sortedModule) => sortedModule !== module);
        }
        else
            visited.push(module);
        sorted.push(module);
        for (const importedModule of module._imports) {
            const instance = moduleInstanceMap.get(importedModule);
            visitModule(instance);
        }
    }
    return sorted.reverse();
}
