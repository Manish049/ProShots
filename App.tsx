
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
import { analyzePhotos, generateEnhancedPhoto, AuthError, SafetyError, QuotaExceededError } from './services/geminiService';
import { TESTIMONIALS } from './constants';
import { Sparkles, Zap, Key, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.LANDING);
  const [activeTool, setActiveTool] = useState<ToolType>(ToolType.BG_REMOVER);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<PhotoStyle | null>(null);
  const [analysis, setAnalysis] = useState<UserAnalysis | null>(null);
  const [results, setResults] = useState<GeneratedImage[]>([]);
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 25 });
  const [appError, setAppError] = useState<{title: string, msg: string, action?: string} | null>(null);
  const [isKeyConfigured, setIsKeyConfigured] = useState(false);

  useEffect(() => {
    const checkSync = async () => {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setIsKeyConfigured(hasKey);
      }
    };
    checkSync();
    
    const handleSync = () => setIsKeyConfigured(true);
    window.addEventListener('neural_sync_complete', handleSync);
    return () => window.removeEventListener('neural_sync_complete', handleSync);
  }, []);

  const handleStepChange = async (newStep: AppStep, params?: any) => {
    if (newStep === AppStep.UPLOAD) {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          setAppError({
            title: "Neural Sync Required",
            msg: "To perform deep anatomical character synthesis, ProShots requires a synchronized Neural Engine. Please configure your link in the Neural Console.",
            action: "select_key"
          });
          return;
        }
        setIsKeyConfigured(true);
      }
    }
    
    if (newStep === AppStep.TOOLS) {
      if (params?.toolId) setActiveTool(params.toolId);
    }
    setStep(newStep);
    setAppError(null);
    if (!params?.targetId) {
      window.scrollTo(0, 0);
    }
  };

  const handleFilesSelected = (files: string[]) => {
    setUploadedPhotos(files);
    setStep(AppStep.STYLE_SELECT);
  };

  const handleStyleSelected = (style: PhotoStyle) => {
    setSelectedStyle(style);
    setStep(AppStep.PROCESSING);
    setAppError(null);
    startAIProcessing(uploadedPhotos, style);
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const startAIProcessing = async (photos: string[], style: PhotoStyle) => {
    try {
      setGenerationProgress({ current: 0, total: 25 });
      
      const profile = await analyzePhotos(photos.slice(0, 5));
      setAnalysis(profile);
      
      await delay(2000); 

      const generated: GeneratedImage[] = [];
      const totalToGenerate = 25;
      
      for (let i = 0; i < totalToGenerate; i++) {
        try {
          const refImg = photos[i % photos.length];
          const img = await generateEnhancedPhoto(profile, style, refImg);
          generated.push(img);
          setGenerationProgress({ current: i + 1, total: totalToGenerate });
          await delay(3500); 
        } catch (error: any) {
          console.error(`Generation attempt ${i + 1} failed:`, error);
          if (error instanceof AuthError) throw error;
          setGenerationProgress({ current: i + 1, total: totalToGenerate });
        }
      }

      if (generated.length === 0) {
        throw new Error("Could not generate any images. Try a different style or photos.");
      }
      
      setResults(generated);
      setStep(AppStep.RESULTS);
    } catch (error: any) {
      console.error("Critical AI Processing failure:", error);
      
      if (error instanceof AuthError) {
        setAppError({
          title: "Engine Disconnected",
          msg: "The Neural Sync was interrupted or the key is invalid. Please re-synchronize to continue.",
          action: "select_key"
        });
      } else if (error instanceof SafetyError) {
        setAppError({
          title: "Safety Shield Block",
          msg: "The AI detected potentially sensitive content. Please ensure your photos adhere to professional guidelines.",
        });
      } else if (error instanceof QuotaExceededError) {
        setAppError({
          title: "Neural Traffic High",
          msg: "We are currently processing peak volume. Please retry in 60 seconds.",
        });
      } else {
        setAppError({
          title: "Processing Error",
          msg: "An unexpected error occurred in the neural pipeline. Let's try that again.",
        });
      }
      setStep(AppStep.UPLOAD);
    }
  };

  const handleAppAction = async () => {
    if (appError?.action === 'select_key') {
      if (window.aistudio) {
        await window.aistudio.openSelectKey();
        setIsKeyConfigured(true);
        setAppError(null);
        window.dispatchEvent(new CustomEvent('neural_sync_complete'));
      }
    } else {
      setAppError(null);
    }
  };

  const renderContent = () => {
    if (appError) {
      return (
        <div className="max-w-xl mx-auto px-6 py-32 text-center animate-in fade-in zoom-in duration-500">
          <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-amber-400" />
            <div className="bg-amber-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <Zap className="w-10 h-10 text-amber-500 fill-amber-500" />
            </div>
            <h2 className="text-4xl font-black mb-4 tracking-tighter uppercase">{appError.title}</h2>
            <p className="text-slate-500 font-medium leading-relaxed mb-10">{appError.msg}</p>
            
            <div className="space-y-4">
              <button 
                onClick={handleAppAction}
                className="w-full bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-3"
              >
                {appError.action === 'select_key' ? <Key className="w-5 h-5" /> : <RefreshCw className="w-5 h-5" />}
                {appError.action === 'select_key' ? 'Synchronize Now' : 'Back to Console'}
              </button>
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
              >
                Why is synchronization required?
              </a>
            </div>
          </div>
        </div>
      );
    }

    switch (step) {
      case AppStep.LANDING:
        return (
          <>
            <Hero onStart={() => handleStepChange(AppStep.UPLOAD)} />
            <section id="success-stories" className="py-40 bg-white scroll-mt-20">
              <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col lg:flex-row items-end justify-between mb-24 gap-12">
                  <div className="max-w-2xl">
                    <h2 className="text-6xl font-black mb-6 tracking-tighter uppercase">Proof in Pixels.</h2>
                    <p className="text-xl text-slate-500 font-medium leading-relaxed">
                      We've helped over 12,000 professionals land their dream roles through high-impact imagery.
                    </p>
                  </div>
                  <div className="flex gap-4 p-2 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <div className="px-8 py-6 bg-white rounded-[1.5rem] shadow-sm text-center border border-slate-100">
                      <div className="text-3xl font-black text-slate-900">12k+</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Users</div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {TESTIMONIALS.map((t, i) => (
                    <div key={i} className="group relative">
                      <div className="bg-slate-50 p-2 rounded-[3rem] border border-slate-100 hover:shadow-2xl transition-all duration-500">
                        <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden mb-8">
                          <img src={t.after} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Result" />
                          <div className="absolute top-4 left-4 right-4 flex justify-between">
                            <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">After</div>
                            <div className="bg-slate-900 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Enhanced</div>
                          </div>
                        </div>
                        <div className="px-6 pb-8">
                          <p className="text-slate-600 font-medium mb-8 leading-relaxed italic">"{t.content}"</p>
                          <div className="flex items-center gap-4 pt-6 border-t border-slate-200">
                            <img src={t.avatar} className="w-12 h-12 rounded-full border-2 border-white shadow-md" alt={t.name} />
                            <div>
                              <h4 className="font-black text-slate-900 text-sm">{t.name}</h4>
                              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{t.role}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        );
      case AppStep.UPLOAD: return <UploadSection onFilesSelected={handleFilesSelected} />;
      case AppStep.STYLE_SELECT: return <StyleSelector onStyleSelected={handleStyleSelected} />;
      case AppStep.PROCESSING: return <ProcessingStatus progress={generationProgress} />;
      case AppStep.RESULTS: return <ResultGallery images={results} onRestart={() => setStep(AppStep.LANDING)} />;
      case AppStep.TOOLS: return <ToolsHub initialTool={activeTool} />;
      case AppStep.FOUNDER: return <FounderPage />;
      default: return <Hero onStart={() => handleStepChange(AppStep.UPLOAD)} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-slate-900 selection:text-white">
      <Navbar onStepChange={handleStepChange} currentStep={step} />
      <main className="flex-1 pt-20">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
};

export default App;
