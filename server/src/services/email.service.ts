import sgMail from '@sendgrid/mail';
import { logger } from '../utils/logger.utils';

console.log('--- EMAIL SERVICE INIT ---');
console.log('SENDGRID_API_KEY status:', process.env.SENDGRID_API_KEY ? 'FOUND' : 'MISSING');
console.log('SENDGRID_FROM_EMAIL:', process.env.SENDGRID_FROM_EMAIL || 'NOT SET');

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export const sendEmail = async (to: string, subject: string, text: string, html: string) => {
  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL || 'verify@flowforge.app',
    subject,
    text,
    html,
  };

  try {
    if (process.env.SENDGRID_API_KEY) {
      await sgMail.send(msg);
      logger.info(`Email sent successfully to ${to}`);
    } else {
      // Mock mode
      logger.warn('--- EMAIL MOCK (No API Key) ---');
      logger.info(`To: ${to}`);
      logger.info(`Verify Link: ${text}`);
      logger.warn('-------------------------------');
    }
  } catch (error: any) {
    logger.error('SendGrid Error details:', JSON.stringify(error.response?.body || error, null, 2));
  }
};
