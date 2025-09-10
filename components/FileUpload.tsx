import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface FileUploadProps {
  onProcessFiles: (files: File[]) => void;
  disabled: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onProcessFiles, disabled }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  }, [onProcessFiles]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };
  
  const processFiles = (files: File[]) => {
    const validFiles = files.filter(file => file.type === "text/plain");
    if (validFiles.length > 0) {
      onProcessFiles(validFiles);
    } else {
      alert("Please upload valid .txt files.");
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div 
      className={`p-6 border-2 border-dashed rounded-lg text-center transition-all duration-300 ${disabled ? 'border-muted/50 bg-surface/50 cursor-not-allowed' : dragActive ? 'border-pine bg-pine/10' : 'border-muted hover:border-pine'}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleChange}
        accept=".txt"
        multiple
        disabled={disabled}
      />
      <div className="flex flex-col items-center justify-center gap-4 text-muted">
        <UploadIcon className={`w-12 h-12 transition-colors ${dragActive ? 'text-pine' : ''}`} />
        <p className="font-semibold text-text">Drag & Drop .txt files here</p>
        <p>or</p>
        <button
          onClick={onButtonClick}
          disabled={disabled}
          className="px-6 py-2 bg-pine text-text rounded-md font-bold hover:bg-pine/80 disabled:bg-muted/50 disabled:cursor-not-allowed transition-colors"
        >
          Browse Files
        </button>
        <p className="text-sm text-subtle mt-2">Your documents will be analyzed locally and sent to the AI for classification.</p>
      </div>
    </div>
  );
};

export default FileUpload;
