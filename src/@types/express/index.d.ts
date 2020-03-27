import { UserProps } from '../../models/User';

declare module 'express-serve-static-core' {
  interface Request {
    user: UserProps;
  }
}
