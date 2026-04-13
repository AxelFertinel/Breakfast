import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/lib/env";

const genAI = new GoogleGenerativeAI(env.GOOGLE_API_KEY);

export const geminiFlash = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.8,
  },
});
