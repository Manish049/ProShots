
import React, { useState } from 'react';
import { X, Zap, Cpu, ShieldCheck } from 'lucide-react';

interface NeuralConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSync: () => void;
}

const NeuralConfigModal: React.FC<NeuralConfigModalProps> = ({ isOpen, onClose, onSync }) => {
  const [configCode, setConfigCode] = useState("");

  if (!isOpen) return null;

  const handleSync = () => {
    // 1. Initiate the handshake (opens the system dialog)
    onSync();
    
    // 2. Immediately close the modal to allow the system dialog to take focus
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-slate-900 p-8 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-amber-500 p-3 rounded-2xl">
              <Zap className="w-6 h-6 text-slate-900 fill-slate-900" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight uppercase">Neural Config</h2>
              <p className="text-xs font-bold text-amber-500 tracking-widest uppercase">Engine v3.1 Protocol</p>
            </div>
          </div>
        </div>

        <div className="p-10 space-y-8">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">
              Neural Sync Configuration ID
            </label>
            <div className="relative">
              <input 
                type="text"
                value={configCode}
                onChange={(e) => setConfigCode(e.target.value)}
                placeholder="Enter unique handshake code..."
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold outline-none focus:ring-2 focus:ring-slate-900 transition-all font-mono"
              />
              <Cpu className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
            </div>
            <p className="text-[10px] text-slate-400 font-medium px-1">
              Establishing a link requires a unique session identifier from your neural project dashboard.
            </p>
          </div>

          <div className="pt-4">
            <button 
              onClick={handleSync}
              className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 active:scale-95"
            >
              <ShieldCheck className="w-4 h-4" /> Neural Sync Configuration
            </button>
            <p className="text-center mt-6 text-[10px] font-black text-slate-300 uppercase tracking-tighter">
              Session-bound • Encrypted Handshake • Paid Projects Only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeuralConfigModal;
