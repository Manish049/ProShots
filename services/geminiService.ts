
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { UserAnalysis, PhotoStyle, GeneratedImage, ToolType } from "../types";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getActiveApiKey = () => {
  return process.env.API_KEY;
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
      if (!apiKey || apiKey === 'undefined' || apiKey === '') {
        throw new AuthError("Neural Engine Link required. Please sync your API key.");
      }
      
      const ai = new GoogleGenAI({ apiKey });
      return await fn(ai);
    } catch (error: any) {
      lastError = error;
      const errorStr = typeof error === 'string' ? error : (error?.message || JSON.stringify(error));
      
      console.error(`[Neural Engine] Attempt ${attempt + 1} failed:`, errorStr);

      // Handle specific 'Requested entity was not found' error
      if (errorStr.includes('Requested entity was not found')) {
        // This usually means the specific model isn't enabled for this project/region
        throw new AuthError("Model Unavailable: The selected AI model is not enabled for this API key. Try a different project or check your AI Studio settings.", true);
      }

      // Handle other Auth/Permission issues
      if (
        errorStr.includes('401') || 
        errorStr.includes('403') || 
        errorStr.includes('API key not valid') ||
        errorStr.includes('PERMISSION_DENIED')
      ) {
        throw new AuthError("Auth Failed: Your API key is invalid or restricted. Ensure billing is enabled (for paid models) or the Gemini API is active in AI Studio.");
      }

      // Handle Safety Blocks
      if (errorStr.includes('SAFETY') || errorStr.includes('blocked')) {
        throw new SafetyError("The neural firewall blocked this request due to safety filters.");
      }

      // Handle Quota (Rate Limits)
      const isRateLimit = errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED');
      if (isRateLimit) {
        if (attempt < maxRetries - 1) {
          await delay(3000 * (attempt + 1));
          continue;
        }
        throw new QuotaExceededError("Quota exhausted. Free tier keys have strict rate limits. Please wait 60 seconds.");
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
          { text: "Analyze these photos. Conduct a deep anatomical audit for character synthesis. Output JSON." }
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
    const prompt = `Synthesize a ${style} portrait maintaining identity. Identity: ${analysis.facialStructure}, ${analysis.eyeDetails}. Output image only.`;

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
    if (!imgPart?.inlineData) throw new Error("Neural output failed.");

    return { 
      id: Math.random().toString(36).substr(2, 9), 
      url: `data:${imgPart.inlineData.mimeType};base64,${imgPart.inlineData.data}`, 
      category: style, 
      description: `Studio ${style} synthesis.` 
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
          { text: `${instruction}. Generate modified image only.` }
        ]
      }
    });
    const b64 = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (!b64?.inlineData) throw new Error("The edit failed.");
    return `data:${b64.inlineData.mimeType};base64,${b64.inlineData.data}`;
  });
};

export const processToolAction = async (imageUrl: string, tool: ToolType, customParams?: any): Promise<string> => {
  return callGeminiWithRetry(async (ai) => {
    const { mimeType, data } = parseDataUrl(imageUrl);
    let prompt = "";
    switch (tool) {
      case ToolType.WATERMARK_REMOVER: prompt = "Restore image surface. Remove overlays. Output image only."; break;
      case ToolType.UPSCALER: prompt = "Enhance resolution and micro-details. Output image only."; break;
      case ToolType.BG_REMOVER: prompt = "Precisely isolate subject and remove background. Output image only."; break;
      case ToolType.RESIZER: prompt = `Resize to ${customParams.width}x${customParams.height}${customParams.unit}. Output image only.`; break;
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
    if (!part?.inlineData) throw new Error("Neural output blocked.");
    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
  });
};
