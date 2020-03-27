import status from 'http-status';
import AppError from './AppError';

export default class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, status.BAD_REQUEST);
  }
}
