import { vectorStore } from "../prepare.js";
import { Groq } from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
    res.status(200).json({ answer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Server error" });
  }
}