import { Types } from 'mongoose';
import {
  createSchema,
  ExtractDoc,
  ExtractProps,
  Type,
  typedModel,
} from 'ts-mongoose';
import {
  sanitizeMongoFields,
  sanitizeSpecifiedFields,
} from './../utils/sanitizeModel';
import User, { UserSchema } from './User';

export enum ContactType {
  PERSONAL = 'PERSONAL',
  PROFESSIONAL = 'PROFESSIONAL',
}

// ************************ SCHEMA ************************ //
const ContactSchema = createSchema(
  {
    name: Type.string({
      required: true,
      trim: true,
      minlength: [2, 'Name must contain at least 2 characters'],
      maxlength: [30, 'Name must not contain more than 30 characters'],
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
    phone: Type.string(),
    type: Type.string({
      enum: Object.keys(ContactType),
      default: ContactType.PERSONAL,
      required: true,
      uppercase: true,
    }),
    user: Type.ref(
      Type.objectId({
        required: true,
        validate: {
          validator: async (val: Types.ObjectId) => await User.exists(val),
          message: 'User with supplied id does not exist',
        },
      })
    ).to('User', UserSchema),
    // types of virtuals & custom functions go here
    // id comes from mongoose when virtuals are enabled
    ...({} as {
      id: string;
    }),
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
  }
);

// ************************ VIRTUALS ************************ // - add types to schema

// ************************ DOCUMENT MIDDLEWARE ************************ //

// ************************ INSTANCE METHODS ************************ // - add types to schema

ContactSchema.plugin(sanitizeMongoFields);
ContactSchema.plugin(sanitizeSpecifiedFields, []);

const Contact = typedModel('Contact', ContactSchema, undefined, undefined, {
  // ************************ STATIC METHODS ************************ //
});

export default Contact;
export type ContactDoc = ExtractDoc<typeof ContactSchema>;
export type ContactProps = ExtractProps<typeof ContactSchema>;
