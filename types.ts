
export enum AppStep {
  LANDING = 'landing',
  UPLOAD = 'upload',
  STYLE_SELECT = 'style_select',
  PROCESSING = 'processing',
  RESULTS = 'results',
  TOOLS = 'tools'
}

export enum ToolType {
  WATERMARK_REMOVER = 'watermark_remover',
  UPSCALER = 'upscaler',
  BG_REMOVER = 'bg_remover',
  RESIZER = 'resizer'
}

export enum PhotoStyle {
  PROFESSIONAL = 'Professional',
  DATING = 'Dating',
  VACATION = 'Vacation',
  PARTY = 'Party Shots',
  ANIMATION_2D = '2D Animated Image',
  ANIMATION_3D = '3D Animated Image'
}

export interface UserAnalysis {
  facialStructure: string;
  bodyShape: string;
  hairstyle: string;
  eyeShapeAndColor: string;
  noseShape: string;
  lipShapeAndColor: string;
  eyebrowShape: string;
  skinTone: string;
  // Metadata for the generation engine
  facialFeatures: string;
  eyeDetails: string;
  skinTexture: string;
  bodyProportions: string;
  hairCharacteristics: string;
  lightingEnvironment: string;
  poseSuggestions: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  category: PhotoStyle | ToolType;
  description: string;
}

export interface Testimonial {
  name: string;
  role: string;
  content: string;
  avatar: string;
}