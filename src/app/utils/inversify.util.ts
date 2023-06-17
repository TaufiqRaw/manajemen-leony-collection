import { Class } from "../types/class.type";
import httpContext from "express-http-context"

export function bindDependencies<T extends Function>(func : T, dependencies : Class[]) : T {
  const container = httpContext.get("container") 
  if(!container)
    throw new Error("Container not found in httpContext")

  let injections = dependencies.map((dependency) => {
      return container.get(dependency);
  });
  return func.bind(func, ...injections);
}