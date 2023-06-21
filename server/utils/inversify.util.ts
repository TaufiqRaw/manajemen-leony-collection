import { Container } from "inversify";
import { Class } from "../types/class.type";

export function bindDependencies<T extends Function>(func : T, dependencies : Class[], container : Container) : T {

  let injections = dependencies.map((dependency) => {
      return container.get(dependency);
  });
  return func.bind(func, ...injections);
}