import React, { useState, useRef } from 'react';
import { ToolType } from '../types';
import { Upload, Wand2, Maximize, Layers, Frame, X, Download, RefreshCw, AlertCircle, FileText, Printer, Monitor, Info, Sparkles, ShieldCheck, Zap, Clock, Key } from 'lucide-react';
import { processToolAction, QuotaExceededError, AuthError, SafetyError } from '../services/geminiService';

interface ToolPreset {
  id: string;
  label: string;
  width: number;
  height: number;
  unit: 'in' | 'mm' | 'px';
  description: string;
}

const RESIZE_CATEGORIES = {
  identification: {
    label: 'Official ID',
    icon: <FileText className="w-4 h-4" />,
    presets: [
      { id: 'us-passport', label: 'US Passport', width: 2, height: 2, unit: 'in', description: '51x51 mm standard' },
      { id: 'PAN', label: 'PAN Card (India)', width: 25, height: 35, unit: 'mm', description: '2.5 x 3.5 cm official' },
      { id: 'stamp-size', label: 'Stamp Size', width: 20, height: 25, unit: 'mm', description: 'Application forms' },
      { id: 'aadhaar', label: 'Aadhaar Card', width: 86, height: 54, unit: 'mm', description: 'India standard ID' },
    ] as ToolPreset[]
  },
  commercial: {
    label: 'Commercial Print',
    icon: <Printer className="w-4 h-4" />,
    presets: [
      { id: 'wallet', label: 'Wallet Size', width: 2.5, height: 3.5, unit: 'in', description: 'Pocket portrait' },
      { id: '4r', label: 'Standard (4R)', width: 4, height: 6, unit: 'in', description: 'Classic album size' },
      { id: '5r', label: 'Medium (5R)', width: 5, height: 7, unit: 'in', description: 'Desktop framing' },
      { id: '8r', label: 'Large (8R)', width: 8, height: 10, unit: 'in', description: 'Portfolio print' },
    ] as ToolPreset[]
  },
  digital: {
    label: 'Digital Output',
    icon: <Monitor className="w-4 h-4" />,
    presets: [
      { id: 'hd', label: 'HD (720p)', width: 1280, height: 720, unit: 'px', description: '720p 16:9 widescreen' },
      { id: 'fhd', label: 'Full HD (1080p)', width: 1920, height: 1080, unit: 'px', description: '1080p high fidelity' },
      { id: '4k', label: 'Ultra HD (4K)', width: 3840, height: 2160, unit: 'px', description: '2160p premium resolution' },
      { id: 'insta', label: 'Insta Square', width: 1080, height: 1080, unit: 'px', description: 'Social media 1:1 format' },
    ] as ToolPreset[]
  }
} as const;

