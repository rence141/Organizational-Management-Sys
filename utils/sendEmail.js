// utils/sendEmail.js
// Simple email helper using Nodemailer. Make sure EMAIL_* vars are set in .env.

const nodemailer = require("nodemailer");
const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = require("../config");

let transporter;

if (EMAIL_HOST && EMAIL_USER && EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: false,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
} else {
  console.warn("Email config missing; verification emails will not be sent.");
}

async function sendEmail({ to, subject, html }) {
  if (!transporter) {
    console.warn("sendEmail called but transporter not configured");
    return;
  }

  await transporter.sendMail({
    from: `Org Management <${EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

module.exports = sendEmail;
