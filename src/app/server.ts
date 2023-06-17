import mikroOrmConfig from "@/database/mikro-orm.config"
import { ReflectMetadataProvider } from "@mikro-orm/core"
import { MikroORM, PostgreSqlDriver } from "@mikro-orm/postgresql"
import Express,{ Application } from "express"
import { Container } from "inversify"
import process from "process"
import { errorHandler } from "./error-handler"
import { Module } from "./module"
import { ClassOf } from "./types/class.type"
import { devLog, isDevelopment } from "./utils/helper"
import httpContext from "express-http-context"

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

    //checking for memory leaks
    devLog(process.memoryUsage())
    devLog("Route Length =",this.application._router.stack.length)
    
    //rebind modules
    devLog("Rebinding Modules...")
    this.moduleInstances.forEach(module => {
      module.rebind(httpContext.get("container"), orm.em.fork())
    })
    
    devLog("Done rebinding")
  }
  
  public async run() {
    try {
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