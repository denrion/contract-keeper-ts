import colors from 'colors';
import { createTestAccount, createTransport } from 'nodemailer';

export async function createDevTransporter() {
  const testAccount = await createTestAccount();

  const transporter = createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  transporter.verify(function(error, success) {
    if (error) {
      console.error(colors.red('Error: '), error);
    } else {
      console.log('Server is ready to take our messages');
    }
  });

  return transporter;
}
