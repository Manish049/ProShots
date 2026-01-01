
import React, { useState, useRef } from 'react';
import { ToolType } from '../types';
import { Upload, Wand2, Maximize, Layers, Frame, X, Download, RefreshCw, AlertCircle, FileText, Printer, Monitor, Info, Sparkles, ShieldCheck, Zap, Clock } from 'lucide-react';
import { processToolAction, QuotaExceededError } from '../services/geminiService';

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
      { id: 'us-passport', label: 'US/India Passport', width: 2, height: 2, unit: 'in', description: '51x51 mm standard' },
      { id: 'intl-passport', label: 'International Passport', width: 35, height: 45, unit: 'mm', description: 'UK, EU, Australia' },
      { id: 'canada-passport', label: 'Canada Passport', width: 50, height: 70, unit: 'mm', description: '50x70mm requirement' },
      { id: 'standard-id', label: 'Standard ID (CR80)', width: 3.375, height: 2.125, unit: 'in', description: 'Credit card / DL size' },
      { id: 'pan-card', label: 'PAN Card (India)', width: 25, height: 35, unit: 'mm', description: '2.5 x 3.5 cm' },
      { id: 'stamp-size', label: 'Stamp Size', width: 20, height: 25, unit: 'mm', description: 'Application forms' },
    ]
  },
  commercial: {
    label: 'Print Sizes',
    icon: <Printer className="w-4 h-4" />,
    presets: [
      { id: '2r', label: 'Wallet (2R)', width: 2.5, height: 3.5, unit: 'in', description: 'Pocket portrait' },
      { id: '4r', label: 'Standard (4R)', width: 4, height: 6, unit: 'in', description: 'Common album size' },
      { id: '5r', label: 'Medium (5R)', width: 5, height: 7, unit: 'in', description: 'Desktop framing' },
      { id: '8r', label: 'Large (8R)', width: 8, height: 10, unit: 'in', description: 'Wall art standard' },
      { id: 'square-print', label: 'Instagram Square', width: 8, height: 8, unit: 'in', description: '8x8 Gallery style' },
    ]
  },
  large: {
    label: 'Posters',
    icon: <Maximize className="w-4 h-4" />,
    presets: [
      { id: '11x14', label: 'Intermediate', width: 11, height: 14, unit: 'in', description: 'Wall framing' },
      { id: '12x18', label: 'Small Poster', width: 12, height: 18, unit: 'in', description: '30x45 cm display' },
      { id: '18x24', label: 'Medium Poster', width: 18, height: 24, unit: 'in', description: 'Standard exhibit' },
      { id: '24x36', label: 'Large Poster', width: 24, height: 36, unit: 'in', description: 'Statement size' },
    ]
  },
  digital: {
    label: 'Digital',
    icon: <Monitor className="w-4 h-4" />,
    presets: [
      { id: 'online-passport', label: 'Online Passport', width: 600, height: 600, unit: 'px', description: 'Submissions' },
      { id: 'hd', label: 'HD Display', width: 1280, height: 720, unit: 'px', description: '720p 16:9' },
      { id: '4k', label: '4K Quality', width: 3840, height: 2160, unit: 'px', description: 'Ultra high-def' },
    ]
  }
} as const;

