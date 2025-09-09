
import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface FileUploadProps {
  onProcessFile: (file: File) => void;
  disabled: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onProcessFile, disabled }) => {
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [onProcessFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };
  
  const processFile = (file: File) => {
    if (file.type === "text/plain") {
        onProcessFile(file);
    } else {
        alert("Please upload a valid .txt file.");
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
        disabled={disabled}
      />
      <div className="flex flex-col items-center justify-center gap-4 text-muted">
        <UploadIcon className={`w-12 h-12 transition-colors ${dragActive ? 'text-pine' : ''}`} />
        <p className="font-semibold text-text">Drag & Drop a .txt file here</p>
        <p>or</p>
        <button
          onClick={onButtonClick}
          disabled={disabled}
          className="px-6 py-2 bg-pine text-text rounded-md font-bold hover:bg-pine/80 disabled:bg-muted/50 disabled:cursor-not-allowed transition-colors"
        >
          Browse File
        </button>
        <p className="text-sm text-subtle mt-2">Your document will be analyzed locally and sent to the AI for classification.</p>
      </div>
    </div>
  );
};

export default FileUpload;
