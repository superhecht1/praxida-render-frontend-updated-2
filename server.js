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
const fs = require('fs');
const clientsFile = path.join(__dirname, 'clients.json');

// Alle Klienten abrufen
app.get('/api/clients', (req, res) => {
  fs.readFile(clientsFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Lesefehler' });
    res.json(JSON.parse(data));
  });
});

// Neuen Klienten speichern
app.post('/api/clients', (req, res) => {
  const newClient = req.body;

  fs.readFile(clientsFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Lesefehler' });

    let clients = JSON.parse(data);
    clients.push(newClient);

    fs.writeFile(clientsFile, JSON.stringify(clients, null, 2), (err) => {
      if (err) return res.status(500).json({ error: 'Schreibfehler' });
      res.json({ success: true, client: newClient });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
