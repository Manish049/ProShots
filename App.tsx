
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
import { Sparkles, TrendingUp, Users, CheckCircle, Brain } from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.LANDING);
  const [activeTool, setActiveTool] = useState<ToolType>(ToolType.BG_REMOVER);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<PhotoStyle | null>(null);
  const [analysis, setAnalysis] = useState<UserAnalysis | null>(null);
  const [results, setResults] = useState<GeneratedImage[]>([]);
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 25 });

  const handleStepChange = (newStep: AppStep, params?: any) => {
    if (newStep === AppStep.TOOLS) {
      if (params?.toolId) setActiveTool(params.toolId);
    }
    setStep(newStep);
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
    startAIProcessing(uploadedPhotos, style);
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const startAIProcessing = async (photos: string[], style: PhotoStyle) => {
    try {
      setGenerationProgress({ current: 0, total: 25 });
      
      // Step 1: Deep Extraction
      const profile = await analyzePhotos(photos.slice(0, 5));
      setAnalysis(profile);
      
      await delay(3000); 

      const generated: GeneratedImage[] = [];
      
      // We will generate 25 images total, strictly of the selected style.
      const totalToGenerate = 25;
      
      for (let i = 0; i < totalToGenerate; i++) {
        try {
          const refImg = photos[i % photos.length];
          const img = await generateEnhancedPhoto(profile, style, refImg);
          generated.push(img);
          
          setGenerationProgress({ current: i + 1, total: totalToGenerate });
          
          // Delay to maintain rate limits
          await delay(4500); 
        } catch (error: any) {
          console.error(`Skipping generation attempt ${i + 1} for ${style} due to error:`, error);
          setGenerationProgress({ current: i + 1, total: totalToGenerate });
        }
      }

      if (generated.length === 0) {
        throw new Error("All generation attempts failed. Please check your API quota.");
      }
      
      setResults(generated);
      setStep(AppStep.RESULTS);
    } catch (error: any) {
      console.error("Critical AI Processing failure:", error);
      const isRateLimit = error?.message?.includes('429') || error?.status === 429 || error?.code === 429;
      if (isRateLimit) {
        alert("ProShots is experiencing high traffic. Please try again in a few minutes.");
      } else {
        alert("Neural sync interrupted. Please refresh and try again.");
      }
      setStep(AppStep.UPLOAD);
    }
  };

  const renderTestimonials = () => (
    <section id="testimonials" className="py-40 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-end justify-between mb-24 gap-12">
          <div className="max-w-2xl">
            <h2 className="text-6xl font-black mb-6 tracking-tighter">PROOF IN PIXELS.</h2>
            <p className="text-xl text-slate-500 font-medium leading-relaxed">
              We've helped over 12,000 professionals land their dream roles and find meaningful connections through high-impact imagery.
            </p>
          </div>
          <div className="flex gap-4 p-2 bg-slate-50 rounded-[2rem] border border-slate-100">
            <div className="px-8 py-6 bg-white rounded-[1.5rem] shadow-sm text-center">
              <div className="text-3xl font-black text-slate-900">12k+</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Users</div>
            </div>
            <div className="px-8 py-6 text-center">
              <div className="text-3xl font-black text-slate-900">98%</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Satis.</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="group relative">
              <div className="bg-slate-50 p-2 rounded-[3rem] border border-slate-100 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500">
                <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden mb-8">
                  <img src={t.after} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Result" />
                  <div className="absolute top-4 left-4 right-4 flex justify-between">
                    <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">After</div>
                    <div className="bg-slate-900 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">Enhanced</div>
                  </div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="absolute bottom-4 right-4 bg-white p-2 rounded-2xl shadow-xl w-32 aspect-square overflow-hidden border-2 border-white">
                      <img src={t.before} className="w-full h-full object-cover" alt="Before" />
                      <div className="absolute top-0 left-0 bg-slate-900 text-white text-[8px] px-1.5 py-0.5 font-bold rounded-br-lg">BEFORE</div>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-8">
                  <div className="flex gap-1 mb-6">
                    {t.stats.map((s, si) => (
                      <div key={si} className="bg-white px-4 py-1.5 rounded-full border border-slate-100 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        {s.label}: {s.value}
                      </div>
                    ))}
                  </div>
                  <p className="text-slate-600 font-medium mb-8 leading-relaxed italic">"{t.content}"</p>
                  <div className="flex items-center gap-4 pt-6 border-t border-slate-200">
                    <img src={t.avatar} className="w-12 h-12 rounded-full border-2 border-white shadow-md" alt={t.name} />
                    <div>
                      <h4 className="font-black text-slate-900 text-sm tracking-tight">{t.name}</h4>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{t.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-40 pt-20 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
           <div className="flex items-center gap-2 font-black text-2xl tracking-tighter"><CheckCircle className="w-6 h-6"/> ISO 27001</div>
           <div className="flex items-center gap-2 font-black text-2xl tracking-tighter"><Sparkles className="w-6 h-6"/> STUDIO GRADE</div>
           <div className="flex items-center gap-2 font-black text-2xl tracking-tighter"><Users className="w-6 h-6"/> 12K+ ACTIVE</div>
           <div className="flex items-center gap-2 font-black text-2xl tracking-tighter"><Brain className="w-6 h-6"/> GEMINI POWERED</div>
        </div>
      </div>
    </section>
  );

  const renderContent = () => {
    switch (step) {
      case AppStep.LANDING:
        return (
          <>
            <Hero onStart={() => setStep(AppStep.UPLOAD)} />
            {renderTestimonials()}
          </>
        );
      case AppStep.UPLOAD:
        return <UploadSection onFilesSelected={handleFilesSelected} />;
      case AppStep.STYLE_SELECT:
        return <StyleSelector onStyleSelected={handleStyleSelected} />;
      case AppStep.PROCESSING:
        return <ProcessingStatus progress={generationProgress} />;
      case AppStep.RESULTS:
        return <ResultGallery images={results} onRestart={() => setStep(AppStep.LANDING)} />;
      case AppStep.TOOLS:
        return <ToolsHub initialTool={activeTool} />;
      case AppStep.FOUNDER:
        return <FounderPage />;
      default:
        return <Hero onStart={() => setStep(AppStep.UPLOAD)} />;
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
