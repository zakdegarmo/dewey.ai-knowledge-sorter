
import React, { useState } from 'react';
import { DdcNode, Book } from '../types';
import { FolderIcon } from './icons/FolderIcon';
import { FileIcon } from './icons/FileIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface DdcNodeViewProps {
  node: DdcNode;
  onSelectBook: (book: Book) => void;
  level: number;
}

const DdcNodeView: React.FC<DdcNodeViewProps> = ({ node, onSelectBook, level }) => {
  const [isOpen, setIsOpen] = useState(level < 1); // Auto-open the root and main classes

  const hasContent = node.children.length > 0 || node.books.length > 0;

  return (
    <div style={{ paddingLeft: level > 0 ? '1rem' : '0' }}>
      <div
        className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-overlay transition-colors ${hasContent ? '' : 'text-muted'}`}
        onClick={() => hasContent && setIsOpen(!isOpen)}
      >
        {hasContent ? (
           <ChevronRightIcon className={`w-5 h-5 mr-2 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
        ) : (
           <div className="w-5 h-5 mr-2" /> 
        )}
        <FolderIcon className="w-5 h-5 mr-2 text-gold" />
        <span className="font-medium text-text">{node.name}</span>
      </div>
      {isOpen && hasContent && (
        <div className="mt-1 border-l-2 border-overlay/50">
          {node.children.map(child => (
            <DdcNodeView key={child.id} node={child} onSelectBook={onSelectBook} level={level + 1} />
          ))}
          {node.books.map(book => (
            <div
              key={book.id}
              onClick={() => onSelectBook(book)}
              className="flex items-center p-2 rounded-md cursor-pointer hover:bg-overlay transition-colors"
              style={{ paddingLeft: '1rem' }}
            >
              <div className="w-5 h-5 mr-2"/>
              <FileIcon className="w-5 h-5 mr-2 text-iris" />
              <span className="text-subtle">{book.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface LibraryBrowserProps {
  rootNode: DdcNode;
  onSelectBook: (book: Book) => void;
}

const LibraryBrowser: React.FC<LibraryBrowserProps> = ({ rootNode, onSelectBook }) => {
  if (!rootNode || (rootNode.children.length === 0 && rootNode.books.length === 0)) {
    return <div className="text-center text-muted p-8">Your library is empty. Upload a document to begin.</div>;
  }
  return <DdcNodeView node={rootNode} onSelectBook={onSelectBook} level={0} />;
};

export default LibraryBrowser;
