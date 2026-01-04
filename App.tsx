
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
// Added missing RefreshCw icon import
import { Zap, Key, ShieldCheck, PowerOff, AlertTriangle, ExternalLink, ListChecks, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.LANDING);
  const [activeTool, setActiveTool] = useState<ToolType>(ToolType.BG_REMOVER);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<PhotoStyle | null>(null);
  const [analysis, setAnalysis] = useState<UserAnalysis | null>(null);
  const [results, setResults] = useState<GeneratedImage[]>([]);
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 25 });
  const [appError, setAppError] = useState<{title: string, msg: string, action?: string, isProduction?: boolean} | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isKeyConfigured, setIsKeyConfigured] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      const envKey = process.env.API_KEY;
      const envKeyValid = envKey && envKey !== 'undefined' && envKey !== 'null' && envKey !== '';
      const platformKey = window.aistudio ? await window.aistudio.hasSelectedApiKey() : false;
      
      if (envKeyValid || platformKey) {
        setIsKeyConfigured(true);
      }
    };

    checkKey();

    const handleSync = () => {
      setIsKeyConfigured(true);
      showToast("Neural Link Active", 'success');
      setAppError(null);
    };

    window.addEventListener('neural_sync_complete', handleSync);
    window.addEventListener('neural_disconnect', () => setIsKeyConfigured(false));
    
    return () => {
      window.removeEventListener('neural_sync_complete', handleSync);
    };
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleStepChange = async (newStep: AppStep, params?: any) => {
    if ([AppStep.UPLOAD, AppStep.TOOLS].includes(newStep)) {
      if (!isKeyConfigured) {
        const isProd = window.location.hostname !== 'localhost' && !window.aistudio;
        setAppError({
          title: "Neural Engine Offline",
          msg: isProd 
            ? "Authentication missing in production environment." 
            : "No API Key found. Establish a secure link to continue.",
          action: "open_config",
          isProduction: isProd
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
        setAppError({ 
          title: "Auth Failed", 
          msg: error.message, 
          action: "open_config",
          isProduction: !window.aistudio 
        });
      } else {
        setAppError({ 
          title: "Neural Error", 
          msg: "The AI engine encountered a processing fault. This often happens due to rate limits or invalid image content." 
        });
      }
      setStep(AppStep.LANDING);
    }
  };

  const handleAppAction = async () => {
    if (appError?.action === 'open_config') {
      if (window.aistudio) {
        try {
          await window.aistudio.openSelectKey();
          window.dispatchEvent(new CustomEvent('neural_sync_complete'));
        } catch (e) {
          console.warn("Handshake failed");
        }
      } else {
        window.location.reload(); // Refresh to re-check env vars
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
          <div className="max-w-2xl mx-auto px-6 py-32 text-center animate-in fade-in zoom-in duration-500">
            <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl relative overflow-hidden">
              <div className="bg-red-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-4xl font-black mb-4 tracking-tighter uppercase">{appError.title}</h2>
              <p className="text-slate-500 font-medium mb-10 leading-relaxed">{appError.msg}</p>
              
              {appError.isProduction && (
                <div className="mb-10 p-6 bg-slate-50 rounded-[2.5rem] text-left border border-slate-100">
                  <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-900 mb-4">
                    <ListChecks className="w-4 h-4" /> Production Checklist
                  </h4>
                  <ul className="space-y-3 text-xs font-medium text-slate-500">
                    <li className="flex gap-2">1. Open your Vercel Project Dashboard.</li>
                    <li className="flex gap-2">2. Navigate to <b>Settings &gt; Environment Variables</b>.</li>
                    <li className="flex gap-2">3. Add <b>API_KEY</b> with your Google AI Studio key.</li>
                    <li className="flex gap-2">4. <b>Redeploy</b> your application to apply changes.</li>
                  </ul>
                  <a href="https://vercel.com/docs/concepts/projects/environment-variables" target="_blank" className="mt-4 inline-flex items-center gap-1 text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">
                    View Documentation <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              <button 
                onClick={handleAppAction}
                className="w-full bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl flex items-center justify-center gap-3"
              >
                {appError.isProduction ? <RefreshCw className="w-5 h-5" /> : <Key className="w-5 h-5" />} 
                {appError.isProduction ? 'Check for Key & Reload' : 'Re-sync Engine'}
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
