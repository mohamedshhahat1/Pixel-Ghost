import React from 'react';
import { Upload, X, File as FileIcon, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  label?: string;
  preview?: string;
  onClear?: () => void;
}

export function Dropzone({ onFileSelect, accept = "image/png,image/jpeg", label = "Drop image here", preview, onClear }: DropzoneProps) {
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={cn(
        "relative rounded-3xl border-2 border-dashed transition-all duration-300 min-h-[300px] flex flex-col items-center justify-center p-8 text-center group overflow-hidden",
        isDragging 
          ? "border-primary bg-primary/8 shadow-[0_0_28px_-8px_rgba(47,123,255,0.55)]" 
          : "border-border/80 hover:border-primary/45 bg-card/40",
        preview && "border-none p-0 overflow-hidden"
      )}
    >
      {preview ? (
        <div className="relative w-full h-full min-h-[300px] group/preview">
          <img src={preview} alt="Preview" className="w-full h-full object-contain rounded-3xl" />
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
            <button 
              onClick={(e) => { e.stopPropagation(); onClear?.(); }}
              className="w-12 h-12 rounded-full bg-red-500/20 text-red-500 border border-red-500/30 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      ) : (
        <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center gap-4">
          <input 
            type="file" 
            className="hidden" 
            accept={accept}
            onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
          />
          <div className="w-16 h-16 rounded-2xl bg-secondary/50 border border-border flex items-center justify-center text-primary group-hover:scale-110 group-hover:border-primary/50 group-hover:shadow-[0_0_22px_-10px_rgba(47,123,255,0.8)] transition-all">
            <ImageIcon size={32} />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{label}</p>
            <p className="text-sm text-muted-foreground">Drag & Drop or click to browse</p>
          </div>
          <div className="mt-4 flex gap-2">
            <div className="px-3 py-1 rounded-full bg-secondary border border-border text-[10px] font-mono text-muted-foreground uppercase">PNG</div>
            <div className="px-3 py-1 rounded-full bg-secondary border border-border text-[10px] font-mono text-muted-foreground uppercase">JPG</div>
          </div>
        </label>
      )}
    </div>
  );
}
