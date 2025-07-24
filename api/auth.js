const express = require('express');
const router = express.Router();
const User = require('./User');
const { generateOtp, sendOtp } = require('./otpUtils');
const jwt = require('jsonwebtoken');

const OTP_EXPIRY_MINUTES = 5;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// Send OTP endpoint
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email address' });
  }
  const otp = generateOtp();
  const otpExpires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60000);
  let user = await User.findOne({ email });
  if (!user) {
    user = new User({ email });
  }
  user.otp = otp;
  user.otpExpires = otpExpires;
  await user.save();
  await sendOtp(email, otp);
  res.json({ success: true, message: 'OTP sent' });
});

// Verify OTP endpoint
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and OTP required' });
  }
  const user = await User.findOne({ email });
  if (!user || user.otp !== otp || !user.otpExpires || user.otpExpires < new Date()) {
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
  }
  // OTP valid, clear it and issue JWT
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, token });
});

module.exports = router;
