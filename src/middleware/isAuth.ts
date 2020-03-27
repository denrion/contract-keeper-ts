import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/constants';
import User from '../models/User';
import catchAsync from '../utils/catchAsync';
import UnauthorizedError from '../utils/errors/UnauthorizedError';

const isAuth = catchAsync(async (req, res, next) => {
  const token = getJWTTokenFromHeader(req);

  if (!token)
    return next(
      new UnauthorizedError('Not authenticated. Please log in to get access')
    );

  const decoded = jwt.verify(token, JWT_SECRET) as JWTTokenPayload;

  const freshUser = await User.findById(decoded.id);

  if (!freshUser)
    return next(
      new UnauthorizedError(
        'The user, to whom this token belongs, no longer exists.'
      )
    );

  // Check if user changed password after the token was issued
  if (freshUser.isPasswordChangedAfter(decoded.iat))
    return next(
      new UnauthorizedError(
        'The password was recently changed! Please log in again.'
      )
    );

  // place fresh user on the request object
  req.user = freshUser;

  // GRANT ACCESS TO THE PROTECTED ROUTE
  next();
});

const getJWTTokenFromHeader = (req: Request) => {
  return req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
    ? req.headers.authorization.split(' ')[1]
    : undefined;
};

interface JWTTokenPayload {
  id: string;
  iat: Date;
}

export default isAuth;
