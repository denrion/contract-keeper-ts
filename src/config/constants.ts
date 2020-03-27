// SERVER
export const PORT = process.env.PORT || 3000;

// DB
export let DB_URI = process.env.MONGO_DB_ATLAS_PROD_URI + '';

if (process.env.NODE_ENV === 'development')
  DB_URI = process.env.MONGO_DB_ATLAS_DEV_URI + '';
if (process.env.NODE_ENV === 'testing')
  DB_URI = process.env.MONGO_DB_ATLAS_TEST_URI + '';

// JWT
export const JWT_SECRET = process.env.JWT_SECRET || 'appSecret123';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '90d';
export const JWT_COOKIE_EXPIRES_IN =
  +(process.env.JWT_COOKIE_EXPIRES_IN as string) || 90;

// RATE LIMITING
export const RATE_LIMIT_MAX_NUM_CONNECTIONS =
  +(process.env.RATE_LIMIT_MAX_NUM_CONNECTIONS as string) || 100;
export const RATE_LIMIT_KEEP_IN_MEMORY_LENGTH_MS =
  +(process.env.RATE_LIMIT_KEEP_IN_MEMORY_LENGTH_MS as string) ||
  60 * 60 * 1000;
export const RATE_LIMIT_MESSAGE =
  process.env.RATE_LIMIT_MESSAGE ||
  'Too many consecutive requests from this IP. Please try again in an hour';

// BODY PARSER
export const BODY_PARSER_SIZE_LIMIT =
  process.env.BODY_PARSER_SIZE_LIMIT || '10kb';

// MAILING
export const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.ethereal.email';
export const EMAIL_PORT = +(process.env.EMAIL_PORT as string) || 587;
export const EMAIL_USERNAME = process.env.EMAIL_USERNAME || '';
export const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || '';
