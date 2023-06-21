import { HTTP_METHOD } from "../constants/http-method.constant"
import {RequestHandler} from "express"
import { Class } from "../types/class.type"
import { ParamsDictionary } from "express-serve-static-core"
import { ParsedQs } from "qs"
import {Router} from "express"
import { pathToRegexp } from "path-to-regexp"

export class RouteHandlerMap extends Map<[HTTP_METHOD, string], [Class,RequestHandler]> {
  constructor(){
    super()
  }

  get(key: [HTTP_METHOD, string]): [Class, RequestHandler] | undefined {
    for (const [k, v] of this.entries()) {
      if(k[0] !== key[0].toLocaleLowerCase()) 
        continue

      const keyRegex = pathToRegexp(k[1])
      if (keyRegex.test(key[1]))
        return v
    }

    const keysWithColon: [HTTP_METHOD, string][] = [];

    return undefined;
  }

  set(key: [HTTP_METHOD, string], value: [Class, RequestHandler]): this {
    return super.set([key[0], key[1]], value);
  }

  delete(key: [HTTP_METHOD, string]): boolean {
    for (const [k, v] of this.entries()) {
      if (k[0] === key[0] && k[1] === key[1]) {
        return super.delete(k);
      }
    }
    return false;
  }
}