const ToolsHub: React.FC<{ initialTool?: ToolType }> = ({ initialTool = ToolType.BG_REMOVER }) => {
  const [activeTool, setActiveTool] = useState<ToolType>(initialTool);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [resizerCategory, setResizerCategory] = useState<keyof typeof RESIZE_CATEGORIES>('identification');
  const [selectedPreset, setSelectedPreset] = useState<ToolPreset | null>(RESIZE_CATEGORIES.identification.presets[0]);
  const [isCustom, setIsCustom] = useState(false);
  const [customDims, setCustomDims] = useState({ width: 1000, height: 1000, unit: 'px' as 'px' | 'in' | 'mm' });
  const [deepScan, setDeepScan] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const tools = [
    { id: ToolType.BG_REMOVER, label: 'Background Remover', icon: <Wand2 className="w-5 h-5" />, desc: 'One-click isolation.' },
    { id: ToolType.UPSCALER, label: 'Photo Upscaler', icon: <Maximize className="w-5 h-5" />, desc: 'Neural 4x enhancement.' },
    { id: ToolType.WATERMARK_REMOVER, label: 'Watermark Remover', icon: <Layers className="w-5 h-5" />, desc: 'Deep neural inpainting.' },
    { id: ToolType.RESIZER, label: 'Photo Resizing', icon: <Frame className="w-5 h-5" />, desc: 'Passport & print sizes.' },
  ];

  const handleProcess = async () => {
    if (!sourceImage) return;
    setIsProcessing(true);
    setResultImage(null);
    setError(null);
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
      console.error("AI Tool Processing Error:", err); 
      if (err instanceof QuotaExceededError || err.message?.includes('429') || JSON.stringify(err).includes('429')) {
        setError("API Quota Exhausted. ProShots is experiencing high demand. Please try again in 60 seconds.");
      } else {
        setError("Neural processing failed. Please verify your image and try again.");
      }
    } finally { 
      setIsProcessing(false); 
    }
  };

  const getProcessingMessage = () => {
    switch(activeTool) {
      case ToolType.WATERMARK_REMOVER:
        return { 
          title: "Anatomical Reconstruction", 
          sub: deepScan ? "Analyzing hidden textures behind the alpha mask..." : "Inpainting branded layers..." 
        };
      case ToolType.UPSCALER:
        return { 
          title: "Neural Super-Resolution", 
          sub: "Synthesizing high-frequency skin pores and hair micro-details..." 
        };
      case ToolType.BG_REMOVER:
        return { 
          title: "Subject Isolation", 
          sub: "Detecting edge boundaries and mapping transparency..." 
        };
      case ToolType.RESIZER:
        return { 
          title: "Geometric Reframe", 
          sub: "Calculating aspect ratios and cropping to formal standards..." 
        };
      default:
        return { title: "AI Processing", sub: "Connecting to Gemini Neural Engine..." };
    }
  };

  const msg = getProcessingMessage();

  return (
    <div className="max-w-7xl mx-auto px-6 py-32 flex flex-col lg:flex-row gap-12">
      <div className="w-full lg:w-72 shrink-0 space-y-3">
        <div className="px-4 mb-6">
          <h2 className="text-2xl font-black tracking-tight">AI TOOLS</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Powered by ProShots Engine</p>
        </div>
        {tools.map(t => (
          <button
            key={t.id}
            onClick={() => { setActiveTool(t.id); setSourceImage(null); setResultImage(null); setError(null); }}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all ${activeTool === t.id ? 'bg-slate-900 text-white shadow-2xl scale-[1.02]' : 'hover:bg-slate-50 text-slate-500'}`}
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

      <div className="flex-1 bg-slate-50/50 rounded-[40px] border border-slate-100 p-6 md:p-12 relative overflow-hidden flex flex-col">
        {isProcessing && activeTool === ToolType.WATERMARK_REMOVER && deepScan && (
          <div className="absolute inset-x-0 top-0 h-1 bg-slate-900/5 overflow-hidden z-20">
            <div className="h-full bg-slate-900 w-1/3 animate-[loading_1.5s_infinite_linear]" />
          </div>
        )}

        {!sourceImage ? (
          <div 
            className="flex-1 min-h-[500px] border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center bg-white group cursor-pointer transition-all hover:border-slate-400 hover:bg-slate-50/30" 
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="bg-slate-50 p-6 rounded-3xl mb-4 group-hover:scale-110 transition-transform">
              <Upload className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold">Select Original Photo</h3>
            <p className="text-slate-400 text-sm mt-2 max-w-xs text-center">Upload high-res images for the best neural results. Supports JPEG, PNG.</p>
            <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) { const r = new FileReader(); r.onload = (x) => setSourceImage(x.target?.result as string); r.readAsDataURL(f); }
            }} />
          </div>
        ) : (
          <div className="flex-1 flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-slate-900 text-white p-2 rounded-xl">
                  {tools.find(t => t.id === activeTool)?.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold leading-none">{tools.find(t => t.id === activeTool)?.label}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Image Lab 04</p>
                </div>
              </div>
              <button 
                onClick={() => {setSourceImage(null); setResultImage(null); setError(null);}} 
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                title="Discard image"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
              <div className="flex flex-col space-y-3">
                <div className="flex-1 aspect-square bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm relative group">
                  <img src={sourceImage} className="w-full h-full object-contain p-4 group-hover:scale-[1.02] transition-transform duration-500" />
                  <div className="absolute top-4 left-4 bg-slate-900/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-600">INPUT_SOURCE</div>
                </div>
              </div>
              <div className="flex flex-col space-y-3">
                <div className="flex-1 aspect-square bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm flex items-center justify-center relative">
                  {resultImage ? (
                    <>
                      <img src={resultImage} className="w-full h-full object-contain p-4 animate-in zoom-in duration-700" />
                      <div className="absolute top-4 left-4 bg-green-500/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-green-700">NEURAL_OUTPUT</div>
                    </>
                  ) : 
                   isProcessing ? (
                     <div className="text-center p-8 animate-in fade-in zoom-in duration-300">
                       <div className="relative w-16 h-16 mx-auto mb-6">
                         <RefreshCw className="w-full h-full animate-spin text-slate-900" />
                         <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-amber-500 animate-pulse" />
                       </div>
                       <p className="font-bold text-slate-900">{msg.title}</p>
                       <p className="text-xs text-slate-400 mt-2 max-w-[200px] mx-auto leading-relaxed">{msg.sub}</p>
                     </div>
                   ) : error ? (
                     <div className="text-center p-8 text-slate-400 flex flex-col items-center max-w-xs">
                       <div className="bg-red-50 p-4 rounded-full mb-4">
                         <Clock className="w-8 h-8 text-red-400" />
                       </div>
                       <p className="text-sm font-bold text-slate-900 mb-2">Request Blocked</p>
                       <p className="text-xs leading-relaxed">{error}</p>
                     </div>
                   ) : (
                     <div className="text-center opacity-30">
                       <Zap className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                       <p className="text-xs font-bold uppercase tracking-widest">Awaiting Command</p>
                     </div>
                   )}
                </div>
              </div>
            </div>

            {/* Sub-Controls */}
            <div className="grid grid-cols-1 gap-4">
              {activeTool === ToolType.WATERMARK_REMOVER && (
                <div className="p-6 bg-white rounded-3xl border border-slate-100 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${deepScan ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm">Frequency-Separation Mode</div>
                      <div className="text-[10px] text-slate-400 leading-none mt-1">Deep analysis of sub-layers to prevent ghosting.</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setDeepScan(!deepScan)}
                    className={`w-14 h-8 rounded-full transition-all relative ${deepScan ? 'bg-indigo-600 shadow-lg shadow-indigo-100' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ${deepScan ? 'translate-x-6' : ''}`} />
                  </button>
                </div>
              )}

              {activeTool === ToolType.RESIZER && (
                <div className="p-6 bg-white rounded-[32px] border border-slate-100 space-y-6 shadow-sm">
                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {Object.entries(RESIZE_CATEGORIES).map(([key, cat]) => (
                      <button 
                        key={key} 
                        onClick={() => { setResizerCategory(key as any); setIsCustom(false); setSelectedPreset(RESIZE_CATEGORIES[key as keyof typeof RESIZE_CATEGORIES].presets[0]); }}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all ${resizerCategory === key && !isCustom ? 'bg-slate-900 text-white shadow-xl' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                      >
                        {cat.icon} {cat.label}
                      </button>
                    ))}
                    <button onClick={() => setIsCustom(true)} className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${isCustom ? 'bg-slate-900 text-white shadow-xl' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                      <Info className="w-4 h-4" /> Custom
                    </button>
                  </div>

                  {!isCustom ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {RESIZE_CATEGORIES[resizerCategory].presets.map(p => (
                        <button key={p.id} onClick={() => setSelectedPreset(p)} className={`p-4 rounded-2xl border-2 text-left transition-all ${selectedPreset?.id === p.id ? 'border-slate-900 bg-slate-50' : 'border-transparent bg-slate-50/50 hover:bg-white hover:border-slate-200'}`}>
                          <div className="font-bold text-xs mb-1">{p.label}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{p.width}x{p.height}{p.unit}</div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-4">
                      {['width', 'height', 'unit'].map((field) => (
                        <div key={field} className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">{field}</label>
                          {field === 'unit' ? (
                            <select 
                              className="w-full p-3 bg-slate-50 rounded-xl border-none ring-1 ring-slate-100 focus:ring-slate-900 outline-none transition-all font-bold text-sm"
                              onChange={e => setCustomDims({...customDims, unit: e.target.value as any})}
                              value={customDims.unit}
                            >
                              <option value="px">Pixels</option><option value="in">Inches</option><option value="mm">MM</option>
                            </select>
                          ) : (
                            <input 
                              type="number" 
                              value={customDims[field as 'width' | 'height']} 
                              className="w-full p-3 bg-slate-50 rounded-xl border-none ring-1 ring-slate-100 focus:ring-slate-900 outline-none transition-all font-bold text-sm"
                              onChange={e => setCustomDims({...customDims, [field]: +e.target.value})} 
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button 
                onClick={handleProcess} 
                disabled={isProcessing} 
                className={`flex-1 bg-slate-900 text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 shadow-2xl shadow-slate-200 transition-all hover:bg-slate-800 ${isProcessing ? 'cursor-wait' : ''}`}
              >
                {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />} 
                {isProcessing ? "Processing Layers..." : "Run AI Neural Engine"}
              </button>
              {resultImage && (
                <button 
                  onClick={() => { const a = document.createElement('a'); a.href = resultImage; a.download=`ProShots-${activeTool}.png`; a.click(); }} 
                  className="px-8 bg-white border-2 border-slate-900 rounded-[2rem] flex items-center justify-center hover:bg-slate-50 transition-all active:scale-95 shadow-lg shadow-slate-100"
                  title="Download Result"
                >
                  <Download className="w-6 h-6 text-slate-900" />
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-amber-50/30 border border-amber-100/50 rounded-2xl">
              <div className="bg-amber-100 p-1.5 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                <span className="font-bold text-slate-700">Studio Tip:</span> For complex watermark removal, ensure <span className="underline decoration-indigo-200 underline-offset-2">Deep Reconstruction</span> mode is active. This process synthesizes missing pixels from surrounding texture patches.
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default ToolsHub;
