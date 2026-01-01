
import React, { useState } from 'react';
import { Camera, ChevronDown, Wand2, Maximize, Layers, Frame } from 'lucide-react';
import { AppStep, ToolType } from '../types';

interface NavbarProps {
  onStepChange: (step: AppStep, params?: any) => void;
  currentStep: AppStep;
}

const Navbar: React.FC<NavbarProps> = ({ onStepChange, currentStep }) => {
  const [showTools, setShowTools] = useState(false);

  const tools = [
    { id: ToolType.WATERMARK_REMOVER, label: 'Watermark Remover', icon: <Layers className="w-4 h-4" /> },
    { id: ToolType.UPSCALER, label: 'Photo Upscaler', icon: <Maximize className="w-4 h-4" /> },
    { id: ToolType.BG_REMOVER, label: 'Background Remover', icon: <Wand2 className="w-4 h-4" /> },
    { id: ToolType.RESIZER, label: 'Photo Resizing', icon: <Frame className="w-4 h-4" /> },
  ];

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    if (currentStep !== AppStep.LANDING) {
      onStepChange(AppStep.LANDING, { targetId: id });
      // Wait for rendering to complete before scrolling
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => onStepChange(AppStep.LANDING)}
        >
          <div className="bg-slate-900 p-2 rounded-lg">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">ProShots</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a 
            href="#how-it-works" 
            onClick={(e) => handleAnchorClick(e, 'how-it-works')}
            className="hover:text-slate-900 transition-colors"
          >
            How it Works
          </a>
          
          <div className="relative">
            <button 
              onMouseEnter={() => setShowTools(true)}
              onMouseLeave={() => setShowTools(false)}
              className="flex items-center gap-1 hover:text-slate-900 transition-colors py-2"
            >
              Tools <ChevronDown className={`w-4 h-4 transition-transform ${showTools ? 'rotate-180' : ''}`} />
            </button>
            
            {showTools && (
              <div 
                onMouseEnter={() => setShowTools(true)}
                onMouseLeave={() => setShowTools(false)}
                className="absolute top-full left-0 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 mt-0"
              >
                {tools.map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => {
                      onStepChange(AppStep.TOOLS, { toolId: tool.id });
                      setShowTools(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 text-slate-600 hover:text-slate-900 transition-all"
                  >
                    <div className="bg-slate-100 p-1.5 rounded-lg text-slate-500">
                      {tool.icon}
                    </div>
                    <span>{tool.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <a 
            href="#testimonials" 
            onClick={(e) => handleAnchorClick(e, 'testimonials')}
            className="hover:text-slate-900 transition-colors"
          >
            Success Stories
          </a>
          
          <button 
            onClick={() => onStepChange(AppStep.UPLOAD)}
            className="bg-slate-900 text-white px-6 py-2.5 rounded-full hover:bg-slate-800 transition-all active:scale-95"
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
