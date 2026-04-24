import readline from "node:readline/promises";
import { Groq } from "groq-sdk";
import 'dotenv/config';
import { vectorStore } from "./prepare.js";
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});
export async function chat(input) {

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    while (true) {
        const question = await rl.question("You: ");
        if (question === '/bye') {
            break;
        }
        // retrieval
        const relevantChunks = await vectorStore.similaritySearch(question, 3);
        const context = relevantChunks.map((chunk) => chunk.pageContent).join("\n");
        const SYSTEM_PROMPT = `You are an assistance  for question-answer task. Use the following 
                relevant pieces of retrieved context to answer the question. If you don't know the answer, just say "I don't know".`;

                const userQuery = `
                Question: ${question}
                Relevant Context: ${context}
                Answer: `;
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", 
                content: SYSTEM_PROMPT 
                },
                { 
                role: "user", 
                content: userQuery,
                }
            ],
            model: "llama-3.3-70b-versatile"
        });

        console.log(`Assistant: ${completion.choices[0].message.content}`);
    }
    rl.close();

}

chat();