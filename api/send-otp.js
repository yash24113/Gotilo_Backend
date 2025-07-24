const mongoose = require('mongoose');
const User = require('./User');
const { generateOtp, sendOtp } = require('./otpUtils');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://yashkharva506:Sufalam%402233@cluster0.j6nogwi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

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
  const { email } = req.body;
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email address' });
  }
  const otp = generateOtp();
  const otpExpires = new Date(Date.now() + 5 * 60000);
  let user = await User.findOne({ email });
  if (!user) {
    user = new User({ email });
  }
  user.otp = otp;
  user.otpExpires = otpExpires;
  await user.save();
  await sendOtp(email, otp);
  res.json({ success: true, message: 'OTP sent' });
};
