
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { Tone, Complexity, FocusPreset, Scene, Provider } from "../types";

export async function generateCartoonPrompts(
  provider: Provider,
  apiKey: string,
  modelName: string,
  title: string,
  tone: Tone,
  complexity: Complexity,
  focus: FocusPreset,
  sceneCount: number
): Promise<Scene[]> {
  const prompt = `Generate ${sceneCount} Masterprompt scenes for a Bangladeshi 2D cartoon.
      Project Title: "${title}"
      Tone: ${tone}
      Complexity Level: ${complexity}
      Focus Theme: ${focus}
      
      Ensure each scene is culturally immersive and adheres to 2D animation rules.`;

  if (provider === Provider.Gemini) {
    const ai = new GoogleGenAI({ apiKey: apiKey || process.env.API_KEY || '' });
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
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
      return JSON.parse(response.text || '[]');
    } catch (e) {
      throw e;
    }
  } else {
    // OpenAI or DeepSeek fallback using standard REST API
    const baseUrl = provider === Provider.OpenAI 
      ? 'https://api.openai.com/v1/chat/completions'
      : 'https://api.deepseek.com/v1/chat/completions';

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: SYSTEM_INSTRUCTION },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' }
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    
    // Most AI APIs return JSON in a specific structure
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content);
    // Usually people return an object with a scenes key if they follow instructions
    return parsed.scenes || parsed;
  }
}

export async function validateApiKey(provider: Provider, key: string): Promise<boolean> {
  if (!key) return false;
  try {
    if (provider === Provider.Gemini) {
      const ai = new GoogleGenAI({ apiKey: key });
      await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: 'test',
        config: { maxOutputTokens: 1 }
      });
      return true;
    } else if (provider === Provider.OpenAI) {
      const resp = await fetch('https://api.openai.com/v1/models', {
        headers: { 'Authorization': `Bearer ${key}` }
      });
      return resp.ok;
    } else {
      // DeepSeek validation
      const resp = await fetch('https://api.deepseek.com/v1/models', {
        headers: { 'Authorization': `Bearer ${key}` }
      });
      return resp.ok;
    }
  } catch {
    return false;
  }
}
