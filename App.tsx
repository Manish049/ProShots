
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
import { analyzePhotos, generateEnhancedPhoto } from './services/geminiService';
import { TESTIMONIALS } from './constants';
import { ShieldCheck, PowerOff, AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.LANDING);
  const [activeTool, setActiveTool] = useState<ToolType>(ToolType.BG_REMOVER);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<PhotoStyle | null>(null);
  const [results, setResults] = useState<GeneratedImage[]>([]);
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 25 });
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleStepChange = (newStep: AppStep, params?: any) => {
    if (newStep === AppStep.TOOLS && params?.toolId) setActiveTool(params.toolId);
    setStep(newStep);
    if (!params?.targetId) window.scrollTo(0, 0);
  };

  const startAIProcessing = async (photos: string[], style: PhotoStyle) => {
    try {
      setGenerationProgress({ current: 0, total: 25 });
      const profile = await analyzePhotos(photos.slice(0, 5));
      
      const generated: GeneratedImage[] = [];
      for (let i = 0; i < 25; i++) {
        const img = await generateEnhancedPhoto(profile, style, photos[i % photos.length]);
        generated.push(img);
        setGenerationProgress({ current: i + 1, total: 25 });
      }
      setResults(generated);
      setStep(AppStep.RESULTS);
    } catch (error: any) {
      showToast(error.message || "Neural Engine Error", 'error');
      setStep(AppStep.LANDING);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <Navbar onStepChange={handleStepChange} currentStep={step} />
      
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-4">
          <div className={`px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-4 border bg-white ${
            toast.type === 'success' ? 'border-green-100 text-green-700' : 'border-red-100 text-red-700'
          }`}>
            {toast.type === 'success' ? <ShieldCheck className="w-5 h-5" /> : <PowerOff className="w-5 h-5" />}
            <span className="text-sm font-black uppercase tracking-widest">{toast.message}</span>
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
        })()}
      </main>
      <Footer />
    </div>
  );
};

export default App;
