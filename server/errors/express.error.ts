export class ExpressError extends Error {
  statusCode : number;
  constructor(message: string, statusCode : number) {
    super("ExpressError: " + message);
    this.statusCode = statusCode;
  }
}