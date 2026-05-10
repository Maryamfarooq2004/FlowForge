import sgMail from '@sendgrid/mail';
import { logger } from '../utils/logger.utils';

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
    if (process.env.SENDGRID_API_KEY && process.env.NODE_ENV === 'production') {
      await sgMail.send(msg);
      logger.info(`Email sent to ${to}`);
    } else {
      // Mock for development or missing API key
      logger.info('--- EMAIL MOCK ---');
      logger.info(`To: ${to}`);
      logger.info(`Subject: ${subject}`);
      logger.info(`Content: ${text}`);
      logger.info('------------------');
    }
  } catch (error) {
    logger.error('Error sending email:', error);
    // Don't throw — we don't want to crash the request if email fails in dev
  }
};
