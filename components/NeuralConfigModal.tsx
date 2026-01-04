
import React from 'react';
import { X, Zap, ShieldCheck, Key, ExternalLink, Info, Lock } from 'lucide-react';

interface NeuralConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSync: () => void;
}

const NeuralConfigModal: React.FC<NeuralConfigModalProps> = ({ isOpen, onClose, onSync }) => {
  if (!isOpen) return null;

  const handleSyncInitiate = () => {
    // Fire the handshake logic
    onSync();
    // Proceed immediately to minimize UI friction (as per race condition guidelines)
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-slate-900 p-10 text-white relative text-center">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="bg-amber-500 w-16 h-16 rounded-3xl shadow-2xl shadow-amber-500/30 flex items-center justify-center mx-auto mb-6">
            <Zap className="w-8 h-8 text-slate-900 fill-slate-900" />
          </div>
          
          <h2 className="text-2xl font-black tracking-tight uppercase mb-2">Neural Engine Link</h2>
          <p className="text-xs font-bold text-amber-500 tracking-widest uppercase mb-4">Secure Handshake Required</p>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3 text-left">
            <Lock className="w-5 h-5 text-green-400 shrink-0" />
            <p className="text-[10px] font-medium text-slate-300 leading-relaxed">
              For your protection, API keys are managed securely via the platform. No manual entry is required on this interface.
            </p>
          </div>
        </div>

        <div className="p-10 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Info className="w-4 h-4" /> Before you sync
            </h3>
            <ul className="space-y-3">
              {[
                "The Gemini API must be enabled in your project.",
                "Free tier keys may have regional model restrictions.",
                "High-res generation is optimized for paid projects."
              ].map((text, i) => (
                <li key={i} className="flex gap-3 text-xs font-medium text-slate-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-200 mt-1.5 shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 space-y-4">
            <button 
              onClick={handleSyncInitiate}
              className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 active:scale-95 group"
            >
              <Key className="w-4 h-4 group-hover:rotate-12 transition-transform" /> 
              Establish Secure Link
            </button>
            
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full py-4 rounded-2xl border border-slate-100 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors text-slate-400 hover:text-slate-900"
            >
              Check Project Eligibility <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeuralConfigModal;
