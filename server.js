const express = require('express');
const path = require('path');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

// JSON Body Parser für API Requests
app.use(express.json());

// Static Assets aus /public
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-store');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

// API-Route für OpenAI
app.post('/api/ask', async (req, res) => {
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const userMessage = req.body.question || "Sag hallo!";
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: userMessage }],
    });

    res.json({ answer: completion.choices[0].message.content });
  } catch (err) {
    console.error("OpenAI error:", err.message);
    res.status(500).json({ error: "OpenAI request failed" });
  }
});

// Fallback zu index.html (für SPA-Routing)
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

