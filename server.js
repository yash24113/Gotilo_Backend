require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb+srv://yashkharva506:Sufalam%402233@cluster0.j6nogwi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Auth & OTP routes
app.use('/api', require('./api/auth'));

// Existing Gemini and other routes
// app.use('/api/gemini', require('./api/gemini'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
