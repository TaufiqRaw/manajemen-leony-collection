import Express,{ Application } from "express"
import { Container } from "inversify"
import { errorHandler } from "./error-handler"
import { Module } from "./module"
import { ClassOf } from "./types/class.type"

interface ServerConfig {
  port: number|string
  plugins?: any[]
  modules?: ClassOf<Module>[]
}

export class Server {
  private application: Application
  private port: number|string
  private container : Container

  private _modules: ClassOf<Module>[]
  private _plugins : any[]

  constructor({port, plugins, modules}:ServerConfig) {
    this.port = port
    this.application = Express()
    this._plugins = plugins || []
    this._modules = modules || []
    this.container = new Container({
      defaultScope : "Singleton",
    })
  }
  
  public run() {
    try {
      //initiate plugins
      console.log("Initiating Plugins...")
      this._plugins.forEach(plugin => this.application.use(plugin))

      //initiate modules
      console.log("Initiating Modules...")
      this._modules.forEach((module, i) => {
        console.log(`(${i + 1}/${this._modules.length}) Injecting Modules [${module.name}]`)
        new module(this.application,this.container)
      })

      //error handler
      this.application.use(errorHandler)

      //start server
      this.application.listen(this.port, () => {
        console.log(`> Server running on http://localhost:${this.port}`)
      })
    } catch (err) {
      console.error(err)
      process.exit(1)
    }
  }
}