import { ExecutionContext } from "@/app/utils/express.util"
import httpContext from "express-http-context"

export function getExecutionContext(): ExecutionContext {
  const executionContext = httpContext.get("executionContext") as ExecutionContext
  if (!executionContext) {
    throw new Error("execution context not found : Probably you are not in a request context")
  }
  return executionContext
}