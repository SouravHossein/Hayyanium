import { GoogleGenAI } from '@google/genai';

const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim() ?? '';

export const hasGeminiApiKey = geminiApiKey.length > 0;

export const createGeminiClient = () => {
  if (!hasGeminiApiKey) {
    return null;
  }

  return new GoogleGenAI({ apiKey: geminiApiKey });
};
