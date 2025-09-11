import React from 'react';
import { Book } from '../types';
import { FileIcon } from './icons/FileIcon';

interface RecentAdditionsProps {
  books: Book[];
}

const RecentAdditions: React.FC<RecentAdditionsProps> = ({ books }) => {
  if (books.length === 0) {
    return null;
  }

  return (
    <div className="bg-surface rounded-lg p-6 border border-overlay">
      <h2 className="text-xl font-bold mb-4 text-text">Recent Additions</h2>
      <ul className="space-y-3">
        {books.map((book) => (
          <li key={book.id} className="flex items-center gap-3 text-sm">
            <FileIcon className="h-5 w-5 text-pine" />
            <span className="flex-grow text-text truncate" title={book.title}>
              {book.title}
            </span>
            <span className="font-mono text-xs bg-base px-2 py-1 rounded-md text-muted">
              {book.ddc.number}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentAdditions;
