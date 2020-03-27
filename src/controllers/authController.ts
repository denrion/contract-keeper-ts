import crypto from 'crypto';
import { CookieOptions, Response } from 'express';
import status from 'http-status';
import ResponseStatus from '../@types/ResponseStatus';
import { JWT_COOKIE_EXPIRES_IN } from '../config/constants';
import User, { UserDoc, UserProps } from '../models/User';
import catchAsync from '../utils/catchAsync';
import { sendEmail } from '../utils/email/sendEmail';
import BadRequestError from '../utils/errors/BadRequestError';
import InternalServerError from '../utils/errors/InternalServerError';
import NotFoundError from '../utils/errors/NotFoundError';
import UnauthorizedError from '../utils/errors/UnauthorizedError';

// @desc      Get Current Logged In user
// @route     GET /api/v1/auth/me
// @access    Private
export const getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(status.OK).json({
    success: ResponseStatus.SUCCESS,
    data: user,
  });
});

// @desc      Signup user
// @route     POST /api/v1/auth/signup
// @access    Public
export const signup = catchAsync(async (req, res, next) => {
  const { role, ...user } = req.body as UserProps;

  const newUser = await User.create(user);

  createAndSendToken(newUser, status.CREATED, res);
});

// @desc      Login user
// @route     POST /api/v1/auth/login
// @access    Public
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body as LoginCredentials;

  if (!email || !password)
    return next(new BadRequestError('Please provide email and password!'));

  const user = await User.findByEmail(email).select('+password');

  if (!user || !(await user.isCorrectPassword(password, user.password)))
    return next(new UnauthorizedError('Invalid credentials'));

  createAndSendToken(user, status.OK, res);
});

// @desc      Forgot Password
// @route     POST /api/v1/auth/forgotPassword
// @access    Public
export const forgotPassword = catchAsync(async (req, res, next) => {
  // 1) get user based on POSTed email
  const { email } = req.body as { email: string };

  const user = await User.findByEmail(email);

  if (!user)
    return next(new NotFoundError('There is no user with this email.'));

  // 2a) generate a random token
  const resetToken = user.createPasswordResetToken();

  // 2b) update user data in DB
  await user.save({ validateBeforeSave: false });

  // 3) send it back as an email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const text = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}\nIf you didn't forget your password, please ignore this message`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      text,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.save({ validateBeforeSave: false });

    return next(
      new InternalServerError(
        'There was an error sending an email. Try again later!'
      )
    );
  }

  res.status(status.OK).json({
    status: ResponseStatus.SUCCESS,
    message: `Reset token sent to the following email: ${user.email}`,
  });
});

// @desc      Reset Password
// @route     POST /api/v1/auth/resetPassword/:token
// @access    Public
export const resetPassword = catchAsync(async (req, res, next) => {
  // 1) get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = (await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  })) as UserDoc & { passwordConfirm: string };

  // 2) If token valid && user exists -> set new password
  if (!user)
    return next(new BadRequestError('Token is invalid or has expired'));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Log the user in, send JWT to client
  createAndSendToken(user, 200, res);
});

const createAndSendToken = (
  user: UserDoc,
  statusCode: number,
  res: Response
) => {
  const token = user.signToken();

  const cookieOptions: CookieOptions = {
    expires: new Date(
      Date.now() + JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000 // turn into milis
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.status(statusCode).cookie('jwt', token, cookieOptions).json({
    status: ResponseStatus.SUCCESS,
    data: { token, user },
  });
};

interface LoginCredentials {
  email: string;
  password: string;
}
