const nodemailer = require('nodemailer');

function createTransport() {
  const host = process.env.EMAIL_HOST;
  const port = parseInt(process.env.EMAIL_PORT || '587', 10);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!host || !user || !pass) {
    console.warn('Email not configured (EMAIL_HOST/EMAIL_USER/EMAIL_PASS). Skipping send.');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
}

async function sendMail({ to, subject, text, html, from }) {
  const transporter = createTransport();
  const fromAddr = from || process.env.EMAIL_FROM || process.env.EMAIL_USER;
  if (!transporter) {
    console.log('[Email not configured] Pretend send to:', to, '| Subject:', subject);
    if (text) console.log('[Verification code / content]:', text.replace(/[\s\S]/g, (c) => c === '\n' ? ' ' : c).trim());
    return;
  }

  await transporter.sendMail({ from: fromAddr, to, subject, text, html });
}

module.exports = { sendMail };