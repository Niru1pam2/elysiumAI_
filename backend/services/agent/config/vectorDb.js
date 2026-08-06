import { QdrantVectorStore } from "@langchain/qdrant";
import { QdrantClient } from "@qdrant/js-client-rest";
import { embeddings } from "./embedding.js";
import dotenv from "dotenv";

dotenv.config();

// 1. Create explicit Qdrant client instance
const client = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY, // Optional if using Qdrant Cloud
});

export const vectorStore = async (docs, collectionName) => {
  // 2. Use fromDocuments to embed and upload 'docs' to Qdrant
  return await QdrantVectorStore.fromDocuments(docs, embeddings, {
    client,
    collectionName,
  });
};
