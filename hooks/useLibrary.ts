
import { useState, useCallback, useEffect } from 'react';
import { Book, DdcNode, DdcInfo } from '../types';
import { ddcData } from '/public/data/ddcData';

const createInitialLibrary = (): DdcNode => {
    const root: DdcNode = {
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
    
    const mainClasses = ddcData
        .filter(item => /^\d00$/.test(item.notation))
        .sort((a, b) => a.notation.localeCompare(b.notation));

    mainClasses.forEach(c => {
        const number = c.notation;
        const name = c.prefLabel.en;
        root.children.push({
            id: number,
            name: `${number} - ${name}`,
            children: [],
            books: [],
            config: {
                 "@context": {
                    "schema": "http://schema.org/",
                    "dc": "http://purl.org/dc/terms/",
                    "dewey": "http://purl.org/NET/decimalised#"
                  },
                "@id": `urn:library:class:${number}`,
                "@type": "schema:CollectionPage",
                "name": name,
                "dewey:notation": number,
                ...(c.scopeNote?.en && { "schema:description": c.scopeNote.en.join(' ') })
            }
        });
    });

    return root;
};

export const useLibrary = () => {
  const [library, setLibrary] = useState<DdcNode>(createInitialLibrary());
  const [isLibraryInitialized, setIsLibraryInitialized] = useState(true);

  const addBook = useCallback((book: Book) => {
    setLibrary(currentLibrary => {
      const newLibrary = JSON.parse(JSON.stringify(currentLibrary));
      let currentNode = newLibrary;

      book.ddc.path.forEach((pathPart: DdcInfo) => {
        let childNode = currentNode.children.find((c: DdcNode) => c.id === pathPart.number);
        if (!childNode) {
          const ddcInfo = ddcData.find(d => d.notation === pathPart.number);
          childNode = {
            id: pathPart.number,
            name: `${pathPart.number} - ${pathPart.name}`,
            children: [],
            books: [],
            config: {
                "@context": {
                    "schema": "http://schema.org/",
                    "dc": "http://purl.org/dc/terms/",
                    "dewey": "http://purl.org/NET/decimalised#"
                  },
                "@id": `urn:library:class:${pathPart.number}`,
                "@type": "schema:CollectionPage",
                "name": pathPart.name,
                "dewey:notation": pathPart.number,
                ...(ddcInfo?.scopeNote?.en && { "schema:description": ddcInfo.scopeNote.en.join(' ') })
            }
          };
          currentNode.children.push(childNode);
          currentNode.children.sort((a,b) => a.id.localeCompare(b.id));
        }
        currentNode = childNode;
      });

      currentNode.books.push(book);
      return newLibrary;
    });
  }, []);

  return { library, addBook, isLibraryInitialized };
};
