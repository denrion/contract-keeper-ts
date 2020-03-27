import { getTestMessageUrl } from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/json-transport';
import { createProdTransporter } from './ProductionTransporter';
import { createDevTransporter } from './TestTransporter';

export const sendEmail = async (mailOptions: MailOptions) => {
  let transporter;

  if (process.env.NODE_ENV === 'production') {
    transporter = await createProdTransporter();
  } else {
    transporter = await createDevTransporter();
    mailOptions = {
      ...mailOptions,
      from: 'Test <hello@test.io>'
    };
  }

  const info = await transporter.sendMail(mailOptions);

  console.log('Message sent: %s', info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // // Preview only available when sending through an Ethereal account
  console.log('Preview URL: %s', getTestMessageUrl(info));
};
