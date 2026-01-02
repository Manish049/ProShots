
interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

interface Window {
  // Fix: Making aistudio optional to match potential internal declarations and fix "identical modifiers" error.
  aistudio?: AIStudio;
}

declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
  }
}
