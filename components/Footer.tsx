
import React from 'react';
import { Instagram, Twitter, Linkedin, Github } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold mb-4">ProShots</h3>
            <p className="text-slate-500 max-w-sm">
              The professional standard for AI-enhanced portrait photography. 
              Elevate your online presence with studio-quality shots in seconds.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-slate-900">Platform</h4>
            <ul className="space-y-2 text-slate-500 text-sm">
              <li><a href="#" className="hover:text-slate-900">Features</a></li>
              <li><a href="#" className="hover:text-slate-900">Pricing</a></li>
              <li><a href="#" className="hover:text-slate-900">Enterprise</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-slate-900">Company</h4>
            <ul className="space-y-2 text-slate-500 text-sm">
              <li><a href="#" className="hover:text-slate-900">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-slate-900">Terms of Service</a></li>
              <li><a href="#" className="hover:text-slate-900">Contact Us</a></li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-slate-200">
          <p className="text-slate-400 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} ProShots AI. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Instagram className="w-5 h-5 text-slate-400 hover:text-slate-900 cursor-pointer transition-colors" />
            <Twitter className="w-5 h-5 text-slate-400 hover:text-slate-900 cursor-pointer transition-colors" />
            <Linkedin className="w-5 h-5 text-slate-400 hover:text-slate-900 cursor-pointer transition-colors" />
            <Github className="w-5 h-5 text-slate-400 hover:text-slate-900 cursor-pointer transition-colors" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
