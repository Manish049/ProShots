
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { UserAnalysis, PhotoStyle, GeneratedImage, ToolType } from "../types";

// Standardized Error Classes for the UI
export class AuthError extends Error {
  isEntityNotFound: boolean = false;
  constructor(message: string, isEntityNotFound: boolean = false) {
    super(message);
    this.name = 'AuthError';
    this.isEntityNotFound = isEntityNotFound;
  }
}

export class SafetyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SafetyError';
  }
}

export class QuotaExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuotaExceededError';
  }
}

async function callGemini<T>(fn: (ai: GoogleGenAI) => Promise<T>): Promise<T> {
  // Use the pre-configured environment variable exclusively
  const apiKey = process.env.API_KEY;
  const ai = new GoogleGenAI({ apiKey: apiKey || '' });
  
  try {
    return await fn(ai);
  } catch (error: any) {
    const msg = error?.message || String(error);
    console.error("Neural Engine Error:", msg);
    
    if (msg.includes("429") || msg.toLowerCase().includes("quota")) throw new QuotaExceededError(msg);
    if (msg.includes("Requested entity was not found")) throw new AuthError(msg, true);
    if (msg.includes("401") || msg.includes("403")) throw new AuthError(msg);
    if (msg.toLowerCase().includes("safety")) throw new SafetyError(msg);
    
    throw error;
  }
}

const parseDataUrl = (dataUrl: string) => {
  const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) throw new Error("Invalid image format");
  return { mimeType: matches[1], data: matches[2] };
};

export const analyzePhotos = async (images: string[]): Promise<UserAnalysis> => {
  return callGemini(async (ai) => {
    const parts = images.map(img => {
      const { mimeType, data } = parseDataUrl(img);
      return { inlineData: { data, mimeType } };
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', 
      contents: {
        parts: [
          ...parts,
          { text: "Analyze these photos for professional suitability. Output JSON." }
        ]
      },
      config: {
        thinkingConfig: { thinkingBudget: 16000 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            facialStructure: { type: Type.STRING },
            bodyShape: { type: Type.STRING },
            hairstyle: { type: Type.STRING },
            eyeShapeAndColor: { type: Type.STRING },
            noseShape: { type: Type.STRING },
            lipShapeAndColor: { type: Type.STRING },
            eyebrowShape: { type: Type.STRING },
            skinTone: { type: Type.STRING },
            facialFeatures: { type: Type.STRING },
            eyeDetails: { type: Type.STRING },
            skinTexture: { type: Type.STRING },
            bodyProportions: { type: Type.STRING },
            hairCharacteristics: { type: Type.STRING },
            lightingEnvironment: { type: Type.STRING },
            poseSuggestions: { type: Type.STRING }
          },
          required: [
            "facialStructure", "bodyShape", "hairstyle", "eyeShapeAndColor", 
            "noseShape", "lipShapeAndColor", "eyebrowShape", "skinTone",
            "facialFeatures", "eyeDetails", "skinTexture", "bodyProportions",
            "hairCharacteristics", "lightingEnvironment", "poseSuggestions"
          ]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  });
};

export const generateEnhancedPhoto = async (
  analysis: UserAnalysis, 
  style: PhotoStyle,
  referenceImage: string
): Promise<GeneratedImage> => {
  return callGemini(async (ai) => {
    const { mimeType, data } = parseDataUrl(referenceImage);
    const prompt = `Professional ${style} portrait of the person. High fidelity. Maintain facial structure: ${analysis.facialStructure}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data, mimeType } },
          { text: prompt }
        ]
      }
    });

    const imgPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (!imgPart?.inlineData) throw new Error("Synthesis failed.");

    return { 
      id: Math.random().toString(36).substr(2, 9), 
      url: `data:${imgPart.inlineData.mimeType};base64,${imgPart.inlineData.data}`, 
      category: style, 
      description: `Studio-quality ${style} result.` 
    };
  });
};

export const editPhotoWithText = async (baseImageUrl: string, instruction: string): Promise<string> => {
  return callGemini(async (ai) => {
    const { mimeType, data } = parseDataUrl(baseImageUrl);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data, mimeType } },
          { text: instruction }
        ]
      }
    });
    const b64 = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (!b64?.inlineData) throw new Error("Edit failed.");
    return `data:${b64.inlineData.mimeType};base64,${b64.inlineData.data}`;
  });
};

export const processToolAction = async (imageUrl: string, tool: ToolType, customParams?: any): Promise<string> => {
  return callGemini(async (ai) => {
    const { mimeType, data } = parseDataUrl(imageUrl);
    let prompt = "";
    switch (tool) {
      case ToolType.WATERMARK_REMOVER: prompt = "Remove watermark."; break;
      case ToolType.UPSCALER: prompt = "Upscale 4x."; break;
      case ToolType.BG_REMOVER: prompt = "Remove background."; break;
      case ToolType.RESIZER: prompt = `Resize to ${customParams.width}x${customParams.height}.`; break;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data, mimeType } },
          { text: prompt }
        ]
      }
    });

    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (!part?.inlineData) throw new Error("Neural action failed.");
    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
  });
};
