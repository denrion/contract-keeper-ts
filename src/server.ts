import colors from 'colors';
import 'dotenv/config';
import app from './app';
import connectMongoDB from './config/connectMongoDB';
import { PORT } from './config/constants';

connectMongoDB();

const server = app.listen(PORT, () =>
  console.log(
    colors.yellow.bold('Server is running in %s mode, on port %s'),
    process.env.NODE_ENV,
    PORT
  )
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: any, promise: Promise<any>) => {
  console.error(colors.red('Error: %s'), err.message);
  // Close server & exit process
  server.close(() => process.exit(1));
});
