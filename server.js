import express from "express";
import path from "node:path";
import { Groq } from "groq-sdk";
import "dotenv/config";
import { vectorStore } from "./prepare.js";

const app = express();
const port = process.env.PORT ?? 3000;
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(express.json());
app.use(express.static(path.join(path.resolve(), "Frontend")));

app.post("/api/chat", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "Missing question text" });
    }

    const relevantChunks = await vectorStore.similaritySearch(question, 3);
    const context = relevantChunks.map((chunk) => chunk.pageContent).join("\n");
    const SYSTEM_PROMPT = `You are an assistant for company question-answer tasks. Use the relevant retrieved context to answer the question. If you don't know the answer, just say \"I don't know\".`;
    const userQuery = `Question: ${question}\nRelevant Context: ${context}\nAnswer:`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userQuery },
      ],
      model: "llama-3.3-70b-versatile",
    });

    const answer = completion.choices?.[0]?.message?.content?.trim() ?? "Sorry, I couldn't generate a response.";
    res.json({ answer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Server error" });
  }
});

app.use((req, res) => {
  res.sendFile(path.join(path.resolve(), "Frontend", "index.html"));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
