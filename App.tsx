
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
import NeuralConfigModal from './components/NeuralConfigModal';
import { AppStep, PhotoStyle, GeneratedImage, UserAnalysis, ToolType } from './types';
import { analyzePhotos, generateEnhancedPhoto, setSessionKey, getSessionKey } from './services/geminiService';
import { TESTIMONIALS } from './constants';
import { ShieldCheck, PowerOff, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.LANDING);
  const [activeTool, setActiveTool] = useState<ToolType>(ToolType.BG_REMOVER);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<PhotoStyle | null>(null);
  const [results, setResults] = useState<GeneratedImage[]>([]);
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 25 });
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Check for existing keys on load to "auto-configure"
  useEffect(() => {
    const key = getSessionKey();
    if (key) {
      console.log("Neural Engine auto-configured from existing credentials.");
    }
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleStepChange = (newStep: AppStep, params?: any) => {
    if (newStep === AppStep.TOOLS && params?.toolId) setActiveTool(params.toolId);
    setStep(newStep);
    if (!params?.targetId) window.scrollTo(0, 0);
  };

  const handleSyncEngine = (key: string) => {
    setSessionKey(key);
    showToast("Neural Engine Synced Successfully", "success");
    // If the user was in the middle of a process, they can retry now
  };

  const startAIProcessing = async (photos: string[], style: PhotoStyle) => {
    try {
      setGenerationProgress({ current: 0, total: 25 });
      
      // Step 1: Anatomical Analysis
      const profile = await analyzePhotos(photos.slice(0, 5));
      
      // Step 2: Generation Loop
      const generated: GeneratedImage[] = [];
      const totalToGenerate = 25;
      
      for (let i = 0; i < totalToGenerate; i++) {
        // Use different reference images for variety
        const refImg = photos[i % photos.length];
        const img = await generateEnhancedPhoto(profile, style, refImg);
        generated.push(img);
        setGenerationProgress({ current: i + 1, total: totalToGenerate });
      }
      
      setResults(generated);
      setStep(AppStep.RESULTS);
    } catch (error: any) {
      const errorMsg = error.message || "Neural Engine Fault";
      showToast(errorMsg, 'error');
      
      // Open modal if it seems like a key issue
      if (errorMsg.toLowerCase().includes("key") || errorMsg.toLowerCase().includes("auth") || errorMsg.toLowerCase().includes("500")) {
        setIsConfigModalOpen(true);
      }
      
      setStep(AppStep.LANDING);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <Navbar 
        onStepChange={handleStepChange} 
        currentStep={step} 
        onOpenConfig={() => setIsConfigModalOpen(true)}
      />
      
      <NeuralConfigModal 
        isOpen={isConfigModalOpen} 
        onClose={() => setIsConfigModalOpen(false)} 
        onSync={handleSyncEngine}
      />
      
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-8">
          <div className={`px-8 py-5 rounded-[2rem] shadow-2xl flex items-center gap-4 border bg-white ${
            toast.type === 'success' ? 'border-green-100 text-green-700' : 'border-red-100 text-red-700'
          }`}>
            {toast.type === 'success' ? (
              <div className="bg-green-100 p-2 rounded-full"><CheckCircle2 className="w-5 h-5" /></div>
            ) : (
              <div className="bg-red-100 p-2 rounded-full"><AlertTriangle className="w-5 h-5" /></div>
            )}
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-50">System Message</span>
              <span className="text-sm font-black uppercase tracking-tighter">{toast.message}</span>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 pt-20">
        {(() => {
          switch (step) {
            case AppStep.LANDING:
              return (
                <>
                  <Hero onStart={() => handleStepChange(AppStep.UPLOAD)} />
                  <section id="success-stories" className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
                      {TESTIMONIALS.map((t, i) => (
                        <div key={i} className="bg-slate-50 p-6 rounded-[3rem] border border-slate-100 hover:shadow-xl transition-all group">
                          <div className="overflow-hidden rounded-[2rem] mb-6">
                            <img src={t.after} className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-1000" alt="Success" />
                          </div>
                          <p className="text-slate-600 font-medium italic mb-4">"{t.content}"</p>
                          <div className="flex items-center gap-4">
                            <img src={t.avatar} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt={t.name} />
                            <div>
                              <h4 className="font-black text-sm">{t.name}</h4>
                              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{t.role}</p>
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
        })()}
      </main>
      <Footer />
    </div>
  );
};

export default App;
