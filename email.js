// emailService.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendAlertEmail = (subject, message) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.TO_EMAIL,
    subject,
    text: message
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) return console.error('Email failed:', err);
    console.log('Alert email sent:', info.response);
  });
};

module.exports = sendAlertEmail;
