const nodemailer = require('nodemailer');

const createTransporter = () => {
  const smtpConfig = process.env.SMTP_HOST
    ? {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
      }
    : {
        service: process.env.SMTP_SERVICE || 'gmail',
      };

  return nodemailer.createTransport({
    ...smtpConfig,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('Email skipped: SMTP_USER and SMTP_PASS are not configured');
    return null;
  }

  const transporter = createTransporter();

  return transporter.sendMail({
    from: process.env.SMTP_FROM || `SyncVault <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
