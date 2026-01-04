
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { UserAnalysis, PhotoStyle, GeneratedImage, ToolType } from "../types";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Robustly retrieves the API key from the environment.
 * Handles Vite static replacement, runtime platform injection, and standard Node-like environments.
 */
const getActiveApiKey = () => {
  // First, check the standard process.env.API_KEY
  // We use a try-catch and dynamic access to avoid issues with static optimizers
  let key: any;
  try {
    key = process.env.API_KEY;
  } catch (e) {
    key = undefined;
  }

  // If the baked-in value is useless, check for runtime shims provided by the platform (e.g. window.process)
  if (!key || key === 'undefined' || key === 'null' || key === '') {
    const runtimeProcess = (globalThis as any).process || (window as any).process;
    key = runtimeProcess?.env?.API_KEY;
  }

  // Final check for the string "undefined" which Vite often bakes in during build if the env var is missing
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
  public isEntityNotFound: boolean = false;
  constructor(message: string, isEntityNotFound = false) {
    super(message);
    this.name = "AuthError";
    this.isEntityNotFound = isEntityNotFound;
  }
}

async function callGeminiWithRetry<T>(fn: (ai: GoogleGenAI) => Promise<T>, maxRetries = 2): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const apiKey = getActiveApiKey();
      
      // If no key is found, and we are in a platform context, we should tell the user to select one.
      if (!apiKey) {
        throw new AuthError("Neural Engine Link missing. The API key is not configured in this environment.");
      }
      
      const ai = new GoogleGenAI({ apiKey });
      return await fn(ai);
    } catch (error: any) {
      lastError = error;
      const errorStr = typeof error === 'string' ? error : (error?.message || JSON.stringify(error));
      
      console.error(`[Neural Engine] Attempt ${attempt + 1} failed:`, errorStr);

      if (errorStr.includes('Requested entity was not found')) {
        throw new AuthError("Model Unavailable: This model ID is not enabled for your project or region.", true);
      }

      if (
        errorStr.includes('401') || 
        errorStr.includes('403') || 
        errorStr.includes('API key not valid') ||
        errorStr.includes('PERMISSION_DENIED')
      ) {
        throw new AuthError("Auth Failed: The API key is invalid or lacks permissions for Gemini 3 models.");
      }

      if (errorStr.includes('SAFETY') || errorStr.includes('blocked')) {
        throw new SafetyError("Safety filter blocked this request.");
      }

      const isRateLimit = errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED');
      if (isRateLimit) {
        if (attempt < maxRetries - 1) {
          await delay(3000 * (attempt + 1));
          continue;
        }
        throw new QuotaExceededError("Rate limit exceeded. Please wait a moment.");
      }
      throw error;
    }
  }
  throw lastError;
}

const parseDataUrl = (dataUrl: string) => {
  const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) throw new Error("Invalid image format");
  return { mimeType: matches[1], data: matches[2] };
};

export const analyzePhotos = async (images: string[]): Promise<UserAnalysis> => {
  return callGeminiWithRetry(async (ai) => {
    const parts = images.map(img => {
      const { mimeType, data } = parseDataUrl(img);
      return { inlineData: { data, mimeType } };
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: {
        parts: [
          ...parts,
          { text: "Analyze these photos for facial and body characteristics. Output JSON." }
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
  return callGeminiWithRetry(async (ai) => {
    const { mimeType, data } = parseDataUrl(referenceImage);
    const prompt = `A professional ${style} portrait of this person. Maintain facial structure: ${analysis.facialStructure}. High fidelity.`;

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
      description: `Professional ${style} generation.` 
    };
  });
};

export const editPhotoWithText = async (baseImageUrl: string, instruction: string): Promise<string> => {
  return callGeminiWithRetry(async (ai) => {
    const { mimeType, data } = parseDataUrl(baseImageUrl);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data, mimeType } },
          { text: `${instruction}. Generate result as image.` }
        ]
      }
    });
    const b64 = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (!b64?.inlineData) throw new Error("Edit failed.");
    return `data:${b64.inlineData.mimeType};base64,${b64.inlineData.data}`;
  });
};

export const processToolAction = async (imageUrl: string, tool: ToolType, customParams?: any): Promise<string> => {
  return callGeminiWithRetry(async (ai) => {
    const { mimeType, data } = parseDataUrl(imageUrl);
    let prompt = "";
    switch (tool) {
      case ToolType.WATERMARK_REMOVER: prompt = "Remove any visual overlays or text. Restore original surface."; break;
      case ToolType.UPSCALER: prompt = "Increase resolution and clarity of the subject."; break;
      case ToolType.BG_REMOVER: prompt = "Isolate the subject and remove the background completely."; break;
      case ToolType.RESIZER: prompt = `Adjust to ${customParams.width}x${customParams.height}${customParams.unit}.`; break;
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
    if (!part?.inlineData) throw new Error("Neural processing failed.");
    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
  });
};
