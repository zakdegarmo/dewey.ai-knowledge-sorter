
export interface DdcInfo {
  number: string;
  name: string;
}

export interface DdcClassification {
  number: string;
  name: string;
  path: DdcInfo[];
}

export interface OntologyReport {
  "skos:prefLabel": string;
  "skos:definition": string;
  "Self": string;
  "Thought": string;
  "Logic": string;
  "Unity": string;
  "Existence": string;
  "Improvement": string;
  "Mastery": string;
  "Resonance": string;
  "Transcendence": string;
  "Everything": string;
}

export interface Book {
  id: string;
  callNumber: string;
  title: string;
  summary: string;
  originalText: string;
  keywords: string[];
  ddc: DdcClassification;
  ontologyReport: OntologyReport;
  jsonLd: Record<string, any>;
  fileContent: string;
}

export interface DdcNode {
  id: string;
  name: string;
  children: DdcNode[];
  books: Book[];
  config: Record<string, any>;
}

export interface GeminiResponse {
  title: string;
  summary: string;
  keywords: string[];
  ddc: DdcClassification;
  ontologyReport: OntologyReport;
}

export interface DdcConcept {
  id: string;
  prefLabel: { [lang: string]: string };
  inScheme: string;
  created: string;
  type: string;
  broader?: string;
  narrower?: string[];
  notation: string;
  modified: string;
  scopeNote?: { [lang: string]: string[] };
  '@context': string;
}
