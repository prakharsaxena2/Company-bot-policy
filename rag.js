/**
 * Implementation plan
 * Stage 1 : Indexting
 * 1. Load the document -pdf , text
 * 2.Chunk the document
 * 3. Generate embeddings 
 * 4. Store the embeddings in a vector database
 * 
 * Stage 2 : Useing the Chatbot
 * 1. Setup. LLM
 * 2. Add retrieval step
 * 3. Pass input + relevant information to LLM 
 * 4. Congratulate
 * 
 */

import { indexTheDocument } from "./prepare.js";
const filePath = "./cg-internal-docs.pdf";
indexTheDocument(filePath); 
console.log();

console.log("Hello world") 