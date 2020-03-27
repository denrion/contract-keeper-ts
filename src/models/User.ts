import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import {
  createSchema,
  ExtractDoc,
  ExtractProps,
  Type,
  typedModel,
} from 'ts-mongoose';
import { JWT_EXPIRES_IN, JWT_SECRET } from '../config/constants';
import {
  sanitizeMongoFields,
  sanitizeSpecifiedFields,
} from './../utils/sanitizeModel';

export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

// ************************ SCHEMA ************************ //
const UserSchema = createSchema(
  {
    firstName: Type.string({
      required: true,
      trim: true,
      minlength: [2, 'First name must contain at least 2 characters'],
      maxlength: [30, 'First name must not contain more than 30 characters'],
    }),
    lastName: Type.string({
      required: true,
      trim: true,
      minlength: [2, 'Last name must contain at least 2 characters'],
      maxlength: [50, 'Last name must not contain more than 50 characters'],
    }),
    email: Type.string({
      unique: true,
      lowercase: true,
      required: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email',
      ],
    }),
    role: Type.string({
      enum: [Role.USER],
      default: Role.USER,
      required: true,
      uppercase: true,
    }),
    password: Type.string({
      required: true,
      minlength: [8, 'Password must contain at least 8 characters'],
      maxlength: [50, 'Password must not contain more than 50 characters'],
      select: false,
    }),
    passwordChangedAt: Type.date({ select: false }),
    passwordResetToken: Type.string({ select: false }),
    passwordResetExpires: Type.date({ select: false }),
    // types of virtuals & custom functions go here
    // id comes from mongoose when virtuals are enabled
    ...({} as {
      id: string;
      fullName: string;
      isCorrectPassword(
        candidatePassword: string,
        userPassword: string
      ): Promise<boolean>;
      isPasswordChangedAfter(JWTTimestamp: Date): boolean;
      createPasswordResetToken(): string;
      signToken(): string;
    }),
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
  }
);

// ************************ VIRTUALS ************************ // - add types to schema
UserSchema.virtual('fullName').get(function (this: UserProps) {
  return !this.firstName || !this.lastName
    ? undefined
    : `${this.firstName} ${this.lastName}`;
});

UserSchema.virtual('passwordConfirm')
  .get(function (this: UserDoc & { _passwordConfirm: string }) {
    return this._passwordConfirm;
  })
  .set(function (this: UserDoc & { _passwordConfirm: string }, value: string) {
    this._passwordConfirm = value;
  });

// ************************ DOCUMENT MIDDLEWARE ************************ //

// Validate password confirmation
UserSchema.pre('validate', function (
  this: UserDoc & { passwordConfirm: string },
  next
) {
  if (!this.passwordConfirm)
    this.invalidate('passwordConfirm', 'passwordConfirm is required');

  if (this.password !== this.passwordConfirm) {
    this.invalidate('passwordConfirm', 'Passwords do not match');
  }
  next();
});

// Hash Password on create
UserSchema.pre<UserDoc>('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  next();
});

// Hash password on update
UserSchema.pre<UserDoc>('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = new Date(Date.now() - 1000);

  next();
});

// ************************ INSTANCE METHODS ************************ // - add types to schema
UserSchema.methods.isCorrectPassword = async (
  candidatePassword: string,
  userPassword: string
) => await bcrypt.compare(candidatePassword, userPassword);

// Check if password was changed after the JWT token was sent
UserSchema.methods.isPasswordChangedAfter = function (JWTTimestamp: Date) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = +this.passwordChangedAt.getTime() / 1000;
    return JWTTimestamp < new Date(changedTimeStamp);
  }

  return false;
};

UserSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // 10 minutes
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

UserSchema.methods.signToken = function () {
  return jwt.sign({ id: this.id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

UserSchema.plugin(sanitizeMongoFields);
UserSchema.plugin(sanitizeSpecifiedFields, [
  'password',
  'passwordConfirm',
  'passwordChangedAt',
  'passwordResetToken',
  'passwordResetExpires',
]);

const User = typedModel('User', UserSchema, undefined, undefined, {
  // ************************ STATIC METHODS ************************ //
  findByEmail: function (email: string) {
    return this.findOne({ email });
  },
});

export default User;
export type UserDoc = ExtractDoc<typeof UserSchema>;
export type UserProps = ExtractProps<typeof UserSchema>;
