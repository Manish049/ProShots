
import React, { useState } from 'react';
import { STYLE_OPTIONS } from '../constants';
import { PhotoStyle } from '../types';
import { CheckCircle2, Sparkles } from 'lucide-react';

interface StyleSelectorProps {
  onStyleSelected: (style: PhotoStyle) => void;
}

const StyleSelector: React.FC<StyleSelectorProps> = ({ onStyleSelected }) => {
  const [selected, setSelected] = useState<PhotoStyle | null>(null);

  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-900 px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-4">
          <Sparkles className="w-3 h-3" /> Step 02: Aesthetic Mapping
        </div>
        <h2 className="text-4xl font-black mb-4 tracking-tight">Select Your Vision</h2>
        <p className="text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">
          Choose the primary theme for your AI synthesis. We'll generate 25 variations based on this core aesthetic.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
        {STYLE_OPTIONS.map((style) => (
          <div 
            key={style.id}
            onClick={() => setSelected(style.id)}
            className={`relative group cursor-pointer rounded-[2.5rem] overflow-hidden border-2 transition-all duration-500 ${
              selected === style.id 
                ? 'border-slate-900 ring-8 ring-slate-100 scale-[1.02] shadow-2xl' 
                : 'border-slate-100 hover:border-slate-300 hover:shadow-xl'
            }`}
          >
            <div className="aspect-[4/5] overflow-hidden relative">
              <img 
                src={style.sample} 
                className={`w-full h-full object-cover transition-all duration-1000 ${
                  selected === style.id ? 'scale-110' : 'group-hover:scale-110'
                } ${style.id === PhotoStyle.ANIMATION_2D ? 'brightness-110 contrast-105' : ''}`} 
                alt={style.label}
              />
              <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-500 ${selected === style.id ? 'opacity-100' : 'opacity-80 group-hover:opacity-90'}`} />
              
              {selected === style.id && (
                <div className="absolute top-6 right-6 animate-in zoom-in duration-300">
                  <div className="bg-white rounded-full p-1 shadow-2xl">
                    <CheckCircle2 className="w-8 h-8 text-slate-900 fill-white" />
                  </div>
                </div>
              )}
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-xl backdrop-blur-md transition-colors ${selected === style.id ? 'bg-white text-slate-900' : 'bg-white/10 text-white'}`}>
                  {style.icon}
                </div>
                <h3 className="text-2xl font-black tracking-tight">{style.label}</h3>
              </div>
              <p className={`text-sm leading-relaxed transition-opacity duration-500 ${selected === style.id ? 'text-white' : 'text-white/70'}`}>
                {style.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-6">
        <button 
          onClick={() => selected && onStyleSelected(selected)}
          disabled={!selected}
          className={`px-16 py-5 rounded-[2rem] text-lg font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95 flex items-center gap-4 ${
            selected 
              ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200 hover:-translate-y-1' 
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {selected ? <Sparkles className="w-6 h-6 animate-pulse" /> : null}
          {selected ? 'Start AI Synthesis' : 'Select a Style'}
        </button>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          High Precision • Identity Lock Guaranteed
        </p>
      </div>
    </div>
  );
};

export default StyleSelector;
