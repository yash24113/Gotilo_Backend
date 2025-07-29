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

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    await dbConnect();

    const { email } = req.body;

    if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing email address.' });
    }

    const otp = generateOtp(); // Should return a string like "123456"
    const otpExpires = new Date(Date.now() + 5 * 60000); // 5 minutes from now

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ email });
    }

    user.otp = otp;
    user.otpExpires = otpExpires;

    await user.save();

    // Send OTP (email or SMS based on your sendOtp function)
    await sendOtp(email, otp);

    return res.status(200).json({ success: true, message: 'OTP sent successfully.' });

  } catch (err) {
    console.error('Send OTP Error:', err);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
  }
};
