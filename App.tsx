
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
import { Sparkles, Zap, Key, RefreshCw, ShieldCheck, PowerOff } from 'lucide-react';

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
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // APP INITIALIZATION: Connection is strictly session-based
  useEffect(() => {
    // On rebuild/refresh, we treat the engine as unsynced
    // The user MUST click 'Sync Engine' to re-verify for the current session.
    const syncStatus = sessionStorage.getItem('neural_session_active') === 'true';
    setIsKeyConfigured(syncStatus);
    
    const handleSync = (e: any) => {
      setIsKeyConfigured(true);
      showToast(e.detail?.message || "Engine Synchronized", 'success');
    };

    const handleDisconnect = (e: any) => {
      setIsKeyConfigured(false);
      showToast(e.detail?.message || "Link Severed Successfully", 'error');
      
      // DEEP PURGE: Clear all session state
      setAnalysis(null);
      setResults([]);
      setUploadedPhotos([]);
      setSelectedStyle(null);
      setAppError(null);
      
      // REDIRECT: Go back to Landing
      setStep(AppStep.LANDING);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
    setTimeout(() => setToast(null), 4000);
  };

  const handleStepChange = async (newStep: AppStep, params?: any) => {
    // Neural Verification Barrier
    if ([AppStep.UPLOAD, AppStep.TOOLS].includes(newStep)) {
      const isSessionActive = sessionStorage.getItem('neural_session_active') === 'true';
      
      if (!isSessionActive) {
        setAppError({
          title: "Engine Offline",
          msg: "The Neural Link is currently removed or inactive. Please use the 'Sync Engine' protocol in the navbar to re-initialize.",
          action: "select_key"
        });
        return;
      }
      setIsKeyConfigured(true);
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
          // Mid-process verification: Ensure session remains active
          const isSessionActive = sessionStorage.getItem('neural_session_active') === 'true';
          if (!isSessionActive) throw new AuthError("Session was terminated during processing.");
          
          const refImg = photos[i % photos.length];
          const img = await generateEnhancedPhoto(profile, style, refImg);
          generated.push(img);
          setGenerationProgress({ current: i + 1, total: totalToGenerate });
          await delay(3500); 
        } catch (error: any) {
          console.error(`Attempt ${i + 1} failed:`, error);
          if (error instanceof AuthError) throw error;
          setGenerationProgress({ current: i + 1, total: totalToGenerate });
        }
      }

      if (generated.length === 0) throw new Error("Processing failed.");
      
      setResults(generated);
      setStep(AppStep.RESULTS);
    } catch (error: any) {
      console.error("Critical Neural failure:", error);
      
      if (error instanceof AuthError) {
        setAppError({
          title: "Link Terminated",
          msg: "The Neural session was severed. Re-sync via the engine console to continue.",
          action: "select_key"
        });
      } else if (error instanceof SafetyError) {
        setAppError({ title: "Safety Protocol", msg: "Sensitive content detected. Re-sync with clear source images." });
      } else {
        setAppError({ title: "Pipeline Error", msg: "An unexpected error occurred. Please restart your neural session." });
      }
      setStep(AppStep.LANDING);
    }
  };

  const handleAppAction = async () => {
    if (appError?.action === 'select_key') {
      if (window.aistudio) {
        await window.aistudio.openSelectKey();
        window.dispatchEvent(new CustomEvent('neural_sync_complete', { 
          detail: { message: "Link Success" } 
        }));
        setAppError(null);
      }
    } else {
      setAppError(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-slate-900 selection:text-white relative">
      <Navbar onStepChange={handleStepChange} currentStep={step} />
      
      {toast && (
        <div 
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-4 duration-500"
          role="alert"
          aria-live="polite"
        >
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
              <div className="bg-amber-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <Zap className="w-10 h-10 text-amber-500 fill-amber-500" />
              </div>
              <h2 className="text-4xl font-black mb-4 tracking-tighter uppercase">{appError.title}</h2>
              <p className="text-slate-500 font-medium leading-relaxed mb-10">{appError.msg}</p>
              
              <button 
                onClick={handleAppAction}
                className="w-full bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-3"
              >
                <Key className="w-5 h-5" /> Sync Engine
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
                    <section id="success-stories" className="py-40 bg-white scroll-mt-20">
                      <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col lg:flex-row items-end justify-between mb-24 gap-12">
                          <div className="max-w-2xl">
                            <h2 className="text-6xl font-black mb-6 tracking-tighter uppercase">Verified Output.</h2>
                            <p className="text-xl text-slate-500 font-medium leading-relaxed">Join 12k+ users leveraging the Gemini Neural Engine.</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                          {TESTIMONIALS.map((t, i) => (
                            <div key={i} className="group relative">
                              <div className="bg-slate-50 p-2 rounded-[3rem] border border-slate-100 hover:shadow-2xl transition-all duration-500">
                                <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden mb-8">
                                  <img src={t.after} className="w-full h-full object-cover" alt="Success Story" />
                                </div>
                                <div className="px-6 pb-8">
                                  <p className="text-slate-600 font-medium mb-8 italic">"{t.content}"</p>
                                  <div className="flex items-center gap-4 pt-6 border-t border-slate-200">
                                    <img src={t.avatar} className="w-12 h-12 rounded-full" alt={t.name} />
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
          })()
        )}
      </main>
      <Footer />
    </div>
  );
};

export default App;
