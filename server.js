// Laden Sie dotenv ganz am Anfang
require('dotenv').config();

const express = require('express');
const path = require('path');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

// Sicherheits-Check für API-Key beim Start
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ FEHLER: OPENAI_API_KEY nicht gefunden!');
  console.error('📋 Bitte folgende Schritte ausführen:');
  console.error('   1. Überprüfen Sie Ihre .env Datei');
  console.error('   2. Fügen Sie Ihren OpenAI API-Key in .env ein');
  console.error('   3. Starten Sie den Server neu');
  process.exit(1);
}

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

// API-Route für OpenAI (die korrekte Route die Ihr Frontend verwendet)
app.post('/api/ask', async (req, res) => {
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const userMessage = req.body.question || "Sag hallo!";
    
    console.log(`🤖 OpenAI Anfrage: "${userMessage.substring(0, 50)}..."`);
    
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system", 
          content: "Du bist eine professionelle KI-Assistenz für Therapeuten. Antworte immer auf Deutsch, hilfsreich und fachlich fundiert."
        },
        {
          role: "user", 
          content: userMessage
        }
      ],
    });

    const answer = completion.choices[0].message.content;
    console.log(`✅ OpenAI Antwort: "${answer.substring(0, 50)}..."`);
    
    res.json({ answer: answer });
  } catch (err) {
    console.error("❌ OpenAI Fehler:", err.message);
    
    // Spezifische Fehlermeldungen für besseres Debugging
    if (err.status === 401) {
      console.error("💡 Lösung: Überprüfen Sie Ihren OpenAI API-Key in der .env Datei");
      res.status(500).json({ error: "OpenAI API-Key ungültig. Bitte überprüfen Sie Ihre Konfiguration." });
    } else if (err.status === 429) {
      res.status(500).json({ error: "OpenAI Rate-Limit erreicht. Bitte versuchen Sie es später erneut." });
    } else if (err.code === 'ENOTFOUND') {
      res.status(500).json({ error: "Keine Internetverbindung zu OpenAI." });
    } else {
      res.status(500).json({ error: `OpenAI Fehler: ${err.message}` });
    }
  }
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    openai: !!process.env.OPENAI_API_KEY ? 'configured' : 'missing',
    timestamp: new Date().toISOString()
  });
});

// Fallback zu index.html (für SPA-Routing)
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server läuft auf Port ${PORT}`);
  console.log(`🔑 OpenAI API-Key: ${process.env.OPENAI_API_KEY ? '✅ konfiguriert' : '❌ fehlt'}`);
  console.log(`🌐 Öffnen Sie: http://localhost:${PORT}`);
});
