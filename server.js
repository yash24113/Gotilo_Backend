require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();

// Use the Gemini API key from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not set in environment variables.');
}

app.use(cors());
app.use(express.json());

app.post('/api/gemini', async (req, res) => {
  const { messages, model } = req.body;

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ reply: "Error: Gemini API key is missing on the server. Please set GEMINI_API_KEY in your environment." });
  }

  // Always use 'gemini-1.5-flash' as the model endpoint
  const modelEndpoint = 'gemini-1.5-flash';

  const contents = messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelEndpoint}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }),
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({ reply: `Error: Gemini API error (${response.status}): ${errorText}` });
    }
    const data = await response.json();
    const reply = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0].text
      ? data.candidates[0].content.parts[0].text
      : "Error: No valid response from Gemini API.";
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ reply: `Error: Network or server error: ${err.message}` });
  }
});

// Export the Express app as the serverless function handler
module.exports = app;