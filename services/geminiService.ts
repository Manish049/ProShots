
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { UserAnalysis, PhotoStyle, GeneratedImage, ToolType } from "../types";

const STORAGE_KEY = 'proshots_neural_key';

export const setSessionKey = (key: string) => {
  localStorage.setItem(STORAGE_KEY, key);
};

export const getSessionKey = (): string | null => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && stored !== 'undefined' && stored !== 'null') return stored;
  
  const env = process.env.API_KEY;
  if (env && env !== 'undefined' && env !== 'null') return env;
  
  return null;
};

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
  const apiKey = getSessionKey();
  
  if (!apiKey) {
    throw new AuthError("Neural Engine not connected. Please click 'Sync Engine' to provide an API key.");
  }

  // Create instance right before use to ensure we have the latest key
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    return await fn(ai);
  } catch (error: any) {
    const msg = error?.message || JSON.stringify(error) || String(error);
    console.error("Neural Engine Connectivity Error:", msg);
    
    // Handle the specific 500 error reported by user
    if (msg.includes("500") || msg.includes("xhr error") || msg.includes("Rpc failed")) {
      throw new Error("Neural Engine internal fault (500). This usually indicates a temporary server issue or an incompatible API key. Please try again in a few moments.");
    }
    
    if (msg.includes("429") || msg.toLowerCase().includes("quota")) throw new QuotaExceededError("Daily neural quota reached.");
    if (msg.includes("Requested entity was not found")) {
      localStorage.removeItem(STORAGE_KEY); // Clear invalid key
      throw new AuthError("Requested model not found. Your API key might not have access to this engine.", true);
    }
    if (msg.includes("401") || msg.includes("403") || msg.toLowerCase().includes("invalid")) {
      localStorage.removeItem(STORAGE_KEY); // Clear invalid key
      throw new AuthError("Authentication failed. Please check your API key.");
    }
    if (msg.toLowerCase().includes("safety")) throw new SafetyError("Image content blocked by neural safety filters.");
    
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
    const parts = images.slice(0, 5).map(img => {
      const { mimeType, data } = parseDataUrl(img);
      return { inlineData: { data, mimeType } };
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Using flash for more stable analysis calls
      contents: {
        parts: [
          ...parts,
          { text: "Act as a professional portrait photographer. Analyze these 5 photos and output a JSON description of the person's physical characteristics for consistent AI generation. Focus on bone structure, skin tone, and hair." }
        ]
      },
      config: {
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
    const prompt = `A professional studio ${style} portrait. Maintain the person's identity and exact bone structure: ${analysis.facialStructure}. High-end lighting, 8k resolution, cinematic quality.`;

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
    if (!imgPart?.inlineData) throw new Error("Neural synthesis returned empty data.");

    return { 
      id: Math.random().toString(36).substr(2, 9), 
      url: `data:${imgPart.inlineData.mimeType};base64,${imgPart.inlineData.data}`, 
      category: style, 
      description: `Studio-quality ${style} generation complete.` 
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
    if (!b64?.inlineData) throw new Error("Image edit synthesis failed.");
    return `data:${b64.inlineData.mimeType};base64,${b64.inlineData.data}`;
  });
};

export const processToolAction = async (imageUrl: string, tool: ToolType, customParams?: any): Promise<string> => {
  return callGemini(async (ai) => {
    const { mimeType, data } = parseDataUrl(imageUrl);
    let prompt = "";
    switch (tool) {
      case ToolType.WATERMARK_REMOVER: prompt = "Precisely remove all watermarks and text overlays while reconstructing the underlying texture perfectly."; break;
      case ToolType.UPSCALER: prompt = "Perform neural 4x upscaling, enhancing sharp edges and skin textures while removing noise."; break;
      case ToolType.BG_REMOVER: prompt = "Detect the main subject and remove the background entirely, leaving a pure transparent or clean studio backdrop."; break;
      case ToolType.RESIZER: prompt = `Professionally reframe and resize this image to ${customParams.width}x${customParams.height}${customParams.unit}. Ensure the person is perfectly centered.`; break;
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
    if (!part?.inlineData) throw new Error("Neural tool processing failed.");
    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
  });
};
