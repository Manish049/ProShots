
import React, { useState, useEffect } from 'react';
import { Camera, ChevronDown, Wand2, Maximize, Layers, Frame, Menu, X, Key, ExternalLink } from 'lucide-react';
import { AppStep, ToolType } from '../types';

// Fix: Define AIStudio interface to match the environment's expected type for window.aistudio
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}

interface NavbarProps {
  onStepChange: (step: AppStep, params?: any) => void;
  currentStep: AppStep;
}

const Navbar: React.FC<NavbarProps> = ({ onStepChange, currentStep }) => {
  const [showTools, setShowTools] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        try {
          const selected = await window.aistudio.hasSelectedApiKey();
          setHasKey(selected);
        } catch (e) {
          console.debug('Aistudio bridge check failed', e);
        }
      }
    };
    checkKey();
    const interval = setInterval(checkKey, 3000);
    return () => clearInterval(interval);
  }, []);

  const tools = [
    { id: ToolType.WATERMARK_REMOVER, label: 'Watermark Remover', icon: <Layers className="w-4 h-4" /> },
    { id: ToolType.UPSCALER, label: 'Photo Upscaler', icon: <Maximize className="w-4 h-4" /> },
    { id: ToolType.BG_REMOVER, label: 'Background Remover', icon: <Wand2 className="w-4 h-4" /> },
    { id: ToolType.RESIZER, label: 'Photo Resizing', icon: <Frame className="w-4 h-4" /> },
  ];

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    if (currentStep !== AppStep.LANDING) {
      onStepChange(AppStep.LANDING, { targetId: id });
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleToolClick = (toolId: ToolType) => {
    onStepChange(AppStep.TOOLS, { toolId });
    setShowTools(false);
    setIsMobileMenuOpen(false);
  };

  const handleKeySelect = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        // Mandatory: Assume success to mitigate race condition
        setHasKey(true);
      } catch (e) {
        console.error('Failed to open key selector', e);
      }
    } else {
      // If bridge is missing on Vercel, the user should set it in the Vercel dashboard
      // but we link them to billing docs for context.
      window.open('https://ai.google.dev/gemini-api/docs/billing', '_blank');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => onStepChange(AppStep.LANDING)}
        >
          <div className="bg-slate-900 p-2 rounded-lg">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">ProShots</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#how-it-works" onClick={(e) => handleAnchorClick(e, 'how-it-works')} className="hover:text-slate-900 transition-colors">How it Works</a>
          
          <div className="relative">
            <button 
              onMouseEnter={() => setShowTools(true)}
              onMouseLeave={() => setShowTools(false)}
              className="flex items-center gap-1 hover:text-slate-900 transition-colors py-2"
            >
              Tools <ChevronDown className={`w-4 h-4 transition-transform ${showTools ? 'rotate-180' : ''}`} />
            </button>
            {showTools && (
              <div 
                onMouseEnter={() => setShowTools(true)}
                onMouseLeave={() => setShowTools(false)}
                className="absolute top-full left-0 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 mt-0"
              >
                {tools.map(tool => (
                  <button key={tool.id} onClick={() => handleToolClick(tool.id)} className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 text-slate-600 hover:text-slate-900 transition-all">
                    <div className="bg-slate-100 p-1.5 rounded-lg text-slate-500">{tool.icon}</div>
                    <span>{tool.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => onStepChange(AppStep.FOUNDER)} className={`hover:text-slate-900 transition-colors ${currentStep === AppStep.FOUNDER ? 'text-slate-900 font-bold underline underline-offset-4' : ''}`}>Architect</button>

          <div className="h-4 w-px bg-slate-200" />

          <div className="flex items-center gap-4">
            <button 
              onClick={handleKeySelect}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all border ${hasKey ? 'bg-green-50 text-green-700 border-green-100' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
              title={hasKey ? 'API Key Active' : 'Selection required for high-fidelity models'}
            >
              <Key className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">{hasKey ? 'Key Active' : 'Select API Key'}</span>
            </button>
            
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
              title="Billing Documentation"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          
          <button onClick={() => onStepChange(AppStep.UPLOAD)} className="bg-slate-900 text-white px-6 py-2.5 rounded-full hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-100">Get Started</button>
        </div>

        <button className="md:hidden p-2 text-slate-600 hover:text-slate-900 transition-colors" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-white border-b border-slate-100 shadow-xl p-6 flex flex-col gap-6">
          <a href="#how-it-works" onClick={(e) => handleAnchorClick(e, 'how-it-works')} className="text-lg font-bold text-slate-900">How it Works</a>
          <button onClick={() => { onStepChange(AppStep.FOUNDER); setIsMobileMenuOpen(false); }} className="text-lg font-bold text-slate-900 text-left">Architect</button>
          
          <div className="space-y-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Tools</span>
            <div className="grid grid-cols-2 gap-2">
              {tools.map(tool => (
                <button key={tool.id} onClick={() => handleToolClick(tool.id)} className="w-full text-left px-4 py-3 bg-slate-50 rounded-xl flex items-center gap-3 text-slate-600">
                  {tool.icon} <span className="font-bold text-xs">{tool.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-50">
             <button onClick={handleKeySelect} className="w-full bg-slate-50 text-slate-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 mb-2">
                <Key className="w-4 h-4" /> {hasKey ? 'Change API Key' : 'Select API Key'}
             </button>
          </div>

          <button onClick={() => { onStepChange(AppStep.UPLOAD); setIsMobileMenuOpen(false); }} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-lg">Get Started</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