const ToolsHub: React.FC<{ initialTool?: ToolType }> = ({ initialTool = ToolType.BG_REMOVER }) => {
  const [activeTool, setActiveTool] = useState<ToolType>(initialTool);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toolError, setToolError] = useState<{title: string, msg: string, action?: string} | null>(null);
  
  const [resizerCategory, setResizerCategory] = useState<keyof typeof RESIZE_CATEGORIES>('identification');
  const [selectedPreset, setSelectedPreset] = useState<ToolPreset | null>(RESIZE_CATEGORIES.identification.presets[0]);
  const [isCustom, setIsCustom] = useState(false);
  const [customDims, setCustomDims] = useState({ width: 1000, height: 1000, unit: 'px' as 'px' | 'in' | 'mm' });
  const [deepScan, setDeepScan] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const tools = [
    { id: ToolType.BG_REMOVER, label: 'Background Remover', icon: <Wand2 className="w-5 h-5" />, desc: 'One-click isolation.' },
    { id: ToolType.UPSCALER, label: 'Photo Upscaler', icon: <Maximize className="w-5 h-5" />, desc: 'Neural 4x enhancement.' },
    { id: ToolType.WATERMARK_REMOVER, label: 'Restoration Lab', icon: <Layers className="w-5 h-5" />, desc: 'Deep neural inpainting.' },
    { id: ToolType.RESIZER, label: 'Photo Resizing', icon: <Frame className="w-5 h-5" />, desc: 'Passport & print sizes.' },
  ];

  const handleProcess = async () => {
    if (!sourceImage) return;
    setIsProcessing(true);
    setResultImage(null);
    setToolError(null);
    try {
      let params = {};
      if (activeTool === ToolType.RESIZER) {
        params = isCustom ? { label: 'Custom', ...customDims } : { label: selectedPreset?.label, ...selectedPreset };
      } else if (activeTool === ToolType.WATERMARK_REMOVER) {
        params = { deepMode: deepScan };
      }
      const res = await processToolAction(sourceImage, activeTool, params);
      setResultImage(res);
    } catch (err: any) { 
      console.error("AI Tool Error:", err); 
      if (err instanceof AuthError) {
        setToolError({ title: "Auth Failed", msg: "Invalid or restricted API Key. Select a valid key from a paid project.", action: 'select_key' });
      } else if (err instanceof SafetyError) {
        setToolError({ title: "Safety Block", msg: "The AI engine blocked this operation due to safety/copyright filters." });
      } else if (err instanceof QuotaExceededError) {
        setToolError({ title: "Quota Exhausted", msg: "Too many requests. Please wait 60 seconds." });
      } else {
        setToolError({ title: "Neural Failure", msg: "The engine encountered an error. Please try a smaller or clearer image." });
      }
    } finally { 
      setIsProcessing(false); 
    }
  };

  const handleToolAction = async () => {
    if (toolError?.action === 'select_key' && window.aistudio) {
      await window.aistudio.openSelectKey();
      setToolError(null);
    }
  };

  const getProcessingMessage = () => {
    switch(activeTool) {
      case ToolType.WATERMARK_REMOVER: return { title: "Neural Reconstruction", sub: "Synthesizing obscured pixels..." };
      case ToolType.UPSCALER: return { title: "Super-Resolution", sub: "Enhancing micro-details..." };
      case ToolType.BG_REMOVER: return { title: "Subject Isolation", sub: "Mapping edge boundaries..." };
      case ToolType.RESIZER: return { title: "Geometric Reframe", sub: "Calculating aspect ratios..." };
      default: return { title: "AI Processing", sub: "Connecting to Neural Engine..." };
    }
  };

  const msg = getProcessingMessage();

  return (
    <div className="max-w-7xl mx-auto px-6 py-32 flex flex-col lg:flex-row gap-12">
      <div className="w-full lg:w-72 shrink-0 space-y-3">
        <div className="px-4 mb-6">
          <h2 className="text-2xl font-black tracking-tight uppercase">AI Tools</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Powered by ProShots</p>
        </div>
        {tools.map(t => (
          <button
            key={t.id}
            onClick={() => { setActiveTool(t.id); setSourceImage(null); setResultImage(null); setToolError(null); }}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all ${activeTool === t.id ? 'bg-slate-900 text-white shadow-xl scale-[1.02]' : 'hover:bg-slate-50 text-slate-500'}`}
          >
            <div className={`p-2 rounded-xl ${activeTool === t.id ? 'bg-white/10' : 'bg-slate-100'}`}>
              {t.icon}
            </div>
            <div>
              <div className="font-bold text-sm">{t.label}</div>
              <div className={`text-[10px] ${activeTool === t.id ? 'text-white/60' : 'text-slate-400'} font-medium`}>{t.desc}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="flex-1 bg-slate-50/50 rounded-[40px] border border-slate-100 p-6 md:p-12 relative flex flex-col min-h-[600px]">
        {!sourceImage ? (
          <div 
            className="flex-1 border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center bg-white group cursor-pointer hover:border-slate-400 transition-all" 
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="bg-slate-50 p-6 rounded-3xl mb-4 group-hover:scale-110 transition-transform">
              <Upload className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold">Select Photo</h3>
            <p className="text-slate-400 text-sm mt-2">Supports high-res JPEG, PNG.</p>
            <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) { const r = new FileReader(); r.onload = (x) => setSourceImage(x.target?.result as string); r.readAsDataURL(f); }
            }} />
          </div>
        ) : (
          <div className="flex-1 flex flex-col space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-slate-900 text-white p-2 rounded-xl">{tools.find(t => t.id === activeTool)?.icon}</div>
                <h3 className="text-lg font-bold">{tools.find(t => t.id === activeTool)?.label}</h3>
              </div>
              <button onClick={() => {setSourceImage(null); setResultImage(null); setToolError(null);}} className="p-2 hover:bg-slate-200 rounded-full"><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
              <div className="aspect-square bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm relative">
                <img src={sourceImage} className="w-full h-full object-contain p-4" alt="Input" />
                <div className="absolute top-4 left-4 bg-slate-900/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-600">SOURCE</div>
              </div>
              <div className="aspect-square bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm flex items-center justify-center relative">
                {resultImage ? (
                  <img src={resultImage} className="w-full h-full object-contain p-4 animate-in zoom-in" alt="Output" />
                ) : isProcessing ? (
                  <div className="text-center p-8 animate-in fade-in zoom-in">
                    <RefreshCw className="w-12 h-12 mx-auto mb-6 animate-spin text-slate-900" />
                    <p className="font-bold text-slate-900">{msg.title}</p>
                    <p className="text-xs text-slate-400 mt-2">{msg.sub}</p>
                  </div>
                ) : toolError ? (
                  <div className="text-center p-8 flex flex-col items-center">
                    <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                    <p className="text-sm font-bold text-slate-900 mb-2">{toolError.title}</p>
                    <p className="text-xs text-slate-400 mb-6">{toolError.msg}</p>
                    {toolError.action === 'select_key' && (
                      <button onClick={handleToolAction} className="bg-slate-900 text-white px-6 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                        <Key className="w-3 h-3" /> Select Key
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-center opacity-30"><Zap className="w-10 h-10 mx-auto mb-3 text-slate-200" /><p className="text-xs font-bold uppercase tracking-widest">Awaiting Command</p></div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {activeTool === ToolType.RESIZER && (
                <div className="p-6 bg-white rounded-[32px] border border-slate-100 space-y-6">
                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {Object.entries(RESIZE_CATEGORIES).map(([key, cat]) => (
                      <button key={key} onClick={() => { setResizerCategory(key as any); setIsCustom(false); setSelectedPreset(RESIZE_CATEGORIES[key as keyof typeof RESIZE_CATEGORIES].presets[0]); }}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${resizerCategory === key && !isCustom ? 'bg-slate-900 text-white shadow-xl' : 'bg-slate-50 text-slate-500'}`}
                      >
                        {cat.label}
                      </button>
                    ))}
                    <button onClick={() => setIsCustom(true)} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${isCustom ? 'bg-slate-900 text-white shadow-xl' : 'bg-slate-50 text-slate-500'}`}>Custom</button>
                  </div>

                  {!isCustom && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {RESIZE_CATEGORIES[resizerCategory].presets.map(preset => (
                        <button
                          key={preset.id}
                          onClick={() => setSelectedPreset(preset)}
                          className={`p-4 rounded-2xl border text-left transition-all group ${selectedPreset?.id === preset.id ? 'border-slate-900 bg-slate-50' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                        >
                          <div className={`font-black text-xs uppercase tracking-tight ${selectedPreset?.id === preset.id ? 'text-slate-900' : 'text-slate-600'}`}>{preset.label}</div>
                          <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{preset.width}x{preset.height}{preset.unit} • {preset.description}</div>
                        </button>
                      ))}
                    </div>
                  )}

                  {isCustom && (
                    <div className="grid grid-cols-3 gap-4 p-2">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Width</label>
                        <input 
                          type="number" 
                          value={customDims.width}
                          onChange={(e) => setCustomDims({...customDims, width: Number(e.target.value)})}
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-slate-900" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Height</label>
                        <input 
                          type="number" 
                          value={customDims.height}
                          onChange={(e) => setCustomDims({...customDims, height: Number(e.target.value)})}
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-slate-900" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Unit</label>
                        <select 
                          value={customDims.unit}
                          onChange={(e) => setCustomDims({...customDims, unit: e.target.value as any})}
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                        >
                          <option value="px">Pixels (px)</option>
                          <option value="in">Inches (in)</option>
                          <option value="mm">Millimeters (mm)</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-4">
                <button 
                  onClick={handleProcess} 
                  disabled={isProcessing} 
                  className="flex-1 bg-slate-900 text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-95 disabled:opacity-50"
                >
                  {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />} Run AI Lab
                </button>
                {resultImage && (
                  <button onClick={() => { const a = document.createElement('a'); a.href = resultImage; a.download=`ProShots-lab.png`; a.click(); }} className="px-8 bg-white border-2 border-slate-900 rounded-[2rem] shadow-lg"><Download className="w-6 h-6" /></button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolsHub;