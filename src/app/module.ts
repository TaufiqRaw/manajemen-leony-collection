import express, { Application, NextFunction, Request, RequestHandler, Response } from 'express';
import { Container } from 'inversify';
import 'reflect-metadata';
import { ControllerDecoratorMetadata } from './decorators/controller.decorator';
import { Class } from './types/class.type';
const router = express.Router()

interface ModuleConfig {
  services?: Class[]
  controllers?: Class[]
}

export abstract class Module {
  private _services : Class[]
  private _controllers : Class[]

  constructor(app : Application, container : Container){
    const config = this.config()
    this._services = config.services || []
    this._controllers = config.controllers || []

    this.init(app,container)
  }

  abstract config() : ModuleConfig

  init(app : Application, container : Container){

    //inject services
    this._services.forEach(service => {
      container.bind(service).toSelf()
    })

    //inject controllers and map routes
    this._controllers.forEach(controller => {
      container.bind(controller).toSelf()
      const instance = container.get(controller)
      const routes = Reflect.ownKeys(Object.getPrototypeOf(instance)).filter(function(property) {
          return typeof instance[property] == 'function' && property !== 'constructor';
      });

      //apply router-wide middleware
      const routerMiddleware = Reflect.getMetadata("middleware", instance) as RequestHandler[]
      routerMiddleware && router.use(routerMiddleware)

      const rawRouterPath = Reflect.getMetadata("controller", instance) as string
      const routerPath = rawRouterPath ? "/" + rawRouterPath : ""

      //map routes to express router
      routes.forEach(route => {
        const metadata = Reflect.getMetadata("controller", instance, route) as ControllerDecoratorMetadata
        const middleware = Reflect.getMetadata("middleware", instance, route) as RequestHandler[]

        //check if method has metadata
        if(metadata){
          const path = routerPath + "/" + metadata.path

          //apply route-specific middleware
            router[metadata.method](path, middleware || [], 
              (req : Request, res : Response,next : NextFunction)=>{
                const result = instance[route].bind(instance)(req,res,next)
                //if result is a promise, wait for it to resolve before sending response
                if(result instanceof Promise){
                  result.then((result : any)=>{
                    res.send(result)
                  })
                  result.catch(next)
                }else{
                  res.send(result)
                }
              }
            )
        }else{
          //if no metadata is found for a route handler, throw error
          throw new Error(`Controller ${controller.name} has no metadata for method ${String(route)}`)
        }
      })
    })
    
    app.use(router)
  }
}