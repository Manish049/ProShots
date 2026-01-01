
import React, { useState } from 'react';
import { Camera, ChevronDown, Wand2, Maximize, Layers, Frame, Menu, X, User } from 'lucide-react';
import { AppStep, ToolType } from '../types';

interface NavbarProps {
  onStepChange: (step: AppStep, params?: any) => void;
  currentStep: AppStep;
}

const Navbar: React.FC<NavbarProps> = ({ onStepChange, currentStep }) => {
  const [showTools, setShowTools] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tools = [
    { id: ToolType.WATERMARK_REMOVER, label: 'Watermark Remover', icon: <Layers className="w-4 h-4" /> },
    { id: ToolType.UPSCALER, label: 'Photo Upscaler', icon: <Maximize className="w-4 h-4" /> },
    { id: ToolType.BG_REMOVER, label: 'Background Remover', icon: <Wand2 className="w-4 h-4" /> },
    { id: ToolType.RESIZER, label: 'Photo Resizing', icon: <Frame className="w-4 h-4" /> },
  ];

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    if (currentStep !== AppStep.LANDING) {
      onStepChange(AppStep.LANDING, { targetId: id });
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

  const handleToolClick = (toolId: ToolType) => {
    onStepChange(AppStep.TOOLS, { toolId });
    setShowTools(false);
    setIsMobileMenuOpen(false);
  };

  const handleStartClick = () => {
    onStepChange(AppStep.UPLOAD);
    setIsMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    onStepChange(AppStep.LANDING);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={handleLogoClick}
        >
          <div className="bg-slate-900 p-2 rounded-lg">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">ProShots</span>
        </div>
        
        {/* Desktop Navigation */}
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
                    onClick={() => handleToolClick(tool.id)}
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
            onClick={() => onStepChange(AppStep.FOUNDER)}
            className={`flex items-center gap-2 hover:text-slate-900 transition-colors ${currentStep === AppStep.FOUNDER ? 'text-slate-900 font-black' : ''}`}
          >
            Creator
          </button>
          
          <button 
            onClick={handleStartClick}
            className="bg-slate-900 text-white px-6 py-2.5 rounded-full hover:bg-slate-800 transition-all active:scale-95"
          >
            Get Started
          </button>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-white border-b border-slate-100 shadow-xl p-6 flex flex-col gap-6 animate-in slide-in-from-top-4 duration-300">
          <a 
            href="#how-it-works" 
            onClick={(e) => handleAnchorClick(e, 'how-it-works')}
            className="text-lg font-bold text-slate-900 border-b border-slate-50 pb-2"
          >
            How it Works
          </a>

          <button 
            onClick={() => { onStepChange(AppStep.FOUNDER); setIsMobileMenuOpen(false); }}
            className="text-lg font-bold text-slate-900 border-b border-slate-50 pb-2 text-left"
          >
            Creator
          </button>
          
          <div className="space-y-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Tools</span>
            <div className="grid grid-cols-1 gap-2">
              {tools.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => handleToolClick(tool.id)}
                  className="w-full text-left px-4 py-3 bg-slate-50 rounded-xl flex items-center gap-3 text-slate-600 hover:text-slate-900 transition-all"
                >
                  <div className="bg-white p-1.5 rounded-lg text-slate-400">
                    {tool.icon}
                  </div>
                  <span className="font-bold text-sm">{tool.label}</span>
                </button>
              ))}
            </div>
          </div>

          <a 
            href="#testimonials" 
            onClick={(e) => handleAnchorClick(e, 'testimonials')}
            className="text-lg font-bold text-slate-900 border-b border-slate-50 pb-2"
          >
            Success Stories
          </a>

          <button 
            onClick={handleStartClick}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-slate-100 active:scale-95"
          >
            Get Started
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
