'use client';

import { useCallback, useState, useRef } from 'react';
import { Upload, X, FileText } from 'lucide-react';

interface UploadDropzoneProps {
  onFiles: (files: File[]) => void;
  maxFiles?: number;
  accept?: string;
}

export function UploadDropzone({ onFiles, maxFiles = 5, accept }: UploadDropzoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files).slice(0, maxFiles);
    setFiles(prev => {
      const next = [...prev, ...dropped].slice(0, maxFiles);
      onFiles(next);
      return next;
    });
  }, [maxFiles, onFiles]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files).slice(0, maxFiles);
    setFiles(prev => {
      const next = [...prev, ...selected].slice(0, maxFiles);
      onFiles(next);
      return next;
    });
  }, [maxFiles, onFiles]);

  const removeFile = (idx: number) => {
    setFiles(prev => {
      const next = prev.filter((_, i) => i !== idx);
      onFiles(next);
      return next;
    });
  };

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className="glass-panel p-6 text-center cursor-pointer transition-all"
        style={{
          borderColor: dragOver ? 'var(--gold)' : undefined,
          borderStyle: 'dashed',
        }}
      >
        <Upload size={20} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Drop files here or click to browse
        </p>
        <input ref={inputRef} type="file" multiple accept={accept} onChange={handleChange} className="hidden" />
      </div>
      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-2 glass-panel px-3 py-2 text-xs">
              <FileText size={14} style={{ color: 'var(--gold)' }} />
              <span className="flex-1 truncate" style={{ color: 'var(--text-primary)' }}>{f.name}</span>
              <span style={{ color: 'var(--text-muted)' }}>{(f.size / 1024).toFixed(0)}KB</span>
              <button onClick={() => removeFile(i)} className="p-0.5 hover:opacity-80">
                <X size={12} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
