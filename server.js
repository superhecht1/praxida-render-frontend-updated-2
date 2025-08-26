// Laden Sie dotenv ganz am Anfang
require('dotenv').config();

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
    // Überprüfen ob API-Key vorhanden ist
    if (!process.env.OPENAI_API_KEY) {
      console.error("FEHLER: OPENAI_API_KEY nicht gefunden in Umgebungsvariablen");
      return res.status(500).json({ error: "OpenAI API-Key nicht konfiguriert" });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const userMessage = req.body.question || "Sag hallo!";
    
    console.log("Sende Anfrage an OpenAI:", userMessage);
    
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: userMessage }],
    });

    const answer = completion.choices[0].message.content;
    console.log("OpenAI Antwort erhalten:", answer.substring(0, 100) + "...");
    
    res.json({ answer: answer });
  } catch (err) {
    console.error("OpenAI Fehler Details:", err);
    
    // Spezifische Fehlermeldungen
    if (err.status === 401) {
      res.status(500).json({ error: "OpenAI API-Key ungültig" });
    } else if (err.status === 429) {
      res.status(500).json({ error: "OpenAI Rate-Limit erreicht" });
    } else {
      res.status(500).json({ error: `OpenAI Fehler: ${err.message}` });
    }
  }
});

// Fallback zu index.html (für SPA-Routing)
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
  console.log(`OpenAI API-Key gesetzt: ${process.env.OPENAI_API_KEY ? 'JA' : 'NEIN'}`);
});

