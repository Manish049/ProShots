
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './components/Hero';
import UploadSection from './components/UploadSection';
import StyleSelector from './components/StyleSelector';
import ProcessingStatus from './components/ProcessingStatus';
import ResultGallery from './components/ResultGallery';
import ToolsHub from './components/ToolsHub';
import FounderPage from './components/FounderPage';
import { AppStep, PhotoStyle, GeneratedImage, UserAnalysis, ToolType } from './types';
import { analyzePhotos, generateEnhancedPhoto, AuthError } from './services/geminiService';
import { TESTIMONIALS } from './constants';
import { Zap, Key, ShieldCheck, PowerOff, AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.LANDING);
  const [activeTool, setActiveTool] = useState<ToolType>(ToolType.BG_REMOVER);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<PhotoStyle | null>(null);
  const [analysis, setAnalysis] = useState<UserAnalysis | null>(null);
  const [results, setResults] = useState<GeneratedImage[]>([]);
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 25 });
  const [appError, setAppError] = useState<{title: string, msg: string, action?: string, isWarning?: boolean} | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isKeyConfigured, setIsKeyConfigured] = useState(false);

  useEffect(() => {
    const discoverNeuralEngine = async () => {
      const envKeyExists = process.env.API_KEY && process.env.API_KEY !== 'undefined' && process.env.API_KEY !== '';
      const platformKeyExists = window.aistudio ? await window.aistudio.hasSelectedApiKey() : false;
      
      if (envKeyExists || platformKeyExists) {
        setIsKeyConfigured(true);
      }
    };

    discoverNeuralEngine();

    const handleSync = () => {
      setIsKeyConfigured(true);
      showToast("Neural Link Active", 'success');
      setAppError(null);
    };

    const handleDisconnect = () => {
      setIsKeyConfigured(false);
      setAppError(null);
      showToast("Link Terminated", 'error');
      setStep(AppStep.LANDING);
    };

    window.addEventListener('neural_sync_complete', handleSync);
    window.addEventListener('neural_disconnect', handleDisconnect);
    
    return () => {
      window.removeEventListener('neural_sync_complete', handleSync);
      window.removeEventListener('neural_disconnect', handleDisconnect);
    };
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleStepChange = async (newStep: AppStep, params?: any) => {
    if ([AppStep.UPLOAD, AppStep.TOOLS].includes(newStep)) {
      if (!isKeyConfigured) {
        setAppError({
          title: "Sync Required",
          msg: "The Neural Engine is offline. For production (Vercel), ensure API_KEY is set in environment variables. For development, establish a secure link below.",
          action: "open_config"
        });
        return;
      }
    }
    
    if (newStep === AppStep.TOOLS && params?.toolId) setActiveTool(params.toolId);
    setStep(newStep);
    setAppError(null);
    if (!params?.targetId) window.scrollTo(0, 0);
  };

  const startAIProcessing = async (photos: string[], style: PhotoStyle) => {
    try {
      setGenerationProgress({ current: 0, total: 25 });
      const profile = await analyzePhotos(photos.slice(0, 5));
      setAnalysis(profile);
      
      const generated: GeneratedImage[] = [];
      for (let i = 0; i < 25; i++) {
        const img = await generateEnhancedPhoto(profile, style, photos[i % photos.length]);
        generated.push(img);
        setGenerationProgress({ current: i + 1, total: 25 });
      }
      setResults(generated);
      setStep(AppStep.RESULTS);
    } catch (error: any) {
      if (error instanceof AuthError) {
        if (error.isEntityNotFound) {
          // Reset key state if model not found
          setIsKeyConfigured(false);
          setAppError({ 
            title: "Model Unavailable", 
            msg: "The specific Gemini model is not enabled for your project or region. Please select a different API Key or project.", 
            action: "open_config",
            isWarning: true
          });
        } else {
          setAppError({ title: "Auth Failed", msg: error.message, action: "open_config" });
        }
      } else {
        setAppError({ title: "Neural Error", msg: "The engine encountered an issue. Check your connection or try a different image." });
      }
      setStep(AppStep.LANDING);
    }
  };

  const handleAppAction = async () => {
    if (appError?.action === 'open_config') {
      if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
        try {
          await window.aistudio.openSelectKey();
          window.dispatchEvent(new CustomEvent('neural_sync_complete'));
        } catch (e) {
          console.warn("Handshake failed:", e);
        }
      } else {
        // For non-platform web, provide clear feedback
        showToast("Manually set API_KEY in Vercel settings", 'error');
      }
    }
    setAppError(null);
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <Navbar onStepChange={handleStepChange} currentStep={step} />
      
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-4 duration-500">
          <div className={`px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-4 border ${
            toast.type === 'success' ? 'bg-white border-green-100 text-green-700' : 'bg-white border-red-100 text-red-700'
          }`}>
            <div className={`p-2 rounded-xl ${toast.type === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
              {toast.type === 'success' ? <ShieldCheck className="w-5 h-5" /> : <PowerOff className="w-5 h-5" />}
            </div>
            <span className="text-sm font-black uppercase tracking-widest">{toast.message}</span>
          </div>
        </div>
      )}

      <main className="flex-1 pt-20">
        {appError ? (
          <div className="max-w-xl mx-auto px-6 py-32 text-center animate-in fade-in zoom-in duration-500">
            <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl relative overflow-hidden">
              <div className={`${appError.isWarning ? 'bg-amber-50' : 'bg-red-50'} w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8`}>
                {appError.isWarning ? <AlertTriangle className="w-10 h-10 text-amber-500" /> : <Zap className="w-10 h-10 text-red-500" />}
              </div>
              <h2 className="text-4xl font-black mb-4 tracking-tighter uppercase">{appError.title}</h2>
              <p className="text-slate-500 font-medium mb-10">{appError.msg}</p>
              <button 
                onClick={handleAppAction}
                className="w-full bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl flex items-center justify-center gap-3"
              >
                <Key className="w-5 h-5" /> Re-sync Engine
              </button>
            </div>
          </div>
        ) : (
          (() => {
            switch (step) {
              case AppStep.LANDING:
                return (
                  <>
                    <Hero onStart={() => handleStepChange(AppStep.UPLOAD)} />
                    <section id="success-stories" className="py-20 bg-white">
                      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
                        {TESTIMONIALS.map((t, i) => (
                          <div key={i} className="bg-slate-50 p-6 rounded-[3rem] border border-slate-100">
                            <img src={t.after} className="w-full aspect-square object-cover rounded-[2rem] mb-6" alt="Success" />
                            <p className="text-slate-600 font-medium italic mb-4">"{t.content}"</p>
                            <div className="flex items-center gap-4">
                              <img src={t.avatar} className="w-10 h-10 rounded-full" alt={t.name} />
                              <div>
                                <h4 className="font-black text-sm">{t.name}</h4>
                                <p className="text-[10px] text-slate-400 font-black uppercase">{t.role}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </>
                );
              case AppStep.UPLOAD: return <UploadSection onFilesSelected={(files) => { setUploadedPhotos(files); setStep(AppStep.STYLE_SELECT); }} />;
              case AppStep.STYLE_SELECT: return <StyleSelector onStyleSelected={(style) => { setSelectedStyle(style); setStep(AppStep.PROCESSING); startAIProcessing(uploadedPhotos, style); }} />;
              case AppStep.PROCESSING: return <ProcessingStatus progress={generationProgress} />;
              case AppStep.RESULTS: return <ResultGallery images={results} onRestart={() => setStep(AppStep.LANDING)} />;
              case AppStep.TOOLS: return <ToolsHub initialTool={activeTool} />;
              case AppStep.FOUNDER: return <FounderPage />;
              default: return <Hero onStart={() => handleStepChange(AppStep.UPLOAD)} />;
            }
          })()
        )}
      </main>
      <Footer />
    </div>
  );
};

export default App;
