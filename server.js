import express from "express";
import path from "node:path";
import { Groq } from "groq-sdk";
import "dotenv/config";
import { vectorStore, indexTheDocument } from "./prepare.js";
import multer from "multer";
import { unlink } from "node:fs/promises";

const app = express();
const port = process.env.PORT ?? 3000;
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const upload = multer({ dest: "uploads/", limits: { fileSize: 100 * 1024 * 1024 } }); // 100MB limit

app.post("/api/upload", upload.single("document"), async (req, res) => {
  console.log('Upload request received');
  try {
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ error: "No file uploaded" });
    }
    console.log('File uploaded:', req.file.originalname);
    const filePath = req.file.path;
    await indexTheDocument(filePath);
    console.log('Document indexed');

    // Clean up the uploaded file
    await unlink(filePath);
    console.log('File cleaned up');

    res.json({ message: "Document indexed successfully" });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || "Upload error" });
  }
});

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
