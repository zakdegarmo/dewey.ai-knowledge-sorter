
import React, { useState, useEffect } from 'react';

interface ApiKeyInputProps {
  apiKey: string;
  setApiKey: (key: string) => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ apiKey, setApiKey }) => {
  const [localKey, setLocalKey] = useState(apiKey);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const storedKey = sessionStorage.getItem('gemini-api-key');
    if (storedKey) {
      setApiKey(storedKey);
      setLocalKey(storedKey);
      setIsSaved(true);
    }
  }, [setApiKey]);
  
  useEffect(() => {
      setIsSaved(apiKey === localKey && !!localKey);
  }, [localKey, apiKey]);


  const handleSave = () => {
    sessionStorage.setItem('gemini-api-key', localKey);
    setApiKey(localKey);
    setIsSaved(true);
  };

  return (
    <div className="bg-surface rounded-lg p-4 border border-overlay">
      <label htmlFor="api-key-input" className="block text-sm font-medium text-subtle mb-2">
        Your Gemini API Key
      </label>
      <div className="flex items-center gap-2">
        <input
          id="api-key-input"
          type="password"
          value={localKey}
          onChange={(e) => setLocalKey(e.target.value)}
          placeholder="Enter your API key here"
          className="flex-grow bg-base border border-overlay rounded-md px-3 py-2 text-text focus:ring-2 focus:ring-iris focus:outline-none"
        />
        <button
          onClick={handleSave}
          className={`px-4 py-2 text-text rounded-md font-bold transition-colors disabled:bg-muted/50 disabled:cursor-not-allowed ${isSaved ? 'bg-pine hover:bg-pine/80' : 'bg-iris hover:bg-iris/80'}`}
          disabled={!localKey}
        >
          {isSaved ? 'Saved' : 'Save'}
        </button>
      </div>
       <p className="text-xs text-muted mt-2">Your key is stored only in your browser for this session.</p>
    </div>
  );
};

export default ApiKeyInput;
