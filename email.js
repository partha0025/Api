const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

function sendAlert(batteryVoltage) {
  const mailOptions = {
    from: `"Voltage Monitor" <${process.env.ALERT_EMAIL_USER}>`,
    to: process.env.EMAIL_RECEIVER,
    subject: '⚠️ Low Battery Voltage Alert',
    text: `Battery voltage is too low: ${batteryVoltage}V.\nPlease take necessary action.`,
    html: `<h3>⚠️ Low Battery Voltage Alert</h3><p>Battery voltage is too low: <b>${batteryVoltage}V</b>.</p><p>Please check your system.</p>`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.error('❌ Email not sent:', error);
    }
    console.log('✅ Alert email sent:', info.response);
  });
}

module.exports = sendAlert;
