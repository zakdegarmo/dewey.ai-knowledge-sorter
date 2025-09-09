
import React, { useState, useCallback } from 'react';
import { DdcNode } from '../types';
import { downloadFile } from '../utils/fileUtils';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';
import { CodeIcon } from './icons/CodeIcon';

interface ApiSnippetProps {
  library: DdcNode;
}

const generateApiFunction = (library: DdcNode): string => {
  const libraryDataString = JSON.stringify(library, null, 2);

  return `
/**
 * ======================================================================
 * Dewey.ai Knowledge Query Function
 * ======================================================================
 * This self-contained function allows you to query the knowledge base
 * created by your Dewey.ai application.
 *
 * How to use:
 * 1. Save this code as a .js or .ts file in your project.
 * 2. Import and call the 'queryLibrary' function.
 * 3. This function operates on a static snapshot of the library data.
 *    To update, re-download this snippet from the Dewey.ai app.
 *
 * Example Usage:
 * 
 * const resultsByKeyword = await queryLibrary({ keyword: 'algebra' });
 * console.log(resultsByKeyword); 
 * // -> [{ title: '...', summary: '...', ... }]
 * 
 * const resultsByDDC = await queryLibrary({ ddc: '512' });
 * console.log(resultsByDDC);
 * // -> [{ title: '...', summary: '...', ... }]
 * 
 * To deploy on Vercel:
 * 1. Create an 'api' directory in your project.
 * 2. Save this file as 'api/query.js'.
 * 3. Your endpoint will be accessible at '/api/query'.
 * 4. The function below is pre-configured to handle Vercel serverless requests.
 */

const libraryData = ${libraryDataString};

// Helper function to recursively search for books
function searchNode(node, predicate, results) {
  // Check books in the current node
  node.books.forEach(book => {
    if (predicate(book)) {
      // Avoid duplicates
      if (!results.some(r => r.id === book.id)) {
        results.push(book);
      }
    }
  });

  // Recurse into children
  node.children.forEach(child => searchNode(child, predicate, results));
}

/**
 * Queries the library knowledge base.
 * @param {object} params - The query parameters.
 * @param {string} [params.keyword] - A keyword to search for in book titles, summaries, and keywords.
 * @param {string} [params.ddc] - A Dewey Decimal number to search for. Matches if the book's DDC starts with this number.
 * @returns {Promise<object[]>} A promise that resolves to an array of matching book objects.
 */
export async function queryLibrary({ keyword, ddc }) {
  const results = [];
  let predicate = () => false;
  const normalizedKeyword = keyword ? keyword.toLowerCase() : '';

  if (keyword) {
    predicate = (book) => 
      book.title.toLowerCase().includes(normalizedKeyword) ||
      book.summary.toLowerCase().includes(normalizedKeyword) ||
      book.keywords.some(kw => kw.toLowerCase().includes(normalizedKeyword));
  } else if (ddc) {
    predicate = (book) => book.ddc.number.startsWith(ddc);
  } else {
    return []; // No valid query parameter
  }
  
  searchNode(libraryData, predicate, results);
  return results;
}


/**
 * Vercel Serverless Function Handler (optional)
 * This handler exposes the queryLibrary function as an API endpoint.
 * It expects a GET request with 'keyword' or 'ddc' query parameters.
 * e.g., /api/query?keyword=science
 */
export default async function handler(req, res) {
  const { keyword, ddc } = req.query;

  if (!keyword && !ddc) {
    res.status(400).json({ error: 'Please provide a "keyword" or "ddc" query parameter.' });
    return;
  }

  try {
    const results = await queryLibrary({ keyword, ddc });
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while querying the library.' });
  }
}
  `.trim();
};

const ApiSnippet: React.FC<ApiSnippetProps> = ({ library }) => {
  const [copied, setCopied] = useState(false);
  const snippet = generateApiFunction(library);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [snippet]);
  
  const handleDownload = () => {
    downloadFile(snippet, 'dewey-ai-query.js', 'text/javascript');
  };

  return (
    <div className="bg-surface rounded-lg p-6 border border-overlay">
      <div className="flex items-center gap-3 mb-4">
        <CodeIcon className="w-6 h-6 text-iris"/>
        <h3 className="text-xl font-bold">Developer API Access</h3>
      </div>
      <p className="text-muted mb-4 text-sm">Download this self-contained JavaScript function to query your library's knowledge from any application or deploy it as a serverless function.</p>
      
      <div className="relative">
        <pre className="bg-base p-4 rounded-md text-sm text-subtle overflow-x-auto max-h-40">
          <code>
            {`// Example usage:\nimport { queryLibrary } from './dewey-ai-query.js';\n\nconst results = await queryLibrary({ ddc: '500' });\nconsole.log(results);`}
          </code>
        </pre>
        <button onClick={handleCopy} className="absolute top-2 right-2 p-2 rounded-md bg-overlay hover:bg-highlight-high text-muted hover:text-text">
            {copied ? <CheckIcon className="w-5 h-5 text-foam" /> : <ClipboardIcon className="w-5 h-5" />}
        </button>
      </div>
      <button 
        onClick={handleDownload}
        className="mt-4 w-full px-4 py-2 bg-iris text-text rounded-md font-bold hover:bg-iris/80 transition-colors"
      >
        Download Query Function
      </button>
    </div>
  );
};

export default ApiSnippet;
