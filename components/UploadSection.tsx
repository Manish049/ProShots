
import React, { useState, useRef } from 'react';
import { Upload, X, Camera, AlertCircle } from 'lucide-react';

interface UploadSectionProps {
  onFilesSelected: (files: string[]) => void;
}

const UploadSection: React.FC<UploadSectionProps> = ({ onFilesSelected }) => {
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fix: Ensure e.target.files is not null before converting to Array to fix type inference issue
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = (files: File[]) => {
    setError(null);
    const newPreviews: string[] = [];
    let processedCount = 0;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        processedCount++;
        if (processedCount === files.length) {
          setPreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (previews.length < 5) {
      setError("Please upload at least 5 photos for the best AI analysis.");
      return;
    }
    onFilesSelected(previews);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Upload Your Photos</h2>
        <p className="text-slate-500">Provide 5 or more clear photos of yourself from different angles.</p>
      </div>

      <div 
        className="border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center hover:border-slate-400 transition-colors cursor-pointer bg-slate-50/50"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="bg-white w-16 h-16 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-6">
          <Upload className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-lg font-medium mb-2">Drag and drop or click to browse</p>
        <p className="text-slate-400 text-sm">Supports JPG, PNG (Min. 5 photos)</p>
        <input 
          type="file" 
          ref={fileInputRef}
          multiple 
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {previews.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Selected Photos ({previews.length})</h3>
            {previews.length < 5 && (
              <span className="text-amber-600 text-sm flex items-center gap-1 font-medium">
                <AlertCircle className="w-4 h-4" /> Need {5 - previews.length} more
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {previews.map((src, i) => (
              <div key={i} className="relative group aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-white">
                <img src={src} className="w-full h-full object-cover" />
                <button 
                  onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                  className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow-md text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="mt-12 flex justify-center">
        <button 
          onClick={handleSubmit}
          disabled={previews.length < 5}
          className={`px-12 py-4 rounded-full text-lg font-bold shadow-xl transition-all active:scale-95 ${
            previews.length >= 5 
              ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200' 
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          Continue to Style Selection
        </button>
      </div>
    </div>
  );
};

export default UploadSection;
