const { sendOtpEmail } = require('./emailUtils');

const generateOtp = () => {
  return (Math.floor(100000 + Math.random() * 900000)).toString();
};

const sendOtp = async (email, otp) => {
  // Send OTP to email
  await sendOtpEmail(email, otp);
  return true;
};

module.exports = { generateOtp, sendOtp };
