import { RequestHandler } from 'express';
import { Role } from '../models/User';
import ForbiddenError from '../utils/errors/ForbiddenError';

const restrictTo = (...roles: Role[]): RequestHandler => (req, res, next) => {
  return !roles.includes(req.user.role)
    ? next(
        new ForbiddenError('You do not have permission to perform this action')
      )
    : next();
};

export default restrictTo;
