
import React, { useState, useEffect } from 'react';
import { Camera, ChevronDown, Wand2, Maximize, Layers, Frame, Menu, X, Zap, Power, ShieldOff, Key } from 'lucide-react';
import { AppStep, ToolType } from '../types';

interface NavbarProps {
  onStepChange: (step: AppStep, params?: any) => void;
  currentStep: AppStep;
}

const Navbar: React.FC<NavbarProps> = ({ onStepChange, currentStep }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSynced, setIsSynced] = useState(false);

  // Sync state management: On rebuild/refresh, connection is removed by default
  useEffect(() => {
    // We only check sessionStorage to see if the user activated it in THIS session
    const checkSessionSync = () => {
      const isActive = sessionStorage.getItem('neural_session_active') === 'true';
      setIsSynced(isActive);
    };

    checkSessionSync();

    const handleSyncComplete = () => {
      sessionStorage.setItem('neural_session_active', 'true');
      setIsSynced(true);
    };

    const handleDisconnect = () => {
      sessionStorage.removeItem('neural_session_active');
      setIsSynced(false);
    };

    window.addEventListener('neural_sync_complete', handleSyncComplete);
    window.addEventListener('neural_disconnect', handleDisconnect);

    return () => {
      window.removeEventListener('neural_sync_complete', handleSyncComplete);
      window.removeEventListener('neural_disconnect', handleDisconnect);
    };
  }, []);

  const handleSyncClick = async () => {
    if (isSynced) {
      // Termination Protocol: Remove API Key from app configuration context
      const confirmed = window.confirm("TERMINATE CONNECTION: This will sever the neural link and purge all active session data. Proceed?");
      if (confirmed) {
        window.dispatchEvent(new CustomEvent('neural_disconnect', { 
          detail: { message: "Neural Link Terminated" } 
        }));
      }
      return;
    }

    if (window.aistudio) {
      try {
        // Mandatory Platform Key Selection
        await window.aistudio.openSelectKey();
        
        // After user selects the key, we assume success and activate the session
        window.dispatchEvent(new CustomEvent('neural_sync_complete', { 
          detail: { message: "Neural Engine Activated" } 
        }));
      } catch (err) {
        console.error("Neural sync failed:", err);
      }
    }
  };

  const scrollToSection = (id: string) => {
    const action = () => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    };

    if (currentStep !== AppStep.LANDING) {
      onStepChange(AppStep.LANDING, { targetId: id });
      setTimeout(action, 100);
    } else {
      action();
    }
    setIsMobileMenuOpen(false);
  };

  const tools = [
    { id: ToolType.WATERMARK_REMOVER, label: 'Watermark Remover', icon: <Layers className="w-4 h-4" /> },
    { id: ToolType.UPSCALER, label: 'Photo Upscaler', icon: <Maximize className="w-4 h-4" /> },
    { id: ToolType.BG_REMOVER, label: 'Background Remover', icon: <Wand2 className="w-4 h-4" /> },
    { id: ToolType.RESIZER, label: 'Photo Resizing', icon: <Frame className="w-4 h-4" /> },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-xl z-50 border-b border-slate-100 h-20" role="navigation">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer group" 
          onClick={() => onStepChange(AppStep.LANDING)}
          aria-label="ProShots Home"
        >
          <div className="bg-slate-900 p-2 rounded-xl group-hover:rotate-12 transition-transform">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter">ProShots</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-6 text-sm font-bold text-slate-500 uppercase tracking-widest">
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-slate-900 transition-colors">How it works</button>
            <button onClick={() => scrollToSection('success-stories')} className="hover:text-slate-900 transition-colors">Success Stories</button>
            <div className="relative group/tools">
              <button className="flex items-center gap-1 hover:text-slate-900 transition-colors py-2">
                Tools <ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute top-full left-0 w-64 bg-white border border-slate-100 rounded-[2rem] shadow-2xl py-3 mt-0 opacity-0 invisible group-hover/tools:opacity-100 group-hover/tools:visible transition-all translate-y-2 group-hover/tools:translate-y-0">
                {tools.map(tool => (
                  <button key={tool.id} onClick={() => onStepChange(AppStep.TOOLS, { toolId: tool.id })} className="w-full text-left px-6 py-3 hover:bg-slate-50 flex items-center gap-4 text-slate-600 hover:text-slate-900">
                    <div className="bg-slate-100 p-2 rounded-xl text-slate-500">{tool.icon}</div>
                    <span className="text-xs font-black">{tool.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => onStepChange(AppStep.FOUNDER)} className="hover:text-slate-900 transition-colors">Architect</button>
          </div>

          <div className="h-6 w-px bg-slate-100 mx-2" />

          <div className="flex items-center gap-4">
            <button 
              onClick={handleSyncClick}
              aria-label={isSynced ? "Disconnect Neural Engine" : "Sync Neural Engine"}
              className={`group flex items-center gap-3 px-5 py-2.5 rounded-2xl transition-all border font-black text-[10px] uppercase tracking-widest ${
                isSynced 
                  ? 'bg-green-50 text-green-700 border-green-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300' 
                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:shadow-lg'
              }`}
            >
              <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                isSynced 
                  ? 'bg-green-500 animate-pulse group-hover:bg-red-500 group-hover:scale-150' 
                  : 'bg-amber-500'
              }`} />
              <span className="group-hover:hidden flex items-center gap-2">
                {isSynced ? 'Link Active' : <><Zap className="w-3 h-3" /> Sync Engine</>}
              </span>
              <span className="hidden group-hover:inline-flex items-center gap-2 animate-in fade-in duration-200">
                {isSynced ? <><Power className="w-3 h-3" /> Terminate</> : <><Zap className="w-3 h-3" /> Configure Engine</>}
              </span>
            </button>
            
            <button 
              onClick={() => onStepChange(AppStep.UPLOAD)}
              className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
            >
              Get Started
            </button>
          </div>
        </div>

        <button className="md:hidden p-2 text-slate-900" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-white border-b border-slate-100 p-6 flex flex-col gap-6 shadow-2xl animate-in slide-in-from-top duration-300">
          <button onClick={() => { scrollToSection('how-it-works'); setIsMobileMenuOpen(false); }} className="text-left py-2 font-black text-xs uppercase tracking-widest text-slate-500">How it works</button>
          <button onClick={() => { handleSyncClick(); setIsMobileMenuOpen(false); }} className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 border ${
            isSynced ? 'bg-red-50 text-red-700 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100'
          }`}>
            {isSynced ? <ShieldOff className="w-4 h-4" /> : <Key className="w-4 h-4" />}
            {isSynced ? 'Terminate Connection' : 'Sync Engine'}
          </button>
          <button onClick={() => { onStepChange(AppStep.UPLOAD); setIsMobileMenuOpen(false); }} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest">Start Creating</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
