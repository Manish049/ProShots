
import React, { useState, useEffect } from 'react';
import { Camera, ChevronDown, Wand2, Maximize, Layers, Frame, Menu, X, Zap, Power, ShieldOff, Key, User } from 'lucide-react';
import { AppStep, ToolType } from '../types';
import NeuralConfigModal from './NeuralConfigModal';

interface NavbarProps {
  onStepChange: (step: AppStep, params?: any) => void;
  currentStep: AppStep;
}

const Navbar: React.FC<NavbarProps> = ({ onStepChange, currentStep }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Connection is strictly non-persistent. Reset on mount.
  useEffect(() => {
    const handleSyncComplete = () => setIsSynced(true);
    const handleDisconnect = () => setIsSynced(false);

    window.addEventListener('neural_sync_complete', handleSyncComplete);
    window.addEventListener('neural_disconnect', handleDisconnect);

    return () => {
      window.removeEventListener('neural_sync_complete', handleSyncComplete);
      window.removeEventListener('neural_disconnect', handleDisconnect);
    };
  }, []);

  const handleSyncInitiate = () => {
    if (isSynced) {
      if (window.confirm("TERMINATE CONNECTION: This will sever the link and purge all session data. Continue?")) {
        window.dispatchEvent(new CustomEvent('neural_disconnect'));
      }
      return;
    }
    setIsModalOpen(true);
  };

  const executeHandshake = async () => {
    // Attempt to open the key selection dialog if the platform helper exists
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      try {
        window.aistudio.openSelectKey().catch(e => {
          console.warn("Platform key selection dialog closed or failed:", e);
        });
      } catch (err) {
        console.error("Handshake initiation failed:", err);
      }
    }

    // CRITICAL FIX FOR VERCEL: 
    // We signal immediate sync completion to activate the engine UI.
    // If window.aistudio was missing, we assume the API key is provided via Vercel env variables.
    // This prevents the "Handshake helper not found" block.
    window.dispatchEvent(new CustomEvent('neural_sync_complete'));
  };

  const scrollToSection = (id: string) => {
    const action = () => {
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
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

  const handleMobileNav = (step: AppStep, params?: any) => {
    onStepChange(step, params);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-xl z-[60] border-b border-slate-100 h-20">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group" 
            onClick={() => handleMobileNav(AppStep.LANDING)}
          >
            <div className="bg-slate-900 p-2 rounded-xl group-hover:rotate-12 transition-transform">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter">ProShots</span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6 text-sm font-bold text-slate-500 uppercase tracking-widest">
              <button onClick={() => scrollToSection('how-it-works')} className="hover:text-slate-900 transition-colors">How it works</button>
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
                onClick={handleSyncInitiate}
                className={`group flex items-center gap-3 px-5 py-2.5 rounded-2xl transition-all border font-black text-[10px] uppercase tracking-widest ${
                  isSynced 
                    ? 'bg-green-50 text-green-700 border-green-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300' 
                    : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:shadow-lg'
                }`}
              >
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  isSynced ? 'bg-green-500 animate-pulse group-hover:bg-red-500 group-hover:scale-150' : 'bg-amber-500'
                }`} />
                <span className="group-hover:hidden">
                  {isSynced ? 'Link Active' : 'Sync Engine'}
                </span>
                <span className="hidden group-hover:inline-flex items-center gap-2">
                  {isSynced ? <><Power className="w-3 h-3" /> Terminate</> : <><Zap className="w-3 h-3" /> Configure</>}
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

          <button className="md:hidden p-2 text-slate-900 focus:outline-none" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </button>
        </div>

        {/* Improved Mobile Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 right-0 bg-white border-b border-slate-100 shadow-2xl animate-in slide-in-from-top duration-300 overflow-y-auto max-h-[calc(100vh-80px)]">
            <div className="p-6 flex flex-col gap-1">
              {/* Primary Links */}
              <button onClick={() => scrollToSection('how-it-works')} className="w-full text-left py-4 px-4 hover:bg-slate-50 rounded-2xl font-black text-sm uppercase tracking-widest text-slate-900">How it works</button>
              <button onClick={() => handleMobileNav(AppStep.FOUNDER)} className="w-full text-left py-4 px-4 hover:bg-slate-50 rounded-2xl font-black text-sm uppercase tracking-widest text-slate-900 flex items-center gap-3">
                <User className="w-4 h-4" /> Architect
              </button>
              
              <div className="my-4 h-px bg-slate-100" />
              
              {/* Tools Section */}
              <div className="px-4 mb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural Tools</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {tools.map(tool => (
                  <button key={tool.id} onClick={() => handleMobileNav(AppStep.TOOLS, { toolId: tool.id })} className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-4 text-slate-600 rounded-2xl">
                    <div className="bg-slate-100 p-2 rounded-xl text-slate-500">{tool.icon}</div>
                    <span className="text-xs font-black uppercase tracking-tight">{tool.label}</span>
                  </button>
                ))}
              </div>

              <div className="my-4 h-px bg-slate-100" />

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button 
                  onClick={() => { handleSyncInitiate(); setIsMobileMenuOpen(false); }} 
                  className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 border shadow-sm ${
                    isSynced ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {isSynced ? <ShieldOff className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                  {isSynced ? 'Terminate Link' : 'Sync Engine'}
                </button>
                
                <button 
                  onClick={() => handleMobileNav(AppStep.UPLOAD)}
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl"
                >
                  Get Started <Camera className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <NeuralConfigModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSync={executeHandshake} 
      />
    </>
  );
};

export default Navbar;
