import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Book, DdcNode } from './types';
import { useLibrary } from './hooks/useLibrary';
import { processTextDocument } from './services/geminiService';
import FileUpload from './components/FileUpload';
import LibraryBrowser from './components/LibraryBrowser';
import BookView from './components/BookView';
import ApiSnippet from './components/ApiSnippet';
import Loader from './components/Loader';
import { LogoIcon } from './components/icons/LogoIcon';
import ApiKeyInput from './components/ApiKeyInput';
import { nanoid } from 'nanoid';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

function collectBooksFromTree(node: DdcNode): Book[] {
  let books = [...node.books];
  node.children.forEach(child => {
    books = books.concat(collectBooksFromTree(child));
  });
  return books;
}

const App: React.FC = () => {
  const { library, addBook, isLibraryInitialized, setLibrary } = useLibrary();
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const importInputRef = useRef<HTMLInputElement | null>(null);

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

      // Create new Book object
      const newBook: Book = {
        id: nanoid(),
        callNumber: processedData.ddc.number,
        title: processedData.title,
        summary: processedData.summary,
        originalText: text,
        keywords: processedData.keywords,
        ddc: processedData.ddc,
        ontologyReport: processedData.ontologyReport,
        jsonLd: {}, // or whatever you use here
        fileContent: text, // <-- Store file content here
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

  const handleBatchFileProcess = useCallback(async (files: File[]) => {
    for (const file of files) {
      await handleFileProcess(file);
    }
  }, [handleFileProcess]);

  const handleExportLibrary = () => {
    const blob = new Blob([JSON.stringify(library, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'library.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportLibrary = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      for (const file of Array.from(e.target.files)) {
        const text = await file.text();
        try {
          const importedLibrary: DdcNode = JSON.parse(text);
          const books = collectBooksFromTree(importedLibrary);
          books.forEach(book => addBook(book));
        } catch (err) {
          setError("Failed to import library. Invalid file format.");
        }
      }
    }
  };

  // Example: Export the library as a ZIP of folders and book files
  function addNodeToZip(node: DdcNode, path: string, zip: JSZip) {
    node.books.forEach(book => {
      zip.file(`${path}/${book.title || book.id}.json`, JSON.stringify(book, null, 2));
    });
    node.children.forEach(child => {
      addNodeToZip(child, `${path}/${child.name}`, zip);
    });
  }

  const handleExportLibraryZip = () => {
    const zip = new JSZip();
    addNodeToZip(library, 'Library', zip);
    zip.generateAsync({ type: 'blob' }).then(content => {
      saveAs(content, 'dewey-library.zip');
    });
  };

  function exportLibraryAsZip(library: DdcNode) {
    const zip = new JSZip();
    addNodeToZip(library, 'Library', zip);
    zip.generateAsync({ type: 'blob' }).then(content => {
      saveAs(content, 'dewey-library.zip');
    });
  }
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
            <FileUpload
              onProcessFiles={handleBatchFileProcess}
              disabled={isLoading || !isLibraryInitialized}
            />
            <ApiSnippet library={library} />
            {error && (
              <div className="bg-love/20 border border-love text-rose p-4 rounded-lg">
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            )}
            <button
              className="mb-4 px-4 py-2 bg-pine text-white rounded hover:bg-pine/80"
              onClick={handleExportLibrary}
              disabled={library.length === 0}
            >
              Export Library as JSON
            </button>
            <input
              type="file"
              accept="application/json"
              style={{ display: 'none' }}
              ref={importInputRef}
              onChange={handleImportLibrary}
            />
            <button
              onClick={() => importInputRef.current?.click()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
            >
              Import Library
            </button>
            <button
              onClick={() => exportLibraryAsZip(library)}
              className="mb-4 px-4 py-2 bg-pine text-white rounded hover:bg-pine/80"
            >
              Download Library as ZIP
            </button>
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
