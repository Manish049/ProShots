import React, { useState } from 'react';
import { ArrowRight, Sparkles, Zap, Brain, Database, Workflow, Search } from 'lucide-react';

interface HeroProps {
  onStart: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStart }) => {
  const [hoveredPipeline, setHoveredPipeline] = useState<number | null>(null);

  const handleScrollToRoadmap = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById('how-it-works');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const pipelineSteps = [
    { 
      icon: <Search className="w-6 h-6" />, 
      title: "Semantic Scan", 
      stage: "01",
      desc: "Raw image data is converted into high-dimensional embedding vectors for anatomical mapping.",
    },
    { 
      icon: <Brain className="w-6 h-6" />, 
      title: "Deep Reasoning", 
      stage: "02",
      desc: "Gemini 3 Pro performs 32K token thinking budget analysis on facial bone structure and skin tone.",
    },
    { 
      icon: <Workflow className="w-6 h-6" />, 
      title: "Style Diffusion", 
      stage: "03",
      desc: "Our proprietary style-injection layer blends your features with professional studio aesthetics.",
    },
    { 
      icon: <Database className="w-6 h-6" />, 
      title: "Neural Upscaling", 
      stage: "04",
      desc: "Final post-processing removes artifacts and enhances micro-details in hair and iris textures.",
    }
  ];

  return (
    <section className="pt-32 pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-900 px-4 py-1.5 rounded-full text-sm font-bold mb-6 animate-bounce">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>GEMINI 3 PRO ENGINE ACTIVATED</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] text-slate-900">
            PIXELS TO<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-500 to-slate-200">PERFECTION.</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 font-medium">
            ProShots combines Deep-Thinking anatomical analysis with multi-stage diffusion to create portraits indistinguishable from reality.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onStart}
              className="bg-slate-900 text-white px-10 py-5 rounded-[2rem] text-lg font-bold hover:bg-slate-800 transition-all flex items-center gap-3 shadow-2xl shadow-slate-200 active:scale-95 group"
            >
              Start Generating <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a 
              href="#how-it-works" 
              onClick={handleScrollToRoadmap}
              className="text-slate-900 font-bold hover:bg-slate-50 py-5 px-10 rounded-[2rem] transition-all"
            >
              ProShot Image processing
            </a>
          </div>
        </div>

        {/* Dynamic Image Grid with Zoom-in Cursor Effect */}
        <div className="relative mt-24 mb-32 md:mb-64">
          <div className="absolute inset-x-0 -bottom-20 h-64 bg-gradient-to-t from-white via-white/80 to-transparent z-20 pointer-events-none" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto relative z-10">
            {/* Column 1 */}
            <div className="space-y-6">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl bg-slate-100 group">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400" 
                  className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110 cursor-zoom-in" 
                  alt="AI Portrait Base"
                />
              </div>
              <div className="aspect-square bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300">
                <Brain className="w-8 h-8 animate-pulse" />
              </div>
            </div>
            
            {/* Column 2 */}
            <div className="space-y-6 pt-12">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl bg-slate-100 group">
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400" 
                  className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110 cursor-zoom-in" 
                  alt="AI Portrait Professional"
                />
              </div>
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl bg-slate-100 group">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400" 
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 cursor-zoom-in" 
                  alt="AI Portrait Aesthetic"
                />
              </div>
            </div>
            
            {/* Column 3 */}
            <div className="space-y-6">
              <div className="aspect-[4/3] bg-slate-900 rounded-3xl p-6 text-white flex flex-col justify-end">
                <Zap className="w-6 h-6 mb-4 text-amber-400" />
                <p className="font-bold text-sm tracking-tight">LATENCY: 1.2s</p>
                <p className="text-[10px] opacity-50 font-mono">MODEL: GEMINI-2.5-FLASH</p>
              </div>
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl bg-slate-100 group">
                <img 
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400" 
                  className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110 cursor-zoom-in" 
                  alt="AI Portrait Casual"
                />
              </div>
            </div>
            
            {/* Column 4 */}
            <div className="space-y-6 pt-8">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl bg-slate-100 group">
                <img 
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400" 
                  className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110 cursor-zoom-in" 
                  alt="AI Portrait Natural"
                />
              </div>
              <div className="aspect-[4/2] bg-slate-100 rounded-3xl border border-slate-200 border-dashed" />
            </div>
          </div>
        </div>

        {/* AI MODEL PIPELINE / ProShot Image processing */}
        <div id="how-it-works" className="py-32 scroll-mt-24 relative z-30 bg-white">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black mb-4 tracking-tighter">AI MODEL PIPELINE</h2>
            <p className="text-slate-500 font-medium uppercase tracking-widest text-sm">ProShot Image processing architecture</p>
          </div>

          <div className="relative">
            {/* Connecting Line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -translate-y-1/2 hidden md:block pointer-events-none" />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
              {pipelineSteps.map((step, i) => {
                const isHovered = hoveredPipeline === i;
                const isOthersHovered = hoveredPipeline !== null && !isHovered;

                return (
                  <div 
                    key={i} 
                    onMouseEnter={() => setHoveredPipeline(i)}
                    onMouseLeave={() => setHoveredPipeline(null)}
                    className={`
                      p-8 rounded-[2.5rem] border border-slate-100 transition-all duration-500 cursor-default
                      ${isHovered ? 'bg-slate-900 text-white shadow-2xl -translate-y-2 scale-105 z-20' : 'bg-white shadow-sm'}
                      ${isOthersHovered ? 'opacity-30 scale-95 grayscale' : 'opacity-100'}
                    `}
                  >
                    <div className="flex items-center justify-between mb-8">
                      <div className={`p-4 rounded-2xl shadow-sm transition-colors duration-500 ${isHovered ? 'bg-white/10 text-white' : 'bg-slate-50 text-slate-900'}`}>
                        {step.icon}
                      </div>
                      <span className={`text-4xl font-black transition-opacity duration-500 font-mono tracking-tighter ${isHovered ? 'opacity-20' : 'opacity-10 text-slate-900'}`}>{step.stage}</span>
                    </div>
                    <h3 className="text-xl font-black mb-3">{step.title}</h3>
                    <p className={`text-sm leading-relaxed transition-opacity duration-500 ${isHovered ? 'text-slate-300' : 'text-slate-500 font-medium'}`}>
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* TECHNICAL ROADMAP / METRICS */}
        <div className="mt-32 p-12 bg-slate-50 rounded-[3rem] border border-slate-100 relative z-30">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-3xl font-black mb-6 tracking-tight">The Reality Gap Is Gone.</h3>
              <p className="text-slate-500 mb-8 leading-relaxed font-medium">
                Our model architecture prioritizes identity preservation over generic beauty. By using Gemini's vision-to-text-to-vision pipeline, we maintain the soul of your photo while upgrading the environment.
              </p>
              <div className="space-y-6">
                {[
                  { label: "Anatomical Accuracy", value: "99.8%" },
                  { label: "Identity Preservation", value: "High Fidelity" },
                  { label: "Generation Speed", value: "Sub-2s" }
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <span className="font-bold text-slate-500 uppercase text-xs tracking-widest">{stat.label}</span>
                    <span className="font-black text-slate-900">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-4 rounded-[2rem] shadow-xl border border-slate-200 rotate-1">
              <div className="p-4 border-b border-slate-50 flex items-center justify-between mb-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="text-[10px] font-mono text-slate-400">DIFFUSION_STATUS: OPTIMIZED</div>
              </div>
              <div className="space-y-3 font-mono text-[10px] text-slate-600 p-4">
                <p className="text-slate-400 animate-pulse">&gt; ANALYZING_SOURCE_PIXELS...</p>
                <p>&gt; GEMINI_3_PRO: EXTRACTING_SEMANTIC_FEATURES [100%]</p>
                <p className="text-slate-900 font-bold">&gt; IDENTIFY_POINTS: FACE_SKELETON_MAPPED</p>
                <p>&gt; STYLE_INJECTION: PROFESSIONAL_MODE_ON</p>
                <p className="text-green-600">&gt; RENDER_COMPLETE: SAVING_TO_BUFFER</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
