
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { UserAnalysis, PhotoStyle, GeneratedImage, ToolType } from "../types";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to get the most up-to-date API key
const getActiveApiKey = () => {
  return localStorage.getItem('proshots_manual_key') || process.env.API_KEY;
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
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

async function callGeminiWithRetry<T>(fn: (ai: GoogleGenAI) => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const apiKey = getActiveApiKey();
      if (!apiKey) {
        throw new AuthError("API Key is missing. Please enter your key in the Neural Console.");
      }
      
      const ai = new GoogleGenAI({ apiKey });
      return await fn(ai);
    } catch (error: any) {
      lastError = error;
      const errorStr = typeof error === 'string' ? error : (error?.message || JSON.stringify(error));
      
      // Handle Authentication / Project Issues including 'entity not found'
      if (
        errorStr.includes('401') || 
        errorStr.includes('403') || 
        errorStr.includes('Requested entity was not found') ||
        errorStr.includes('API key not valid')
      ) {
        throw new AuthError("Authentication failed. Ensure your API Key is valid and billing is enabled.");
      }

      // Handle Safety Blocks
      if (errorStr.includes('SAFETY') || errorStr.includes('blocked') || errorStr.includes('finishReason: SAFETY')) {
        throw new SafetyError("The request was blocked by safety filters. Try a different image or description.");
      }

      // Handle Quota
      const isRateLimit = 
        error?.status === 429 || 
        error?.code === 429 || 
        errorStr.includes('429') || 
        errorStr.includes('RESOURCE_EXHAUSTED') ||
        errorStr.includes('quota');

      if (isRateLimit) {
        if (attempt < maxRetries - 1) {
          const waitTime = Math.pow(3, attempt) * 3000 + Math.random() * 2000;
          await delay(waitTime);
          continue;
        } else {
          throw new QuotaExceededError("API Quota exhausted. Please try again in a few minutes.");
        }
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
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          ...parts,
          { text: `Task: Conduct a deep anatomical audit for character synthesis. 
          Analyze facial geometry, eye shape, and skin texture.
          Output JSON.` }
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
  return callGeminiWithRetry(async (ai) => {
    const { mimeType, data } = parseDataUrl(referenceImage);
    
    let stylePrompt = "";
    switch(style) {
      case PhotoStyle.VACATION:
        stylePrompt = "Professional travel photography, luxury resort background, golden hour lighting, cinematic bokeh.";
        break;
      case PhotoStyle.PROFESSIONAL:
        stylePrompt = "High-end corporate studio headshot, professional business attire, sharp focus, neutral background.";
        break;
      case PhotoStyle.DATING:
        stylePrompt = "Warm approachable lifestyle portrait, natural outdoor lighting, stylish casual wear.";
        break;
      case PhotoStyle.PARTY:
        stylePrompt = "Vibrant night-out aesthetic, dynamic colorful lighting, sharp focus on subject.";
        break;
      case PhotoStyle.ANIMATION_2D:
        stylePrompt = "Stylized 2D animated character concept art, clean vector lines, cel-shading.";
        break;
      case PhotoStyle.ANIMATION_3D:
        stylePrompt = "Stylized 3D CGI character render, Pixar-esque aesthetics, expressive lighting.";
        break;
      default:
        stylePrompt = `High-quality ${style} aesthetic.`;
    }

    const prompt = `Synthesize a ${style} portrait maintaining the identity from the source. 
    Identity details: ${analysis.facialStructure}, ${analysis.eyeDetails}.
    Required style: ${stylePrompt}.
    Output ONLY the image part.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data, mimeType } },
          { text: prompt }
        ]
      }
    });

    let imageUrl = "";
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }

    if (!imageUrl) throw new Error("No image was generated. The output might have been filtered.");

    return { 
      id: Math.random().toString(36).substr(2, 9), 
      url: imageUrl, 
      category: style, 
      description: `Premium ${style} synthesis.` 
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
          { text: `${instruction}. Generate the modified image only.` }
        ]
      }
    });
    const b64 = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (!b64?.inlineData) throw new Error("The edit failed or was blocked.");
    return `data:${b64.inlineData.mimeType};base64,${b64.inlineData.data}`;
  });
};

export const processToolAction = async (imageUrl: string, tool: ToolType, customParams?: any): Promise<string> => {
  return callGeminiWithRetry(async (ai) => {
    const { mimeType, data } = parseDataUrl(imageUrl);
    let prompt = "";

    switch (tool) {
      case ToolType.WATERMARK_REMOVER:
        prompt = `Perform high-fidelity surface restoration. Reconstruct textures in obscured regions using surrounding context. Output image only.`;
        break;
      case ToolType.UPSCALER:
        prompt = "Enhance resolution and sharpen fine textures (pores, hair). Output image only.";
        break;
      case ToolType.BG_REMOVER:
        prompt = "Remove background and isolate subject precisely. Output image only.";
        break;
      case ToolType.RESIZER:
        prompt = `Refactor dimensions to ${customParams.width}${customParams.unit} x ${customParams.height}${customParams.unit}. Output image only.`;
        break;
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
    if (!part?.inlineData) throw new Error("Neural output blocked or failed.");
    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
  });
};
