const fetch = require('node-fetch');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const corsHeaders = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*', // Replace with specific domain in production
  'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
  'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
};

module.exports = async (req, res) => {
  // Handle preflight (OPTIONS) requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200, corsHeaders);
    return res.end();
  }

  // Apply CORS headers to all other requests
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Handle GET requests (for API test)
  if (req.method === 'GET') {
    return res.status(200).json({
      message: 'Gemini Chat API is running ✅',
      status: 'OK',
      timestamp: new Date().toISOString(),
    });
  }

  // Only allow POST for Gemini chat interaction
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { messages } = req.body;

  if (!GEMINI_API_KEY) {
    return res.status(500).json({
      reply: 'Error: Gemini API key is missing on the server. Please set GEMINI_API_KEY in your environment.',
    });
  }

  const modelEndpoint = 'gemini-1.5-flash';

  const contents = messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelEndpoint}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        reply: `Error: Gemini API error (${response.status}): ${errorText}`,
      });
    }

    const data = await response.json();
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Error: No valid response from Gemini API.';
    return res.status(200).json({ reply });

  } catch (err) {
    console.error('Server Error:', err);
    return res.status(500).json({
      reply: `Error: Network or server error: ${err.message}`,
    });
  }
};
