export default class AppError extends Error {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;
  public type: string;
  constructor(
    message: string,
    statusCode: number = 500,
    type: string = "appError",
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = isOperational;
    this.type = type;

    Error.captureStackTrace(this, this.constructor);
  }
}
