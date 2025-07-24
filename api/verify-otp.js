const mongoose = require('mongoose');
const User = require('./User');
const jwt = require('jsonwebtoken');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://yashkharva506:Sufalam%402233@cluster0.j6nogwi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

let cached = global.mongoose;

async function dbConnect() {
  if (!cached) {
    cached = global.mongoose = mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
  await cached;
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  await dbConnect();
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and OTP required' });
  }
  const user = await User.findOne({ email });
  if (!user || user.otp !== otp || !user.otpExpires || user.otpExpires < new Date()) {
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
  }
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, token });
};
