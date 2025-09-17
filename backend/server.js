import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch"
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL_ID = "gemini-2.5-flash-lite"; // modelo mais leve

// Função que chama a Gemini com retry
async function chamarGemini(prompt, tentativas = 2) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL_ID}:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    console.log("Resposta da Gemini:", JSON.stringify(data, null, 2));

    if (data.error) {
      if (data.error.code === 503 && tentativas > 0) {
        console.log("Modelo sobrecarregado, tentando novamente em 2s...");
        await new Promise(r => setTimeout(r, 2000)); // espera 2 segundos
        return chamarGemini(prompt, tentativas - 1);
      }
      throw new Error(data.error.message);
    }

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("Modelo não retornou nenhuma resposta.");
    }

    return data.candidates[0].content.parts[0].text;
  } catch (err) {
    console.error("Erro ao chamar Gemini:", err.message);
    throw err;
  }
}

// Rota para gerar receita
app.post("/gerar-receita", async (req, res) => {
  try {
    const { ingredientes } = req.body;

    if (!ingredientes || ingredientes.length === 0) {
      return res.status(400).json({ error: "Nenhum ingrediente fornecido." });
    }

    const prompt = `Crie uma receita simples e curta até 200 palavras, prática e saborosa usando os ingredientes: ${ingredientes.join(", ")}.`;

    const receita = await chamarGemini(prompt);

    let receitaLimpa = receita
      .replace(/#/g, "")       // remove # e ##
      .replace(/\*\*/g, "")    // remove **bold**
      .replace(/\*/g, "•")     // opcional: trocar * de lista por •
      .replace(/\n/g, "<br>"); // mantém quebras de linha para HTML

    res.json({ receita: receitaLimpa });

  } catch (err) {
    res.status(500).json({ error: err.message || "Erro ao gerar receita." });
  }
});

app.listen(PORT, () =>
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`)
);
