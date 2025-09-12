import { useState, useCallback, useEffect } from 'react';
import { Book, DdcNode, DdcInfo, DdcConcept } from '../types';
import { ddcData } from '../data/ddcData';

// Creates a simple root node for the library.
const createInitialLibrary = (): DdcNode => {
    return {
        id: 'root',
        name: 'Library',
        children: [],
        books: [],
        config: {
            "@context": { "schema": "http://schema.org/" },
            "@id": "urn:library:root",
            "@type": "schema:Library",
            "name": "Dewey.ai Knowledge Library"
        }
    };
};

// Places a book into the library using a fractal path based on its DDC number.
const placeBookInLibrary = (library: DdcNode, book: Book): DdcNode => {
  const newLibrary = JSON.parse(JSON.stringify(library));
  let currentNode = newLibrary;

  // Convert DDC number into a path, e.g., "005.13" -> ["0", "0", "5", "1", "3"]
  const pathParts = book.ddc.number.replace(/\./g, '').split('');
  let cumulativePath = '';

  // Create a nested folder for each digit in the path.
  for (const part of pathParts) {
    cumulativePath += part;
    let childNode = currentNode.children.find(c => c.id === cumulativePath);

    if (!childNode) {
      let name = cumulativePath;
      // Find the most relevant semantic name for the current path.
      const ddcInfo = ddcData.find(d => d.notation === cumulativePath) || 
                      ddcData.find(d => d.notation === `${cumulativePath}0`) || 
                      ddcData.find(d => d.notation === `${cumulativePath}00`);

      if (ddcInfo) {
        name = `${cumulativePath} - ${ddcInfo.prefLabel.en}`;
      }

      childNode = {
        id: cumulativePath,
        name: name,
        children: [],
        books: [],
        config: {
            "@context": { "schema": "http://schema.org/", "dc": "http://purl.org/dc/terms/", "dewey": "http://purl.org/NET/decimalised#" },
            "@id": `urn:library:class:${cumulativePath}`,
            "@type": "schema:CollectionPage",
            "name": ddcInfo?.prefLabel.en || cumulativePath,
            "dewey:notation": cumulativePath
        }
      };
      currentNode.children.push(childNode);
      // Sort children numerically to ensure correct order.
      currentNode.children.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
    }
    currentNode = childNode;
  }

  // Add the book to the final node in the path.
  if (!currentNode.books.some(b => b.id === book.id)) {
    currentNode.books.push(book);
  }
  
  return newLibrary;
}

export const useLibrary = () => {
  const [library, setLibrary] = useState<DdcNode>(createInitialLibrary());
  const [isLibraryInitialized, setIsLibraryInitialized] = useState(false);

  const addBook = useCallback((book: Book) => {
    setLibrary(currentLibrary => placeBookInLibrary(currentLibrary, book));
  }, []);

  useEffect(() => {
    const fetchAndRebuildLibrary = async () => {
      try {
        const response = await fetch('/data/library.json');
        if (response.ok) {
          const loadedLibrary = await response.json();
          
          const collectBooks = (node: DdcNode): Book[] => {
            let books = [...node.books];
            for (const child of node.children) {
              books = books.concat(collectBooks(child));
            }
            return books;
          };
          const allBooks = collectBooks(loadedLibrary);
          
          let newLibrary = createInitialLibrary();
          allBooks.forEach(book => {
            newLibrary = placeBookInLibrary(newLibrary, book);
          });
          setLibrary(newLibrary);
        }
      } catch (error) {
        // It's okay if the default library doesn't exist.
        console.log("No default library found. Starting fresh.");
      } finally {
        setIsLibraryInitialized(true);
      }
    };

    fetchAndRebuildLibrary();
  }, []);

  return { library, addBook, isLibraryInitialized };
};