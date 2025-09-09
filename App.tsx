
import React, { useState, useCallback, useEffect } from 'react';
import { Book } from './types';
import { useLibrary } from './hooks/useLibrary';
import { processTextDocument } from './services/geminiService';
import FileUpload from './components/FileUpload';
import LibraryBrowser from './components/LibraryBrowser';
import BookView from './components/BookView';
import ApiSnippet from './components/ApiSnippet';
import Loader from './components/Loader';
import { LogoIcon } from './components/icons/LogoIcon';
import ApiKeyInput from './components/ApiKeyInput';

const App: React.FC = () => {
  const { library, addBook, isLibraryInitialized } = useLibrary();
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');

  const handleFileProcess = useCallback(async (file: File) => {
    if (!apiKey) {
      setError("Please enter and save your Gemini API key before processing a file.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setLoadingMessage('Reading document...');
    try {
      const text = await file.text();
      setLoadingMessage('Analyzing content with AI...');
      const processedData = await processTextDocument(text, apiKey);
      
      setLoadingMessage('Generating call number...');
      const date = new Date();
      const dateString = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
      const serialNumber = (Math.floor(Math.random() * 900) + 100).toString();
      const callNumber = `${processedData.ddc.number}-${dateString}-${serialNumber}`;

      const newBook: Book = {
        id: callNumber,
        callNumber,
        title: processedData.title,
        summary: processedData.summary,
        originalText: text,
        keywords: processedData.keywords,
        ddc: processedData.ddc,
        ontologyReport: processedData.ontologyReport,
        jsonLd: {
          "@context": {
            "schema": "http://schema.org/",
            "dc": "http://purl.org/dc/terms/",
            "dewey": "http://purl.org/NET/decimalised#",
            "myo": "https://zakdegarmo.github.io/MyOntology/docs/"
          },
          "@type": "schema:Book",
          "@id": `urn:library:book:${callNumber}`,
          "dc:title": processedData.title,
          "dc:description": processedData.summary,
          "schema:text": text.substring(0, 500) + '...',
          "schema:keywords": processedData.keywords.join(', '),
          "dewey:class": processedData.ddc.number,
          "dewey:hasClassification": processedData.ddc.path.map(p => ({ "@type": "dewey:Class", "dewey:notation": p.number, "dc:title": p.name })),
          "myo:report": processedData.ontologyReport
        }
      };

      setLoadingMessage('Placing book on the virtual shelf...');
      addBook(newBook);

    } catch (err) {
      console.error("Processing failed:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during processing.");
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [addBook, apiKey]);

  return (
    <div className="min-h-screen bg-base font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-8 pb-4 border-b border-surface">
          <div className="flex items-center gap-4">
            <LogoIcon className="h-10 w-10 text-rose" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-text">Dewey.ai</h1>
              <p className="text-sm sm:text-md text-muted">Your Personal AI-Powered Knowledge Library</p>
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col gap-8">
            <ApiKeyInput apiKey={apiKey} setApiKey={setApiKey} />
            <FileUpload onProcessFile={handleFileProcess} disabled={isLoading || !isLibraryInitialized} />
            <ApiSnippet library={library} />
             {error && (
              <div className="bg-love/20 border border-love text-rose p-4 rounded-lg">
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            )}
          </div>

          <div className="bg-surface rounded-lg p-6 min-h-[500px] relative border border-overlay">
            <h2 className="text-xl font-bold mb-4 text-text">Library Collection</h2>
            {isLoading || !isLibraryInitialized ? (
              <Loader message={isLoading ? loadingMessage : 'Initializing Library...'} />
            ) : (
              <LibraryBrowser rootNode={library} onSelectBook={setSelectedBook} />
            )}
          </div>
        </main>
      </div>

      {selectedBook && (
        <BookView book={selectedBook} onClose={() => setSelectedBook(null)} />
      )}
    </div>
  );
};

export default App;
