
import React, { useState } from 'react';
import { X, Zap, Cpu, ShieldCheck, Eye, EyeOff, AlertCircle, ExternalLink } from 'lucide-react';

interface NeuralConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSync: () => void;
}

const NeuralConfigModal: React.FC<NeuralConfigModalProps> = ({ isOpen, onClose, onSync }) => {
  const [configCode, setConfigCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const validateCode = (code: string) => {
    if (!code) return "Configuration ID is required.";
    if (code.length < 20) return "Configuration ID must be at least 20 characters.";
    return null;
  };

  const handleSync = () => {
    const validationError = validateCode(configCode);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setError(null);
    // 1. Initiate the handshake (opens the system dialog if platform is present)
    onSync();
    
    // 2. Immediately close the modal to allow the system dialog to take focus
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-slate-900 p-8 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-amber-500 p-3 rounded-2xl shadow-lg shadow-amber-500/20">
              <Zap className="w-6 h-6 text-slate-900 fill-slate-900" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight uppercase">Neural Handshake</h2>
              <p className="text-xs font-bold text-amber-500 tracking-widest uppercase">Engine Protocol v3.1</p>
            </div>
          </div>
        </div>

        <div className="p-10 space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Neural Configuration ID
              </label>
              {error && (
                <span className="text-[10px] font-bold text-red-500 uppercase flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {error}
                </span>
              )}
            </div>
            
            <div className="relative group">
              <input 
                type={showCode ? "text" : "password"}
                value={configCode}
                onChange={(e) => {
                  setConfigCode(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter handshake protocol ID..."
                className={`w-full bg-slate-50 border ${error ? 'border-red-200' : 'border-slate-100'} rounded-2xl p-5 pr-14 text-sm font-bold outline-none focus:ring-2 focus:ring-slate-900 transition-all font-mono`}
              />
              <button 
                type="button"
                onClick={() => setShowCode(!showCode)}
                className="absolute right-5 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-900 transition-colors rounded-xl hover:bg-slate-100"
              >
                {showCode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wide leading-relaxed">
                Important: Establishing a link requires a valid API key from a paid GCP project. 
                <a 
                  href="https://ai.google.dev/gemini-api/docs/billing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 ml-1 text-blue-700 underline decoration-blue-300 hover:decoration-blue-700 transition-all"
                >
                  View Billing Documentation <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button 
              onClick={handleSync}
              className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 active:scale-95 group"
            >
              <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform" /> 
              Authorize Neural Sync
            </button>
            <div className="flex items-center justify-center gap-6 mt-8">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">Session-bound</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-slate-200" />
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">AES-256 Link</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-slate-200" />
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">Paid Project Only</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeuralConfigModal;
