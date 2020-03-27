import status from 'http-status';
import AppError from './AppError';

export default class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, status.NOT_FOUND);
  }
}
