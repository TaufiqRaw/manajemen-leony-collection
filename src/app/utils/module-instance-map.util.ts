import { HTTP_METHOD } from "../constants/http-method.constant"
import {RequestHandler} from "express"
import { Class, ClassOf } from "../types/class.type"
import { ParamsDictionary } from "express-serve-static-core"
import { ParsedQs } from "qs"
import {Router} from "express"
import { pathToRegexp } from "path-to-regexp"
import {Module} from "../module"

export class ModuleInstanceMap {
  private _entries : Module[] = []
  private _keys : ClassOf<Module>[] = []
  constructor(keys : ClassOf<Module>[]){
    this._keys = keys
  }

  getClassOf(module : Module){
    return this._keys.find(key => module instanceof key)
  }

  get(module : ClassOf<Module>){
    return this._entries.find(entry => entry instanceof module)
  }

  add(module : Module){
    this._entries.push(module)
  }

  remove(module : ClassOf<Module>){
    this._entries = this._entries.filter(entry => !(entry instanceof module))
  }

  forEach(callback : (module : Module)=>void){
    this._entries.forEach(callback)
  }
}