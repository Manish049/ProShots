
import React from 'react';
import { X, Zap, Key, ExternalLink, ShieldCheck } from 'lucide-react';

interface NeuralConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSync: () => void;
}

const NeuralConfigModal: React.FC<NeuralConfigModalProps> = ({ isOpen, onClose, onSync }) => {
  if (!isOpen) return null;

  const handleEstablishLink = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // Guidance: Assume key selection was successful after triggering openSelectKey()
      onSync();
      onClose();
    } else {
      alert("Platform key selection is only available within the AI Studio environment. For production, please ensure API_KEY is set in your environment variables.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="p-8 text-center">
          <div className="bg-slate-900 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-black mb-2">Connect Engine</h2>
          <p className="text-slate-500 text-sm mb-8">Establish a secure link with Gemini 3 Pro to begin processing your images.</p>
          
          <button 
            onClick={handleEstablishLink}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl flex items-center justify-center gap-3"
          >
            <Key className="w-4 h-4" /> Open Key Selector
          </button>
          
          <div className="mt-6 flex flex-col gap-3">
            <a 
              href="https://ai.google.dev/gemini-api/docs/api-key" 
              target="_blank" 
              className="text-[10px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest flex items-center justify-center gap-1"
            >
              Get API Key <ExternalLink className="w-3 h-3" />
            </a>
            <button onClick={onClose} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeuralConfigModal;
