
import React, { useState, useMemo, useEffect } from 'react';
import { GeneratedImage, PhotoStyle, ToolType } from '../types';
import { Download, Sparkles, Wand2, X, RefreshCw, Layers, Sliders, RotateCcw, Package } from 'lucide-react';
import { editPhotoWithText, processToolAction } from '../services/geminiService';
import JSZip from 'jszip';

interface ResultGalleryProps {
  images: GeneratedImage[];
  onRestart: () => void;
}

const ResultGallery: React.FC<ResultGalleryProps> = ({ images, onRestart }) => {
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [editPrompt, setEditPrompt] = useState("");
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PhotoStyle>(PhotoStyle.PROFESSIONAL);

  // Adjustment states
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);

  // Automatically switch tab to the category of the generated images
  useEffect(() => {
    if (images.length > 0) {
      const firstImageCategory = images[0].category as PhotoStyle;
      if (Object.values(PhotoStyle).includes(firstImageCategory)) {
        setActiveTab(firstImageCategory);
      }
    }
  }, [images]);

  const tabs = Object.values(PhotoStyle);
  const filteredImages = images.filter(img => img.category === activeTab);

  const filterStyle = useMemo(() => ({
    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
  }), [brightness, contrast, saturation]);

  const handleEdit = async () => {
    if (!selectedImage || !editPrompt) return;
    setIsEditing(true);
    try {
      const currentUrl = editingImage || selectedImage.url;
      const newUrl = await editPhotoWithText(currentUrl, editPrompt);
      setEditingImage(newUrl);
    } catch (error) {
      console.error("Edit failed", error);
    } finally {
      setIsEditing(false);
    }
  };

  const handleRemoveBackground = async () => {
    if (!selectedImage) return;
    setIsEditing(true);
    try {
      const currentUrl = editingImage || selectedImage.url;
      const newUrl = await processToolAction(currentUrl, ToolType.BG_REMOVER);
      setEditingImage(newUrl);
    } catch (error) {
      console.error("Background removal failed", error);
    } finally {
      setIsEditing(false);
    }
  };

  const handleDownloadAll = async () => {
    if (images.length === 0) return;
    setIsDownloadingAll(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder("ProShots-Portraits");
      
      const promises = images.map(async (img, index) => {
        // Fetch the data URL as a blob
        const response = await fetch(img.url);
        const blob = await response.blob();
        // Determine file extension from mime type or default to png
        const extension = blob.type.split('/')[1] || 'png';
        const fileName = `${img.category.replace(/\s+/g, '-').toLowerCase()}-${index + 1}.${extension}`;
        folder?.file(fileName, blob);
      });

      await Promise.all(promises);
      
      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `ProShots-Full-Collection-${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Failed to generate zip", error);
    } finally {
      setIsDownloadingAll(false);
    }
  };

  const resetAdjustments = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
  };

  const downloadImage = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `ProShot-${Date.now()}.png`;
    link.click();
  };

  const openImage = (img: GeneratedImage) => {
    setSelectedImage(img);
    setEditingImage(null);
    setEditPrompt("");
    resetAdjustments();
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h2 className="text-4xl font-bold mb-2">Your Enhanced Gallery</h2>
          <p className="text-slate-500">{images.length} studio-quality variations ready for use.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleDownloadAll}
            disabled={isDownloadingAll || images.length === 0}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isDownloadingAll ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Package className="w-4 h-4 group-hover:scale-110 transition-transform" />
            )}
            {isDownloadingAll ? 'Creating Zip...' : 'Download All (.zip)'}
          </button>
          <button 
            onClick={onRestart}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
          >
            <RotateCcw className="w-4 h-4" /> Start Over
          </button>
        </div>
      </div>

      <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit mb-12 overflow-x-auto max-w-full no-scrollbar">
        {tabs.map(tab => {
          const count = images.filter(img => img.category === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
              {count > 0 && (
                <span className="bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {filteredImages.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredImages.map((img) => (
            <div 
              key={img.id}
              className="group relative bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-slate-200 transition-all cursor-zoom-in"
              onClick={() => openImage(img)}
            >
              <div className="aspect-square overflow-hidden">
                <img src={img.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button className="bg-white p-3 rounded-full text-slate-900 hover:scale-110 transition-transform shadow-lg">
                  <Sparkles className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
          <p className="text-slate-400 font-medium">No images generated for this style in this session.</p>
        </div>
      )}

      {selectedImage && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col md:flex-row animate-in fade-in duration-300">
          <div className="flex-1 bg-slate-50 relative flex items-center justify-center p-6 md:p-12">
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 left-6 p-2 rounded-full bg-white shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="relative group max-w-full max-h-[80vh]">
              <img 
                src={editingImage || selectedImage.url} 
                style={filterStyle}
                className="max-h-[80vh] max-w-full rounded-2xl shadow-2xl transition-all duration-300 ease-out" 
                alt="Enhanced preview"
              />
            </div>
          </div>

          <div className="w-full md:w-[450px] bg-white border-l border-slate-100 p-8 flex flex-col overflow-y-auto shadow-2xl">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-slate-600 mb-4">
                {selectedImage.category}
              </div>
              <h3 className="text-2xl font-bold mb-2">Editor</h3>
              <p className="text-slate-500 leading-relaxed text-sm">{selectedImage.description}</p>
            </div>

            <div className="flex-1 space-y-6">
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 text-slate-900 font-bold">
                    <Sliders className="w-5 h-5" />
                    Adjustments
                  </div>
                  <button 
                    onClick={resetAdjustments}
                    className="text-slate-400 hover:text-slate-900 transition-colors"
                    title="Reset to defaults"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">
                      <span>Brightness</span>
                      <span>{brightness}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="200" value={brightness} 
                      onChange={(e) => setBrightness(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">
                      <span>Contrast</span>
                      <span>{contrast}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="200" value={contrast} 
                      onChange={(e) => setContrast(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">
                      <span>Saturation</span>
                      <span>{saturation}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="200" value={saturation} 
                      onChange={(e) => setSaturation(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-900 font-bold mb-4">
                  <Wand2 className="w-5 h-5" />
                  Quick Tools
                </div>
                <button 
                  onClick={handleRemoveBackground}
                  disabled={isEditing}
                  className="w-full bg-white border border-slate-200 text-slate-900 py-3 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2 mb-4 disabled:opacity-50"
                >
                  {isEditing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Layers className="w-4 h-4" />}
                  Remove Background
                </button>
              </div>

              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-900 font-bold mb-4">
                  <Sparkles className="w-5 h-5" />
                  AI Magic Edit
                </div>
                <textarea
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  placeholder="e.g. 'Add a sunset glow' or 'Change the tie to blue'..."
                  className="w-full h-24 p-4 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-slate-900 outline-none transition-all resize-none text-sm mb-4"
                />
                <button 
                  onClick={handleEdit}
                  disabled={isEditing || !editPrompt}
                  className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isEditing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Generate Edit
                </button>
              </div>
            </div>

            <div className="pt-8 mt-8 border-t border-slate-100 sticky bottom-0 bg-white">
              <button 
                onClick={() => downloadImage(editingImage || selectedImage.url)}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200 active:scale-95"
              >
                <Download className="w-5 h-5" /> Download HD
              </button>
              <p className="text-[10px] text-center text-slate-400 mt-3 font-medium uppercase tracking-widest">
                HD Quality • Studio Enhanced
              </p>
            </div>
          </div>
        </div>
      )}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default ResultGallery;