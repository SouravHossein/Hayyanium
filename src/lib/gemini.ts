import { GoogleGenAI } from '@google/genai';

const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY?.trim() ?? '';

export const hasGeminiApiKey = geminiApiKey.length > 0;

export const createGeminiClient = () => {
  if (!hasGeminiApiKey) {
    return null;
  }

  return new GoogleGenAI({ apiKey: geminiApiKey });
};
