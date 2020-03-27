import compression from 'compression';
import cors from 'cors';
import express, { Application } from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import xss from 'xss-clean';
import {
  RATE_LIMIT_KEEP_IN_MEMORY_LENGTH_MS,
  RATE_LIMIT_MAX_NUM_CONNECTIONS,
  RATE_LIMIT_MESSAGE,
} from './config/constants';
import globalErrorHandler from './controllers/errorController';
import { authRouter } from './routes/authRoutes';
import { contactRouter } from './routes/contactRoutes';
import { userRouter } from './routes/userRoutes';
import NotImplementedError from './utils/errors/NotImplementedError';

const app: Application = express();

// 1) GLOBAL MIDDLEWARES

// SET security HTTP headers
app.use(helmet());

// Rate limiting - for stopping BRUTE FORCE attacks from same IP
const limiter = rateLimit({
  max: RATE_LIMIT_MAX_NUM_CONNECTIONS!,
  windowMs: RATE_LIMIT_KEEP_IN_MEMORY_LENGTH_MS!,
  message: RATE_LIMIT_MESSAGE,
});

app.use('/api', limiter);

// Body Parser, reading data from body into req.body
app.use(express.json({ limit: process.env.BODY_PARSER_SIZE_LIMIT }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization agains XSS
app.use(xss());

// Prevent http parameter polution
// specify parameters that are allowed to be repeated
app.use(
  hpp({
    whitelist: [],
  })
);

// Compress API data
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(cors());

// 2) ROUTES
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/contacts', contactRouter);

app.all('*', (req, res, next) => {
  next(
    new NotImplementedError(`Cannot find ${req.originalUrl} on this server!`)
  );
});

// // 3) ERROR HANDLING
app.use(globalErrorHandler);

export default app;
