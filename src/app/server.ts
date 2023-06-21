import mikroOrmConfig from "@/database/mikro-orm.config"
import { ReflectMetadataProvider } from "@mikro-orm/core"
import { MikroORM, PostgreSqlDriver } from "@mikro-orm/postgresql"
import Express,{ Application, RequestHandler } from "express"
import { Container } from "inversify"
import process from "process"
import { errorHandler } from "./error-handler"
import { Module } from "./module"
import { Class, ClassOf } from "./types/class.type"
import { devLog, isDevelopment, isDevelopmentFor, LOG_LEVEL, LOG_TYPE } from "./utils/development.util"
import httpContext from "express-http-context"
import minimist from "minimist"
import { HTTP_METHOD } from "./constants/http-method.constant"
import { RouteHandlerMap } from "./utils/route-handler-map.base"
import { ExpressError } from "./errors/express.error"
import { ExecutionContext } from "./utils/express.util"
import fs from "fs"
import { ModuleInstanceMap } from "./utils/module-instance-map.util"

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

  private moduleInstancesMap : ModuleInstanceMap
  private moduleInstances : Module[] = []
  private routeHandlerMap : RouteHandlerMap = new RouteHandlerMap()

  private errorBinder : Function = ()=>{}

  private memoryTrack:number[] = []

  constructor({port, plugins, modules}:ServerConfig) {
    this.port = port
    this.application = Express()
    this._plugins = plugins || []
    this._modules = modules || []
    this.moduleInstancesMap = new ModuleInstanceMap(this._modules)
  }

  private onRequest(orm : MikroORM, executionContext : ExecutionContext | undefined) {
    console.clear();
    const reqContainer = new Container({defaultScope: "Request"})
    httpContext.set("executionContext", executionContext)

    //checking for memory leaks
    if(isDevelopmentFor(LOG_TYPE.MEMORY)){
      const memoryUsage = process.memoryUsage()
      let key : keyof NodeJS.MemoryUsage
      for (const key in memoryUsage) {
        //@ts-ignore
        memoryUsage[key] = Math.round((memoryUsage[key] as number) / 1024 / 1024 * 100) / 100 + " MB"
      }
      devLog(LOG_LEVEL.DEBUG, LOG_TYPE.MEMORY, memoryUsage)

      this.memoryTrack.push(process.memoryUsage().heapUsed)
    }

    devLog(LOG_LEVEL.DEBUG, LOG_TYPE.SERVER ,"Route Length =",this.application._router.stack.length)

    //rebind modules
    devLog(LOG_LEVEL.INFO, LOG_TYPE.SERVER, "Rebinding Modules...")
    this.moduleInstances.forEach((module,i) => {
      const moduleContainer = new Container({defaultScope: "Request"})
      module.rebind(reqContainer,moduleContainer, orm.em.fork())
      moduleContainer.unbindAll();
      reqContainer.bind(this._modules[i]).toConstantValue(module)
    })

    //rebind error handler
    this.errorBinder = (err:any, req:any, res:any, next:any)=>{errorHandler.getMiddleware(reqContainer)(err, req, res, next)}

    //done injecting, unbind all from request container
    reqContainer.unbindAll()

    httpContext.set("iocStatus", true)
    
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
        this.moduleInstancesMap.add(new module(this.application, this.routeHandlerMap));
      })
      devLog(LOG_LEVEL.DEBUG, LOG_TYPE.SERVER, "Route Handler Map =",this.routeHandlerMap)

      if(this._modules.length === 0)
        throw new Error("No module found")

      this._modules.forEach(module => 
        checkCircularDependency(this.moduleInstancesMap.get(module)!, [], this.moduleInstancesMap))
      this.moduleInstances = sortModulesByDependency(this._modules, this.moduleInstancesMap)
      
      //start server
      this.application.listen(this.port, () => {
        console.log(`> Server running on http://localhost:${this.port}`)
      })

      //error handler
      this.application.use((err:any, req:any ,res:any ,next:any)=>{
        if(!httpContext.get("iocStatus"))
          return next(err)
        this.errorBinder(err, req,res,next)
      })

      //log memory usage if development flag is set for memory 
      isDevelopmentFor(LOG_TYPE.MEMORY) && process.on("SIGINT", async () => {
        fs.writeFileSync("./memory-track.log", this.memoryTrack.reduce((acc, curr) => acc + curr + "\n", ""))
        process.exit()
      })

    } catch (err) {
      console.error(err)
      process.exit(1)
    }
  }
}

function checkCircularDependency(module: Module, visited: Module[] = [], moduleInstanceMap : ModuleInstanceMap) {
  if (visited.includes(module)) {
    throw new Error('Circular dependency detected!');
  }

  visited.push(module);

  for (const importedModule of module._imports) {
    const instance = moduleInstanceMap.get(importedModule)!
    checkCircularDependency(instance, visited, moduleInstanceMap);
  }

  visited.pop();
}

function sortModulesByDependency(modules: ClassOf<Module>[], moduleInstanceMap : ModuleInstanceMap): Module[] {
  const instances = modules.map(module => moduleInstanceMap.get(module)!);
  const sorted: Module[] = [];
  const visited: Module[] = [];

  for (const instance of instances) {
    visitModule(instance);
  }

  function visitModule(module: Module) {
    if (visited.includes(module)) {
      return;
    }

    visited.push(module);

    for (const importedModule of module._imports) {
      const instance = moduleInstanceMap.get(importedModule)!
      visitModule(instance);
    }

    sorted.push(module);
  }



  return sorted;
}