import colors from 'colors';
import { ErrorRequestHandler, Response } from 'express';
import status from 'http-status';
import ResponseStatus from '../@types/ResponseStatus';
import BadRequestError from '../utils/errors/BadRequestError';
import UnauthorizedError from '../utils/errors/UnauthorizedError';

const sendErrorDev = (err: any, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack
  });
};

const sendErrorProd = (err: any, res: Response) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });

    // Programming or other unknown error: don`t leak the error detals
  } else {
    // 1) Log error: for DEVS
    // eslint-disable-next-line no-console
    console.error(colors.red('ERROR 💥 %s'), err);

    // 2) Send generic message: for CLIENT
    res.status(status.INTERNAL_SERVER_ERROR).json({
      status: ResponseStatus.ERROR,
      message: 'Something went very wrong'
    });
  }
};

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || status.INTERNAL_SERVER_ERROR;
  err.status = err.status || ResponseStatus.ERROR;

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    else if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    else if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    else if (error.name === 'JsonWebTokenError') error = handleJWTError();
    else if (error.name === 'TokenExpiredError')
      error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

// Handle specific error functions
const handleCastErrorDB = (err: any) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new BadRequestError(message);
};

const handleDuplicateFieldsDB = (err: any) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new BadRequestError(message);
};

const handleValidationErrorDB = (err: any) => {
  const errors = Object.values(err.errors).map((error: any) => error.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new BadRequestError(message);
};

const handleJWTError = () =>
  new UnauthorizedError('Invalid token. Please log in again.');

const handleJWTExpiredError = () =>
  new UnauthorizedError('JWT token expired. Please log in again.');

export default globalErrorHandler;
