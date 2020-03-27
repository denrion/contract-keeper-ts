import ResponseStatus from '../../@types/ResponseStatus';

export default class AppError extends Error {
  public status: string;
  public isOperational: boolean;

  constructor(message: string, public statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4')
      ? ResponseStatus.FAILURE
      : ResponseStatus.ERROR;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
