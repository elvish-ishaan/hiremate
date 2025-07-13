import { GoogleGenAI } from "@google/genai";

export const agent = new GoogleGenAI({ apiKey: process.env.LLM_API_KEY });
