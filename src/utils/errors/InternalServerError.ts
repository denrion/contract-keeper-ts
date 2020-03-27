import status from 'http-status';
import AppError from './AppError';

export default class InternalServerError extends AppError {
  constructor(message: string) {
    super(message, status.INTERNAL_SERVER_ERROR);
  }
}
