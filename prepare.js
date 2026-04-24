import 'dotenv/config';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';
import { Pinecone as PineconeClient } from '@pinecone-database/pinecone';
import { PDFParse } from 'pdf-parse';
import { readFile } from 'node:fs/promises';

const embeddings = new OpenAIEmbeddings({
    model: 'text-embedding-3-small',
});

const pinecone = new PineconeClient();

const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

export const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    maxConcurrency: 5,
});

export async function indexTheDocument(filePath) {
    const buffer = await readFile(filePath);
    const parser = new PDFParse({ data: buffer });

    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 100,
    });

    try {
        const result = await parser.getText();
        const texts = await textSplitter.splitText(result.text);
        const metadata = { source: filePath };

        const documents = texts.map((chunk) => ({
            pageContent: chunk,
            metadata,
        }));

        await vectorStore.addDocuments(documents);
    } finally {
        await parser.destroy();
    }
}
