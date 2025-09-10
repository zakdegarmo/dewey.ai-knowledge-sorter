import React, { useState, useCallback } from 'react';
import { Book } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';
import { downloadFile } from '../utils/fileUtils';
import { Tabs, Tab } from './ui/Tabs';

interface BookViewProps {
  book: Book;
  onClose: () => void;
}

type ActiveTab = 'summary' | 'ontology' | 'jsonld' | 'fileContent';

const BookView: React.FC<BookViewProps> = ({ book, onClose }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('summary');
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(book.jsonLd, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [book.jsonLd]);
  
  const handleDownload = () => {
    downloadFile(
      JSON.stringify(book.jsonLd, null, 2), 
      `${book.callNumber}.jsonld`, 
      'application/ld+json'
    );
  };

  const renderOntologyReport = () => (
    <div className="space-y-4 text-sm">
      {Object.entries(book.ontologyReport).map(([key, value]) => {
          const cleanKey = key.replace('skos:', '');
          return (
            <div key={key}>
              <h4 className="font-semibold text-subtle capitalize">{cleanKey}</h4>
              <p className="text-text leading-relaxed">{value}</p>
            </div>
          )
      })}
    </div>
  );


  return (
    <div
      className="fixed inset-0 bg-base/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-surface w-full max-w-3xl max-h-[90vh] rounded-lg border border-overlay shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-overlay">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-text truncate">{book.title}</h2>
            <p className="text-sm text-iris font-mono">{book.callNumber}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-overlay text-muted hover:text-text transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-4">
              <p className="text-subtle font-semibold mb-2">DDC Classification Path:</p>
              <div className="flex flex-wrap items-center text-sm text-gold">
                  {book.ddc.path.map((p, i) => (
                      <React.Fragment key={p.number}>
                          <span>{p.name} ({p.number})</span>
                          {i < book.ddc.path.length - 1 && <span className="mx-2 text-muted">&gt;</span>}
                      </React.Fragment>
                  ))}
              </div>
          </div>
        
          <div className="mb-6">
            <p className="text-subtle font-semibold mb-2">Keywords:</p>
            <div className="flex flex-wrap gap-2">
              {book.keywords.map((kw, i) => (
                <span key={i} className="bg-overlay px-3 py-1 text-sm rounded-full text-foam">
                  {kw}
                </span>
              ))}
            </div>
          </div>

          <div className="border-b border-overlay mb-4">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'summary' ? 'border-rose text-rose' : 'border-transparent text-muted hover:text-text hover:border-muted'}`}
              >
                Summary
              </button>
              <button
                onClick={() => setActiveTab('ontology')}
                className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'ontology' ? 'border-rose text-rose' : 'border-transparent text-muted hover:text-text hover:border-muted'}`}
              >
                Ontology Report
              </button>
              <button
                onClick={() => setActiveTab('jsonld')}
                className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'jsonld' ? 'border-rose text-rose' : 'border-transparent text-muted hover:text-text hover:border-muted'}`}
              >
                JSON-LD Data
              </button>
              <button
                onClick={() => setActiveTab('fileContent')}
                className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'fileContent' ? 'border-rose text-rose' : 'border-transparent text-muted hover:text-text hover:border-muted'}`}
              >
                File Content
              </button>
            </nav>
          </div>

          <div>
            {activeTab === 'summary' && (
              <div className="prose prose-invert max-w-none text-text whitespace-pre-wrap leading-relaxed">
                {book.summary}
              </div>
            )}
            {activeTab === 'ontology' && renderOntologyReport()}
            {activeTab === 'jsonld' && (
              <div>
                <div className="relative">
                  <pre className="bg-base p-4 rounded-md text-sm text-foam overflow-x-auto">
                    <code>{JSON.stringify(book.jsonLd, null, 2)}</code>
                  </pre>
                  <button onClick={handleCopy} className="absolute top-2 right-2 p-2 rounded-md bg-overlay hover:bg-highlight-high text-muted hover:text-text">
                    {copied ? <CheckIcon className="w-5 h-5 text-foam" /> : <ClipboardIcon className="w-5 h-5" />}
                  </button>
                </div>
                <button onClick={handleDownload} className="mt-4 px-4 py-2 bg-iris text-text rounded-md font-bold hover:bg-iris/80 transition-colors">Download JSON-LD</button>
              </div>
            )}
            {activeTab === 'fileContent' && (
              <div>
                <pre className="whitespace-pre-wrap break-words bg-gray-100 p-4 rounded">
                  {book.fileContent}
                </pre>
                <button
                  onClick={() => {
                    const blob = new Blob([book.fileContent], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${book.title || 'book'}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="mt-4 px-4 py-2 bg-iris text-text rounded-md font-bold hover:bg-iris/80 transition-colors"
                >
                  Download Original File
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookView;
