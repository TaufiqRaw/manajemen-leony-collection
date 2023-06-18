import mikroOrmConfig from "@/database/mikro-orm.config"
import { ReflectMetadataProvider } from "@mikro-orm/core"
import { MikroORM, PostgreSqlDriver } from "@mikro-orm/postgresql"
import Express,{ Application, RequestHandler } from "express"
import { Container } from "inversify"
import process from "process"
import { errorHandler } from "./error-handler"
import { Module } from "./module"
import { Class, ClassOf } from "./types/class.type"
import { devLog, isDevelopment, LOG_LEVEL, LOG_TYPE } from "./utils/development.util"
import httpContext from "express-http-context"
import minimist from "minimist"
import { HTTP_METHOD } from "./constants/http-method.constant"
import { RouteHandlerMap } from "./bases/route-handler-map.base"
import { ExpressError } from "./errors/express.error"
import { ExecutionContext } from "./utils/express.util"

interface ServerConfig {
  port: number|string
  plugins?: any[]
  modules?: ClassOf<Module>[]
}

export class Server {
  private application: Application
  private port: number|string

  private _modules: ClassOf<Module>[]
  private _plugins : any[]

  private moduleInstances : Module[] = []
  private routeHandlerMap : RouteHandlerMap = new RouteHandlerMap()

  constructor({port, plugins, modules}:ServerConfig) {
    this.port = port
    this.application = Express()
    this._plugins = plugins || []
    this._modules = modules || []
  }

  private onRequest(orm : MikroORM, executionContext : ExecutionContext | undefined) {
    httpContext.set("container", new Container({defaultScope: "Request"}))
    httpContext.set("routesHandler", new Map<string, RequestHandler[]>());
    httpContext.set("executionContext", executionContext)

    //checking for memory leaks
    devLog(LOG_LEVEL.DEBUG, LOG_TYPE.MEMORY,process.memoryUsage())
    devLog(LOG_LEVEL.DEBUG, LOG_TYPE.SERVER ,"Route Length =",this.application._router.stack.length)
    
    //rebind modules
    devLog(LOG_LEVEL.INFO, LOG_TYPE.SERVER, "Rebinding Modules...")
    this.moduleInstances.forEach(module => {
      module.rebind(httpContext.get("container"), orm.em.fork())
    })
    
    devLog(LOG_LEVEL.INFO, LOG_TYPE.SERVER,"Done rebinding")
  }
  
  public async run() {
    try {
      //check if development flag is set
      const logLevel = minimist(process.argv.slice(2)).level
      const logType : string = minimist(process.argv.slice(2)).type

      if(logLevel && !(Object.values(LOG_LEVEL).includes(logLevel))){
        throw new Error(`Invalid log level: ${logLevel}`)
      }
      if(logType && !(logType.split(",").every(type => Object.values(LOG_TYPE).includes(type as LOG_TYPE)))){
        throw new Error(`Invalid log type: ${logType}`)
      }

      //initiate database
      const orm = await MikroORM.init<PostgreSqlDriver>(mikroOrmConfig)

      //initiate plugins
      console.log("Initiating Plugins...")
      this._plugins.forEach(plugin => this.application.use(plugin))

      //create on request hook, and inject execution context
      this.application.use((req, res, next) => {
        const path = (req.baseUrl + req.path).split("/").reduce((acc, curr) => acc + (curr !== "" ? "/" + curr : ""), "")
        const executionContext = this.routeHandlerMap.get([(req.method) as HTTP_METHOD, path])

        devLog(LOG_LEVEL.DEBUG, LOG_TYPE.SERVER, "Execution Context =", executionContext)

        this.onRequest(orm, executionContext ? new ExecutionContext(executionContext[1], executionContext[0]): undefined)
        next()
      })

      //initiate modules
      console.log("Initiating Modules...")
      this._modules.forEach((module, i) => {
        console.log(`(${i + 1}/${this._modules.length}) Instantiate Modules [${module.name}]`)
        this.moduleInstances.push(new module(this.application, this.routeHandlerMap))
      })
      devLog(LOG_LEVEL.DEBUG, LOG_TYPE.SERVER, "Route Handler Map =",this.routeHandlerMap)

      //start server
      this.application.listen(this.port, () => {
        console.log(`> Server running on http://localhost:${this.port}`)
      })

      //error handler
      this.application.use(errorHandler)
    } catch (err) {
      console.error(err)
      process.exit(1)
    }
  }
}