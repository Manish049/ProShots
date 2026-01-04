
// Fix AuthError definition and implement anatomical analysis with Gemini 3 Pro
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { UserAnalysis, PhotoStyle, GeneratedImage, ToolType } from "../types";

const getActiveApiKey = () => {
  // Guidelines state: API key must be obtained exclusively from process.env.API_KEY
  const key = process.env.API_KEY;
  if (!key || key === 'undefined' || key === 'null' || key === '') {
    return null;
  }
  return key;
};

export class QuotaExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuotaExceededError";
  }
}

export class SafetyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SafetyError";
  }
}

export class AuthError extends Error {
  // Property to track model availability/auth issues specifically for "Requested entity was not found"
  public isEntityNotFound: boolean = false;
  
  constructor(message: string, isEntityNotFound: boolean = false) {
    super(message);
    this.name = "AuthError";
    this.isEntityNotFound = isEntityNotFound;
  }
}

async function callGemini<T>(fn: (ai: GoogleGenAI) => Promise<T>): Promise<T> {
  const apiKey = getActiveApiKey();
  if (!apiKey) {
    throw new AuthError("API_KEY_MISSING");
  }
  
  // Create a new instance right before making an API call to ensure it uses the most up-to-date API key
  const ai = new GoogleGenAI({ apiKey: apiKey });
  try {
    return await fn(ai);
  } catch (error: any) {
    const msg = error?.message || String(error);
    // Special handling for "Requested entity was not found" to trigger re-selection of key in UI
    if (msg.includes('Requested entity was not found')) {
      throw new AuthError("Requested entity was not found.", true);
    }
    if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) throw new QuotaExceededError("Quota exceeded.");
    if (msg.includes('SAFETY')) throw new SafetyError("Safety block.");
    if (msg.includes('401') || msg.includes('403') || msg.includes('API key not valid')) throw new AuthError("Invalid API key.");
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

    // Upgraded to gemini-3-pro-preview for advanced reasoning on anatomical features as per complex task requirements
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', 
      contents: {
        parts: [
          ...parts,
          { text: "Analyze these photos for professional headshot suitability. Perform deep anatomical analysis of facial bone structure and skin tone. Output JSON of characteristics." }
        ]
      },
      config: {
        // High thinking budget for precision mapping of facial features
        thinkingConfig: { thinkingBudget: 32768 },
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
    // Directly access text property from response
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
    const prompt = `A professional ${style} portrait of the person in the image. High fidelity. Identity lock and anatomical accuracy is critical.`;

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
    if (!imgPart?.inlineData) throw new Error("Generation failed.");

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
      case ToolType.WATERMARK_REMOVER: prompt = "Remove watermark/text. Restore background."; break;
      case ToolType.UPSCALER: prompt = "Upscale and sharpen."; break;
      case ToolType.BG_REMOVER: prompt = "Remove background. Subject only."; break;
      case ToolType.RESIZER: prompt = `Resize to ${customParams.width}x${customParams.height}${customParams.unit}.`; break;
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
    if (!part?.inlineData) throw new Error("Processing failed.");
    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
  });
};
