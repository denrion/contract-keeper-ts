import status from 'http-status';
import AppError from './AppError';

export default class ForbiddenError extends AppError {
  constructor(message: string) {
    super(message, status.FORBIDDEN);
  }
}
