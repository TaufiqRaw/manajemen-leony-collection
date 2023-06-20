import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import express, { Application, NextFunction, Request, RequestHandler, Response } from 'express';
import { Container, decorate, injectable } from 'inversify';
import 'reflect-metadata';
import { ControllerDecoratorMetadata } from './decorators/controller.decorator';
import { Class, ClassOf } from './types/class.type';
import { devLog, LOG_LEVEL, LOG_TYPE } from './utils/development.util';
import { getMiddleware } from './utils/decorator.util';
import { routeHandlerWrapper } from './utils/express.util';
import { RouteHandlerMap } from './bases/route-handler-map.base';
import { RouteBinder } from './types/route-binder.type';
import httpContext from 'express-http-context';
import _ from 'lodash'

const MIDDLEWARE = "_midleware"

interface ModuleConfig {
  imports?: Class[]
  services?: (Class | {token : Class, bindTo : Class})[]
  controllers?: Class[]
  entities?: Class[]
  exports ?: Class[]
}

export abstract class Module {
  private _imports : ClassOf<Module>[]
  private _services : (Class | {token : Class, bindTo : Class})[]
  private _controllers : Class[]
  private _entities : Class[]
  public readonly _exports : Class[]
  private app : Application
  private routeBinder : RouteBinder = new Map<string, RequestHandler[]>()

  constructor(app : Application, routeHandlerMap : RouteHandlerMap){
    const config = this.config()
    this._services = config.services || []
    this._controllers = config.controllers || []
    this._entities = config.entities || []
    this._imports = config.imports || []
    this._exports = config.exports || []
    this.app = app
    this.init(routeHandlerMap)
  }

  abstract config() : ModuleConfig

  init(routeHandlerMap : RouteHandlerMap){
    const router = express.Router()

    this._controllers.forEach(controller => {
      console.log(`initiating controller [${controller.name}]`)
      //get all methods from controller
      const routes = Object.getOwnPropertyNames(controller.prototype).filter((property) => {
        return typeof controller.prototype[property] == 'function' && property !== 'constructor';
      })

      //create binder for router-wide middleware
      const routerMiddleware = Reflect.getMetadata("middleware", controller.prototype) as RequestHandler[]
      if(routerMiddleware){
        routerMiddleware.forEach((handler, i)=>{
          router.use((req, res, next) => {
            this.routeBinder.get("routerMiddleware")![i](req, res, next)
          })
        })
      }

      const rawRouterPath = Reflect.getMetadata("controller", controller.prototype) as string
      const routerPath = rawRouterPath ? "/" + rawRouterPath : ""

      //map routes to express router
      routes.forEach(route => {
        const metadata = Reflect.getMetadata("controller", controller.prototype, route) as ControllerDecoratorMetadata
        const rawMiddleware = Reflect.getMetadata("middleware", controller.prototype, route) as RequestHandler[] | undefined
        const middleware = rawMiddleware ? rawMiddleware : [] ;

        //check if method has metadata and create route binder
        if(metadata){
          const path = routerPath + "/" + metadata.path

          //create binder for specific-route middleware
          middleware.forEach((handler, i)=>{
            router.use(path, (req, res, next) => {
              this.routeBinder.get(route+MIDDLEWARE)![i](req, res, next)
            })
          })

          //create route and its binder
          routeHandlerMap.set([metadata.method, path], [controller,controller.prototype[route]] )
          router[metadata.method](path, (req, res, next) => {
            this.routeBinder.get(route)![0](req, res, next)
          })

        }else{
          //if no metadata is found for a route handler, throw error
          throw new Error(`Controller ${controller.name} has no metadata for method ${route}`)
        }
      })
    })

    const paths = router.stack.map(layer => layer.route)
    devLog(LOG_LEVEL.DEBUG, LOG_TYPE.SERVER ,"Controllers", paths)

    this.app.use(router)
  }

  rebind(globalContainer : Container ,container : Container, em : EntityManager){

    //inject entities
    this._entities.forEach(repository => {
      const repo =  em.getRepository(repository);
      container.bind(EntityRepository<typeof repository>).toConstantValue(repo);
    })

    //inject imports
    this._imports.forEach(imported => {
      const moduleInstance = globalContainer.get(imported)
      moduleInstance.config().exports.forEach((exported : Class) => {
        const instance = globalContainer.get(exported)
        container.bind(exported).toConstantValue(instance)
      })
    })

    //inject services
    this._services.forEach(service => {
      if(_.has(service, "token") && _.has(service, "bindTo")) //@ts-ignore
        container.bind(service.token).to(service.bindTo) 
      
      //@ts-ignore
      container.bind(service).toSelf()
    })

    this._exports.forEach(exported => {
      const instance = container.get(exported)
      globalContainer.bind(exported).toConstantValue(instance)})

    //inject controllers and map routes

    this._controllers.forEach(controller => {
      container.bind(controller).toSelf()
      const instance = container.get(controller)
      //get all methods from controller
      const routes = Reflect.ownKeys(Object.getPrototypeOf(instance)).filter(function(property) {
          return typeof instance[property] == 'function' && property !== 'constructor';
      });

      //re-bind router-wide middleware
      const routerMiddleware = getMiddleware(instance, undefined, container) as RequestHandler[]
      routerMiddleware && this.routeBinder.set("routerMiddleware", routerMiddleware)

      //re-bind route
      routes.forEach(route => {
        const metadata = Reflect.getMetadata("controller", instance, route) as ControllerDecoratorMetadata
        const rawMiddleware = getMiddleware(instance, String(route), container) as RequestHandler[] | undefined
        const middleware = rawMiddleware ? rawMiddleware : [] ;

        //re-bind specific-route middleware
        this.routeBinder.set(String(route)+MIDDLEWARE , middleware)

        //check if method has metadata
        if(metadata){
          //re-bind route handler
          this.routeBinder.set(String(route) , [routeHandlerWrapper(instance[route].bind(instance), container)])
        }else{
          //if no metadata is found for a route handler, throw error
          throw new Error(`Controller ${controller.name} has no metadata for method ${String(route)}`)
        }
      })
    })
  }
}