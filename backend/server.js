import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, "../frontend")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// API
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL_ID = "gemini-2.5-flash-lite";

async function chamarGemini(prompt, tentativas = 2) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL_ID}:generateContent?key=${GEMINI_API_KEY}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.candidates[0].content.parts[0].text;
}

app.post("/gerar-receita", async (req, res) => {
  try {
    const { ingredientes } = req.body;
    if (!ingredientes || !ingredientes.length)
      return res.status(400).json({ error: "Nenhum ingrediente fornecido." });

    const receita = await chamarGemini(
      `Crie uma receita simples usando: ${ingredientes.join(", ")}.`
    );

    const receitaLimpa = receita.replace(/#/g, "").replace(/\*\*/g, "").replace(/\*/g, "•").replace(/\n/g, "<br>");
    res.json({ receita: receitaLimpa });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
