import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import express, { Application, NextFunction, Request, RequestHandler, Response } from 'express';
import { Container, decorate, injectable } from 'inversify';
import 'reflect-metadata';
import { ControllerDecoratorMetadata } from './decorators/controller.decorator';
import { Class } from './types/class.type';
import { devLog, LOG_LEVEL, LOG_TYPE } from './utils/development.util';
import httpContext from "express-http-context" 
import { getMiddleware } from './utils/decorator.util';
import { routeHandlerWrapper } from './utils/express.util';

const PLACEHOLDER_HANDLER = (req : Request, res : Response, next : NextFunction) => {res.send("bruh")}
const MIDDLEWARE = "_midleware"

interface ModuleConfig {
  services?: Class[]
  controllers?: Class[]
  entities?: Class[]
}

export abstract class Module {
  private _services : Class[]
  private _controllers : Class[]
  private _entities : Class[]
  private app : Application

  constructor(app : Application){
    const config = this.config()
    this._services = config.services || []
    this._controllers = config.controllers || []
    this._entities = config.entities || []
    this.app = app
    this.init()
  }

  abstract config() : ModuleConfig

  init(){
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
            httpContext.get("routesHandler")?.get("routerMiddleware")![i](req, res, next)
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
              httpContext.get("routesHandler")?.get(route+MIDDLEWARE)![i](req, res, next)
            })
          })

          //create route binder
          router[metadata.method](path, (req, res, next) => {
            httpContext.get("routesHandler")?.get(route)![0](req, res, next)
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

  rebind(container : Container, em : EntityManager){

    //inject entities
    this._entities.forEach(repository => {
      const repo =  em.getRepository(repository);
      container.bind(EntityRepository<typeof repository>).toConstantValue(repo);
    })

    //inject services
    this._services.forEach(service => {
      container.bind(service).toSelf()
    })

    //inject controllers and map routes
    this._controllers.forEach(controller => {
      container.bind(controller).toSelf()
      const instance = container.get(controller)
      //get all methods from controller
      const routes = Reflect.ownKeys(Object.getPrototypeOf(instance)).filter(function(property) {
          return typeof instance[property] == 'function' && property !== 'constructor';
      });

      //re-bind router-wide middleware
      const routerMiddleware = getMiddleware(instance) as RequestHandler[]
      routerMiddleware && httpContext.get("routesHandler").set("routerMiddleware", routerMiddleware)

      //re-bind route
      routes.forEach(route => {
        const metadata = Reflect.getMetadata("controller", instance, route) as ControllerDecoratorMetadata
        const rawMiddleware = getMiddleware(instance, String(route)) as RequestHandler[] | undefined
        const middleware = rawMiddleware ? rawMiddleware : [] ;

        //re-bind specific-route middleware
        httpContext.get("routesHandler")?.set(String(route)+MIDDLEWARE , middleware)

        //check if method has metadata
        if(metadata){
          //re-bind route handler
          httpContext.get("routesHandler")?.set(String(route) , [routeHandlerWrapper(instance[route].bind(instance))])
        }else{
          //if no metadata is found for a route handler, throw error
          throw new Error(`Controller ${controller.name} has no metadata for method ${String(route)}`)
        }
      })
    })
  }
}