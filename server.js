// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// OpenAI-Client initialisieren
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Test-Endpoint
app.get("/", (req, res) => {
  res.send("Server läuft ✅");
});

// OpenAI Chat-Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt fehlt" });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const text = response.choices[0].message.content;
    res.json({ text });
  } catch (error) {
    console.error("OpenAI Fehler:", error);
    res.status(500).json({ error: "Fehler beim Abrufen der OpenAI-Antwort" });
  }
});

// Server starten
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
