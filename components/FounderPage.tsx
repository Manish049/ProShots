
import React from 'react';
import { Brain, Code, Cpu, Heart, Rocket, ShieldCheck, Sparkles, Terminal, ArrowRight, Quote } from 'lucide-react';

const FounderPage: React.FC = () => {
  // Professional portrait for Manish Singh
  const architectImage = "https://i.ibb.co/XfWR7Brh/Chat-GPT-Image-Jan-2-2026-06-12-52-PM.png";

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="pt-32 pb-20 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-slate-100 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-600 mb-6">
                <Sparkles className="w-3 h-3" /> Architect & Visionary
              </div>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
                MANISH<br />SINGH.
              </h1>
              <p className="text-2xl text-slate-500 font-medium leading-relaxed max-w-xl">
                The engineer bridging the gap between digital pixels and biological identity.
              </p>
            </div>
            <div className="w-full lg:w-[450px] aspect-square rounded-[3rem] overflow-hidden bg-slate-100 relative group shadow-2xl">
              <img 
                src={architectImage} 
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" 
                alt="Manish Singh - Architect of ProShots"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
              <div className="absolute bottom-8 left-8">
                <p className="text-white font-black text-xl tracking-tight">Manish Singh</p>
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Architect of ProShots</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Journey */}
      <section className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
            <div>
              <h2 className="text-4xl font-black mb-12 tracking-tighter uppercase">The Development Journey</h2>
              <div className="space-y-12">
                {[
                  { 
                    year: "2023 - Q3", 
                    title: "The Uncanny Valley", 
                    desc: "Manish noticed that existing AI headshot tools were losing the 'soul' of the subject. He began researching identity-lock algorithms that prioritize anatomy over generic aesthetics." 
                  },
                  { 
                    year: "2024 - Q1", 
                    title: "Gemini Integration", 
                    desc: "The pivot to Google's Gemini 3 Pro changed everything. By leveraging the model's massive reasoning budget, ProShots could finally 'think' about bone structure before rendering pixels." 
                  },
                  { 
                    year: "2024 - Q4", 
                    title: "Neural Studio v1.0", 
                    desc: "ProShots launched as a full-suite neural photography studio, introducing the world's first anatomical diffusion engine for professional and creative use." 
                  }
                ].map((item, i) => (
                  <div key={i} className="flex gap-8 group">
                    <div className="text-xs font-black text-slate-300 mt-1 whitespace-nowrap">{item.year}</div>
                    <div>
                      <h3 className="text-xl font-black mb-2 group-hover:text-slate-900 transition-colors">{item.title}</h3>
                      <p className="text-slate-500 font-medium text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8">
                 <Terminal className="w-8 h-8 text-slate-100" />
               </div>
               <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                 <Code className="w-6 h-6" /> AI ARCHITECTURE
               </h3>
               <div className="space-y-6">
                 <div className="p-6 bg-slate-50 rounded-2xl">
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Core Implementation</p>
                   <p className="font-bold text-slate-800 leading-relaxed">
                     "We don't just prompt an image. We use Gemini 3 Pro to perform a 32,768 token anatomical audit of source images before the diffusion process even begins."
                   </p>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 border border-slate-100 rounded-2xl">
                     <Brain className="w-5 h-5 text-indigo-500 mb-3" />
                     <p className="text-[10px] font-black uppercase text-slate-400">Semantic Reasoning</p>
                     <p className="text-xs font-bold mt-1">Gemini 3 Pro Vision</p>
                   </div>
                   <div className="p-4 border border-slate-100 rounded-2xl">
                     <Cpu className="w-5 h-5 text-amber-500 mb-3" />
                     <p className="text-[10px] font-black uppercase text-slate-400">Processing Latency</p>
                     <p className="text-xs font-bold mt-1">Sub-1.5s Execution</p>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Blog */}
      <section className="py-32">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black tracking-tighter mb-4 uppercase">Mission & Vision</h2>
            <div className="w-20 h-1 bg-slate-900 mx-auto" />
          </div>

          <article className="prose prose-slate lg:prose-xl">
            <div className="mb-12">
              <Quote className="w-12 h-12 text-slate-200 mb-6" />
              <p className="text-2xl font-medium text-slate-900 leading-snug italic">
                "Photography has always been about access—access to studios, access to lighting, access to the right moment. With ProShots, I wanted to turn that access into an algorithm."
              </p>
            </div>

            <h3 className="text-2xl font-black mt-16 mb-6">The Democratization of Identity</h3>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Manish Singh created ProShots with a singular vision: to ensure that your digital presence is as professional and polished as you are, regardless of your equipment. He believes that the 'selfie' is a limitation of hardware, not a reflection of a person's value or professionalism.
            </p>

            <div className="p-8 bg-slate-900 text-white rounded-[2rem] my-16 shadow-2xl">
              <h4 className="text-xl font-black mb-4 flex items-center gap-2">
                <Rocket className="w-5 h-5 text-amber-400" /> THE 2025 VISION
              </h4>
              <p className="text-slate-300 text-sm leading-relaxed">
                By 2025, Manish aims to integrate real-time video neural synthesis, allowing users to conduct professional video meetings using their ProShot digital twin—eliminating the need for home offices or professional background setups entirely.
              </p>
            </div>

            <h3 className="text-2xl font-black mt-16 mb-6">A Promise of Safety</h3>
            <p className="text-slate-600 mb-8 leading-relaxed">
              At the core of Manish's mission is **Safety & Ethics**. ProShots is built with a closed-loop neural architecture. "Your biometric data shouldn't belong to a server," says Manish. "It belongs to your identity." This is why ProShots implements strict NSFW filters and copyright protections within the Gemini engine.
            </p>

            <div className="mt-20 pt-12 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-widest text-slate-400">Sincerely,</p>
                <p className="text-3xl font-black tracking-tighter mt-2">Manish Singh</p>
                <p className="text-xs font-bold text-slate-500 uppercase mt-1">Architect, ProShots</p>
              </div>
              <div className="flex gap-4">
                <ShieldCheck className="w-8 h-8 text-slate-900" />
                <Heart className="w-8 h-8 text-red-500" />
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-32 px-6">
        <div className="max-w-5xl mx-auto bg-slate-50 rounded-[4rem] p-12 md:p-24 text-center border border-slate-100">
           <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tighter">Ready to see the vision in action?</h2>
           <button 
             onClick={() => window.scrollTo(0,0)} 
             className="bg-slate-900 text-white px-12 py-5 rounded-[2rem] text-lg font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 flex items-center gap-3 mx-auto"
           >
             Get Started Now <ArrowRight className="w-5 h-5" />
           </button>
        </div>
      </section>
    </div>
  );
};

export default FounderPage;
