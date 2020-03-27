import colors from 'colors';
import { createTransport } from 'nodemailer';
import {
  EMAIL_HOST,
  EMAIL_PASSWORD,
  EMAIL_PORT,
  EMAIL_USERNAME,
} from '../../config/constants';

export async function createProdTransporter() {
  const transporter = createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: true,
    auth: {
      user: EMAIL_USERNAME,
      pass: EMAIL_PASSWORD,
    },
  });

  transporter.verify(function (error, success) {
    if (error) {
      console.error(colors.red('Error: '), error);
    } else {
      console.log('Server is ready to take our messages');
    }
  });

  return transporter;
}
