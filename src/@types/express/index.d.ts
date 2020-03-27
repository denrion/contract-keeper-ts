import { Types } from 'mongoose';
import { UserProps } from '../../models/User';

declare module 'express-serve-static-core' {
  interface Request {
    user: UserProps;
    conditions: { [key: string]: string | Types.ObjectId };
  }
}
