
import React, { useState, useEffect, useRef } from 'react';
import { X, Key, Zap, ShieldCheck, Cpu, ExternalLink, Sparkles, CheckCircle2, AlertCircle, Eye, EyeOff, Copy, Info, HelpCircle, Save } from 'lucide-react';

interface NeuralConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSync: (key: string) => void;
  isSynced: boolean;
}

const NeuralConfigModal: React.FC<NeuralConfigModalProps> = ({ isOpen, onClose, onSync, isSynced }) => {
  const [inputValue, setInputValue] = useState(localStorage.getItem('proshots_manual_key') || '');
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Gemini API keys usually start with AIza and are ~39 chars
  const validateKey = (key: string) => {
    const pattern = /^AIza[0-9A-Za-z-_]{35}$/;
    const valid = pattern.test(key.trim());
    setIsValid(valid);
    if (key.length > 5 && !valid) {
      setErrorMessage("Invalid API Key format. Key should start with 'AIza'.");
    } else {
      setErrorMessage(null);
    }
    return valid;
  };

  useEffect(() => {
    if (inputValue) validateKey(inputValue);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    validateKey(val);
  };

  const handleConfigure = () => {
    if (!isValid) return;
    
    setIsInitializing(true);
    // Simulate connection check
    setTimeout(() => {
      localStorage.setItem('proshots_manual_key', inputValue);
      onSync(inputValue);
      setIsInitializing(false);
      // Brief success state before close handled by parent
    }, 1200);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inputValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
      role="dialog"
      aria-labelledby="modal-title"
      aria-modal="true"
    >
      <div 
        className="bg-white w-full max-w-xl rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] border border-slate-100 overflow-hidden relative animate-in zoom-in slide-in-from-bottom-8 duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section */}
        <div className="bg-slate-950 px-10 py-8 flex items-center justify-between text-white border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl transition-all duration-500 ${isSynced ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white'}`}>
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h2 id="modal-title" className="text-xl font-black tracking-tight uppercase">Neural Console</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${isSynced ? 'bg-green-400 animate-pulse' : 'bg-slate-600'}`} />
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  {isSynced ? 'Connection Status: ACTIVE' : 'Connection Status: IDLE'}
                </p>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-white"
            aria-label="Close configuration"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-10 space-y-8">
          {/* Main Input Field */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <label htmlFor="api-key-input" className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Enter Your API Key:
              </label>
              <div className="flex items-center gap-1.5">
                {isValid ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 uppercase tracking-widest animate-in fade-in zoom-in">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Valid Format
                  </span>
                ) : inputValue.length > 0 ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 uppercase tracking-widest animate-in shake duration-300">
                    <AlertCircle className="w-3.5 h-3.5" /> Invalid Format
                  </span>
                ) : null}
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Zap className={`w-5 h-5 transition-colors duration-500 ${isValid ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} />
              </div>
              
              <input
                id="api-key-input"
                type={showKey ? "text" : "password"}
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Your API Key here..."
                aria-label="Enter Gemini API Key"
                className={`w-full bg-slate-50 border-2 rounded-2xl p-4 pl-14 pr-32 font-mono text-sm outline-none transition-all h-16 ${
                  isValid 
                    ? 'border-green-100 focus:border-green-400 focus:ring-4 focus:ring-green-500/5' 
                    : 'border-slate-100 focus:border-slate-900'
                }`}
              />
              
              <div className="absolute inset-y-0 right-3 flex items-center gap-1">
                <button 
                  onClick={() => setShowKey(!showKey)}
                  className="p-2.5 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-slate-900 hover:shadow-sm"
                  title={showKey ? "Hide Key" : "Show Key"}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button 
                  onClick={handleCopy}
                  disabled={!inputValue}
                  className="p-2.5 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-slate-900 hover:shadow-sm disabled:opacity-30"
                  title="Copy Key"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            {errorMessage && (
              <div className="flex items-center gap-2 px-1 text-[10px] font-bold text-red-500 uppercase tracking-widest animate-in slide-in-from-top-2">
                <AlertCircle className="w-3 h-3" />
                {errorMessage}
              </div>
            )}

            <div className="flex items-center justify-between px-1">
               <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                Need help? <a href="https://ai.google.dev/gemini-api/docs" target="_blank" rel="noopener noreferrer" className="text-slate-900 font-bold hover:underline">Troubleshooting</a>
              </p>
              <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                <ShieldCheck className="w-3 h-3" /> Encrypted Session
              </div>
            </div>
          </div>

          {/* Configuration Actions */}
          <div className="space-y-4 pt-4">
            <button 
              onClick={handleConfigure}
              disabled={!isValid || isInitializing}
              className={`w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95 ${
                isValid 
                  ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              {isInitializing ? (
                <div className="flex items-center gap-2">
                   <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Establishing Link...
                </div>
              ) : (
                <>
                  <Sparkles className={`w-5 h-5 ${isValid ? 'animate-pulse' : ''}`} />
                  Configure Connection
                </>
              )}
            </button>
            
            <p className="text-[9px] text-center text-slate-300 font-black uppercase tracking-[0.2em]">
              Neural Link required for High-Fidelity Character Synthesis
            </p>
          </div>
        </div>

        <div className="bg-slate-50 px-10 py-6 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
              Biometric privacy lock: ACTIVE
            </p>
          </div>
          {isSynced && (
             <button 
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2"
            >
              <Save className="w-3 h-3" /> Save & Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NeuralConfigModal;
