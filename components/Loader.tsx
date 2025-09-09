
import React from 'react';

interface LoaderProps {
  message: string;
}

const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-10">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-pine"></div>
      <p className="text-lg font-semibold text-text">{message}</p>
    </div>
  );
};

export default Loader;
