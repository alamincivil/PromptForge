
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { Tone, Complexity, FocusPreset, Scene } from "../types";

export async function generateCartoonPrompts(
  title: string,
  tone: Tone,
  complexity: Complexity,
  focus: FocusPreset,
  sceneCount: number
): Promise<Scene[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Generate ${sceneCount} Masterprompt scenes for a Bangladeshi 2D cartoon.
      Project Title: "${title}"
      Tone: ${tone}
      Complexity Level: ${complexity}
      Focus Theme: ${focus}
      
      Ensure each scene is culturally immersive and adheres to 2D animation rules.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 4000 },
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              number: { type: Type.INTEGER },
              styleLock: { type: Type.STRING },
              characters: { type: Type.STRING },
              setup: { type: Type.STRING },
              movement: { type: Type.STRING },
              background: { type: Type.STRING },
              lighting: { type: Type.STRING },
              mood: { type: Type.STRING },
              finalCheck: { type: Type.STRING },
            },
            required: ["number", "styleLock", "characters", "setup", "movement", "background", "lighting", "mood", "finalCheck"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Masterprompt generation failed:", error);
    throw error;
  }
}
