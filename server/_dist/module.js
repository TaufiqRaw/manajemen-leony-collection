"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Module = void 0;
const postgresql_1 = require("@mikro-orm/postgresql");
const express_1 = __importDefault(require("express"));
require("reflect-metadata");
const development_util_1 = require("./utils/development.util");
const decorator_util_1 = require("./utils/decorator.util");
const express_util_1 = require("./utils/express.util");
const lodash_1 = __importDefault(require("lodash"));
const MIDDLEWARE = "_midleware";
class Module {
    constructor(app, routeHandlerMap) {
        this.routeBinder = new Map();
        const config = this.config();
        this._services = config.services || [];
        this._controllers = config.controllers || [];
        this._entities = config.entities || [];
        this._imports = config.imports || [];
        this._exports = config.exports || [];
        this.app = app;
        this.init(routeHandlerMap);
    }
    init(routeHandlerMap) {
        const router = express_1.default.Router();
        this._controllers.forEach(controller => {
            console.log(`initiating controller [${controller.name}]`);
            //get all methods from controller
            const routes = Object.getOwnPropertyNames(controller.prototype).filter((property) => {
                return typeof controller.prototype[property] == 'function' && property !== 'constructor';
            });
            //create binder for router-wide middleware
            const routerMiddleware = Reflect.getMetadata("middleware", controller.prototype);
            if (routerMiddleware) {
                routerMiddleware.forEach((handler, i) => {
                    router.use((req, res, next) => {
                        this.routeBinder.get("routerMiddleware")[i](req, res, next);
                    });
                });
            }
            const rawRouterPath = Reflect.getMetadata("controller", controller.prototype);
            const routerPath = rawRouterPath ? "/" + rawRouterPath : "";
            //map routes to express router
            routes.forEach(route => {
                const metadata = Reflect.getMetadata("controller", controller.prototype, route);
                const rawMiddleware = Reflect.getMetadata("middleware", controller.prototype, route);
                const middleware = rawMiddleware ? rawMiddleware : [];
                //check if method has metadata and create route binder
                if (metadata) {
                    const path = routerPath + "/" + metadata.path;
                    //create binder for specific-route middleware
                    middleware.forEach((handler, i) => {
                        router.use(path, (req, res, next) => {
                            this.routeBinder.get(route + MIDDLEWARE)[i](req, res, next);
                        });
                    });
                    //create route and its binder
                    routeHandlerMap.set([metadata.method, path], [controller, controller.prototype[route]]);
                    router[metadata.method](path, (req, res, next) => {
                        this.routeBinder.get(route)[0](req, res, next);
                    });
                }
                else {
                    //if no metadata is found for a route handler, throw error
                    throw new Error(`Controller ${controller.name} has no metadata for method ${route}`);
                }
            });
        });
        const paths = router.stack.map(layer => layer.route);
        (0, development_util_1.devLog)(development_util_1.LOG_LEVEL.DEBUG, development_util_1.LOG_TYPE.SERVER, "Controllers", paths);
        this.app.use(router);
    }
    rebind(globalContainer, container, em) {
        //inject entities
        this._entities.forEach(repository => {
            const repo = em.getRepository(repository);
            container.bind((postgresql_1.EntityRepository)).toConstantValue(repo);
        });
        //inject imports
        this._imports.forEach(imported => {
            const moduleInstance = globalContainer.get(imported);
            moduleInstance.config().exports.forEach((exported) => {
                const instance = globalContainer.get(exported);
                container.bind(exported).toConstantValue(instance);
            });
        });
        //inject services
        this._services.forEach(service => {
            if (lodash_1.default.has(service, "token") && lodash_1.default.has(service, "bindTo")) //@ts-ignore
                container.bind(service.token).to(service.bindTo);
            //@ts-ignore
            container.bind(service).toSelf();
        });
        this._exports.forEach(exported => {
            const instance = container.get(exported);
            globalContainer.bind(exported).toConstantValue(instance);
        });
        //inject controllers and map routes
        this._controllers.forEach(controller => {
            container.bind(controller).toSelf();
            const instance = container.get(controller);
            //get all methods from controller
            const routes = Reflect.ownKeys(Object.getPrototypeOf(instance)).filter(function (property) {
                return typeof instance[property] == 'function' && property !== 'constructor';
            });
            //re-bind router-wide middleware
            const routerMiddleware = (0, decorator_util_1.getMiddleware)(instance, undefined, container);
            routerMiddleware && this.routeBinder.set("routerMiddleware", routerMiddleware);
            //re-bind route
            routes.forEach(route => {
                const metadata = Reflect.getMetadata("controller", instance, route);
                const rawMiddleware = (0, decorator_util_1.getMiddleware)(instance, String(route), container);
                const middleware = rawMiddleware ? rawMiddleware : [];
                //re-bind specific-route middleware
                this.routeBinder.set(String(route) + MIDDLEWARE, middleware);
                //check if method has metadata
                if (metadata) {
                    //re-bind route handler
                    this.routeBinder.set(String(route), [(0, express_util_1.routeHandlerWrapper)(instance[route].bind(instance), container)]);
                }
                else {
                    //if no metadata is found for a route handler, throw error
                    throw new Error(`Controller ${controller.name} has no metadata for method ${String(route)}`);
                }
            });
        });
    }
}
exports.Module = Module;
