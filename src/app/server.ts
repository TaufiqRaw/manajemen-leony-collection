import mikroOrmConfig from "@/database/mikro-orm.config"
import { ReflectMetadataProvider } from "@mikro-orm/core"
import { MikroORM, PostgreSqlDriver } from "@mikro-orm/postgresql"
import Express,{ Application, RequestHandler } from "express"
import { Container } from "inversify"
import process from "process"
import { errorHandler } from "./error-handler"
import { Module } from "./module"
import { ClassOf } from "./types/class.type"
import { devLog, isDevelopment, LOG_LEVEL, LOG_TYPE } from "./utils/development.util"
import httpContext from "express-http-context"
import minimist from "minimist"

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

  constructor({port, plugins, modules}:ServerConfig) {
    this.port = port
    this.application = Express()
    this._plugins = plugins || []
    this._modules = modules || []
  }

  public onRequest(orm : MikroORM) {
    httpContext.set("container", new Container({defaultScope: "Request"}))
    httpContext.set("routesHandler", new Map<string, RequestHandler[]>())

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

      //on request
      this.application.use((req, res, next) => {
        this.onRequest(orm)
        next()
      })

      //initiate modules
      console.log("Initiating Modules...")
      this._modules.forEach((module, i) => {
        console.log(`(${i + 1}/${this._modules.length}) Instantiate Modules [${module.name}]`)
        this.moduleInstances.push(new module(this.application))
      })

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