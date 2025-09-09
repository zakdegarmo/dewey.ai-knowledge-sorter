
import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { text, apiKey } = body;

  if (!apiKey) {
    return res.status(400).json({ error: "API key is required." });
  }

  if (!text) {
    return res.status(400).json({ error: "Text content is required." });
  }
  
  try {
    const ai = new GoogleGenAI({ apiKey });

    const ontologyReportSchema = {
      type: Type.OBJECT,
      properties: {
        "skos:prefLabel": { type: Type.STRING, description: "A concise, descriptive title for this document." },
        "skos:definition": { type: Type.STRING, description: "A 1-2 sentence summary of the main topic and outcome." },
        "Self": { type: Type.STRING, description: "Define the role and identity of the document (e.g., 'A technical manual for...')." },
        "Thought": { type: Type.STRING, description: "Describe the primary thought process or intellectual journey within the document." },
        "Logic": { type: Type.STRING, description: "Explain the core logic, reasoning, or structure presented." },
        "Unity": { type: Type.STRING, description: "Describe any state of collaboration or synthesis achieved or discussed." },
        "Existence": { type: Type.STRING, description: "What new concept or reality was brought into existence or described?" },
        "Improvement": { type: Type.STRING, description: "How did this document aim to improve understanding or a process?" },
        "Mastery": { type: Type.STRING, description: "What concept or skill was mastered or significantly advanced in the text?" },
        "Resonance": { type: Type.STRING, description: "Describe the document's connection to broader goals or external ideas." },
        "Transcendence": { type: Type.STRING, description: "Does this document lead to a higher level of understanding or a breakthrough insight?" },
        "Everything": { type: Type.STRING, description: "Provide a holistic closing statement about the document's overall value and context." }
      },
      required: ["skos:prefLabel", "skos:definition", "Self", "Thought", "Logic", "Unity", "Existence", "Improvement", "Mastery", "Resonance", "Transcendence", "Everything"]
    };

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "A concise, descriptive title for the text, like a book title." },
        summary: { type: Type.STRING, description: "A detailed, multi-paragraph summary of the provided text." },
        keywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 5-10 single-word or short-phrase keywords representing the main topics." },
        ddc: {
          type: Type.OBJECT,
          description: "The Dewey Decimal Classification for the text.",
          properties: {
            number: { type: Type.STRING, description: "The specific 3-digit Dewey Decimal number (e.g., '512')." },
            name: { type: Type.STRING, description: "The name of the specific classification (e.g., 'Algebra')." },
            path: {
              type: Type.ARRAY,
              description: "An array representing the hierarchy from main class to the specific number.",
              items: {
                type: Type.OBJECT,
                properties: {
                  number: { type: Type.STRING, description: "The DDC number for this level (e.g., '500', '510', '512')." },
                  name: { type: Type.STRING, description: "The name of the DDC class (e.g., 'Science', 'Mathematics', 'Algebra')." }
                }
              }
            }
          }
        },
        ontologyReport: ontologyReportSchema
      },
      required: ["title", "summary", "keywords", "ddc", "ontologyReport"]
    };

    const prompt = `Analyze the following text and provide a structured JSON output. Based on the content, you must:
1.  Create a suitable title.
2.  Write a comprehensive summary.
3.  Extract the most relevant keywords.
4.  Determine the most accurate Dewey Decimal Classification (DDC), providing the full hierarchical path. For example, for a text on algebra, the path would include 500 (Science), 510 (Mathematics), and 512 (Algebra).
5.  Generate an NLD_ONTOLOGICAL_REPORT by interpreting the text through the 10 core concepts provided in the schema. Answer the competency question associated with each concept based on the text's content.

Here is the text to analyze:
---
${text}
---
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        },
    });
    
    const jsonString = response.text;
    const cleanedJsonString = jsonString.replace(/^```json\s*|```\s*$/g, '').trim();
    const parsed = JSON.parse(cleanedJsonString);

    return res.status(200).json(parsed);

  } catch (error) {
    console.error("Error in Vercel serverless function:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return res.status(500).json({ error: "Failed to process document with AI.", details: errorMessage });
  }
}
