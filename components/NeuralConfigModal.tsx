
import React, { useState } from 'react';
import { X, Zap, ShieldCheck, Key, ExternalLink, Lock } from 'lucide-react';

interface NeuralConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSync: (key: string) => void;
}

const NeuralConfigModal: React.FC<NeuralConfigModalProps> = ({ isOpen, onClose, onSync }) => {
  const [inputKey, setInputKey] = useState('');

  if (!isOpen) return null;

  const handleConnect = () => {
    if (inputKey.trim()) {
      onSync(inputKey.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md animate-in fade-in" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200 border border-slate-200">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div className="bg-slate-900 p-3 rounded-2xl shadow-lg shadow-slate-200">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors group">
              <X className="w-5 h-5 text-slate-400 group-hover:text-slate-900" />
            </button>
          </div>

          <h2 className="text-3xl font-black tracking-tight mb-3">Establish Neural Sync</h2>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">
            Connect your secure Gemini API key to activate the ProShots high-precision image processing engine and anatomical analysis.
          </p>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  Neural Access Key
                </label>
                <div className="flex items-center gap-1 text-[10px] font-black uppercase text-green-600 tracking-widest bg-green-50 px-2 py-0.5 rounded-full">
                  <Lock className="w-2.5 h-2.5" /> End-to-End Secure
                </div>
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Key className="w-4 h-4 text-slate-400" />
                </div>
                <input 
                  type="password"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-5 pl-12 pr-4 text-sm font-bold outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            <div className="bg-slate-900 text-white rounded-3xl p-6 space-y-4">
              <div className="flex gap-4 items-start">
                <div className="bg-white/10 p-2 rounded-xl">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest mb-1 text-slate-100">API Key Safety</p>
                  <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                    Your key is stored locally in your browser's encrypted storage. It is never transmitted to our servers—all AI requests are made directly from your browser to the Google Neural API.
                  </p>
                </div>
              </div>
            </div>

            <button 
              onClick={handleConnect}
              disabled={!inputKey.trim() || inputKey.length < 10}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-slate-300 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <Zap className="w-5 h-5 group-hover:fill-white transition-all" />
              Activate Neural Sync
            </button>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors"
              >
                Request Access Key <ExternalLink className="w-3 h-3" />
              </a>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">v1.2.0-STABLE</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeuralConfigModal;
