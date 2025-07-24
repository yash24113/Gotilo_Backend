const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'yashkharva506@gmail.com',
    pass: process.env.FROM_EMAIL_PASSWORD || 'your-app-password-here',
  },
});

async function sendOtpEmail(email, otp) {
  const mailOptions = {
    from: 'yashkharva506@gmail.com',
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is: ${otp}`,
    html: `<p>Your OTP code is: <b>${otp}</b></p>`
  };
  return transporter.sendMail(mailOptions);
}

module.exports = { sendOtpEmail };
