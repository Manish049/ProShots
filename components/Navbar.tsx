
import React, { useState, useEffect } from 'react';
import { Camera, ChevronDown, Wand2, Maximize, Layers, Frame, Menu, X, Zap, Power } from 'lucide-react';
import { AppStep, ToolType } from '../types';

interface NavbarProps {
  onStepChange: (step: AppStep, params?: any) => void;
  currentStep: AppStep;
}

const Navbar: React.FC<NavbarProps> = ({ onStepChange, currentStep }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSynced, setIsSynced] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      const hasEnvKey = !!(process.env.API_KEY && process.env.API_KEY !== 'undefined');
      const hasPlatformKey = window.aistudio ? await window.aistudio.hasSelectedApiKey() : false;
      setIsSynced(hasEnvKey || hasPlatformKey);
    };
    checkStatus();
    const interval = setInterval(checkStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // Guidance: proceed immediately after triggering selector
      setIsSynced(true);
    } else {
      window.location.reload();
    }
  };

  const tools = [
    { id: ToolType.WATERMARK_REMOVER, label: 'Watermark Remover', icon: <Layers className="w-4 h-4" /> },
    { id: ToolType.UPSCALER, label: 'Photo Upscaler', icon: <Maximize className="w-4 h-4" /> },
    { id: ToolType.BG_REMOVER, label: 'Background Remover', icon: <Wand2 className="w-4 h-4" /> },
    { id: ToolType.RESIZER, label: 'Photo Resizing', icon: <Frame className="w-4 h-4" /> },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-xl z-[60] border-b border-slate-100 h-20">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onStepChange(AppStep.LANDING)}>
          <div className="bg-slate-900 p-2 rounded-xl"><Camera className="w-6 h-6 text-white" /></div>
          <span className="text-2xl font-black tracking-tighter">ProShots</span>
        </div>
        
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <button onClick={() => onStepChange(AppStep.FOUNDER)} className="hover:text-slate-900 transition-colors">Architect</button>
            <div className="relative group/tools">
              <button className="flex items-center gap-1 hover:text-slate-900 transition-colors">Tools <ChevronDown className="w-3 h-3" /></button>
              <div className="absolute top-full left-0 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 mt-2 opacity-0 invisible group-hover/tools:opacity-100 group-hover/tools:visible transition-all">
                {tools.map(tool => (
                  <button key={tool.id} onClick={() => onStepChange(AppStep.TOOLS, { toolId: tool.id })} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-[10px] font-black uppercase tracking-tighter">
                    {tool.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={handleSync}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
              isSynced ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
            }`}
          >
            <Zap className={`w-3 h-3 ${isSynced ? 'fill-green-700' : ''}`} />
            {isSynced ? 'Engine Online' : 'Sync Engine'}
          </button>
          
          <button onClick={() => onStepChange(AppStep.UPLOAD)} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-slate-200">
            Get Started
          </button>
        </div>

        <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
