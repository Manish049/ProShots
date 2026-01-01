
import React, { useEffect, useState } from 'react';
import { CheckCircle2, ScanFace, Palette, Camera, Brain, User, Sparkles } from 'lucide-react';

interface ProcessingStatusProps {
  progress?: { current: number; total: number };
}

const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ progress }) => {
  const [step, setStep] = useState(0);
  const steps = [
    { icon: <Brain className="w-5 h-5" />, text: "Activating Deep Thinking engine for anatomical analysis..." },
    { icon: <ScanFace className="w-5 h-5" />, text: "Mapping facial symmetry and bone structure..." },
    { icon: <User className="w-5 h-5" />, text: "Analyzing body proportions and natural stance..." },
    { icon: <Palette className="w-5 h-5" />, text: "Sampling skin texture and lighting dynamics..." },
    { icon: <Sparkles className="w-5 h-5" />, text: "Synthesizing realistic depth and bokeh..." },
    { icon: <Camera className="w-5 h-5" />, text: "Capturing final studio-grade variations..." }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(prev => (prev + 1) % steps.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const progressPercent = progress ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
      <div className="relative mb-12">
        <div className="w-32 h-32 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <ScanFace className="w-12 h-12 text-slate-900 animate-pulse" />
            <div className="absolute -top-1 -right-1">
              <Sparkles className="w-5 h-5 text-amber-500 animate-bounce" />
            </div>
          </div>
        </div>
      </div>
      
      <h2 className="text-3xl font-bold mb-4 text-center">AI Masterpiece in Progress</h2>
      <p className="text-slate-500 mb-8 text-center max-w-md">
        Our advanced Gemini 3 Pro model is performing a deep anatomical analysis. 
        We are generating 25 high-quality variations across multiple styles.
      </p>

      {progress && (
        <div className="w-full max-w-sm mb-12 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
            <span>Generating Assets</span>
            <span>{progress.current} / {progress.total}</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-slate-900 transition-all duration-1000 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-center text-[10px] font-bold text-amber-600 uppercase tracking-tighter">
            Note: Generating 25 HD variations takes ~2-4 minutes to ensure quality.
          </p>
        </div>
      )}

      <div className="w-full max-w-sm space-y-4">
        {steps.map((s, i) => (
          <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-500 border ${
            i === step ? 'bg-white shadow-lg border-slate-100 scale-105' : 'opacity-40 border-transparent'
          }`}>
            <div className={`${i === step ? 'text-slate-900' : 'text-slate-400'}`}>
              {i < step ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : s.icon}
            </div>
            <span className={`text-sm font-medium ${i === step ? 'text-slate-900' : 'text-slate-400'}`}>
              {s.text}
            </span>
          </div>
        ))}
      </div>
      
      <div className="mt-12 flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest animate-pulse">
        <Brain className="w-4 h-4" />
        Rate Limit Protected • Deep Thinking
      </div>
    </div>
  );
};

export default ProcessingStatus;
