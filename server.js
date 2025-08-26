import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config(); // lädt .env

const app = express();
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Key aus .env
});

app.post("/api/therapie-assistenz", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Du bist eine professionelle, hilfreiche KI-Assistenz für Therapeuten. Antworte auf Deutsch." },
        { role: "user", content: message },
      ],
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error("OpenAI Fehler:", error);
    res.status(500).json({ error: "Fehler bei der OpenAI-Anfrage" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
