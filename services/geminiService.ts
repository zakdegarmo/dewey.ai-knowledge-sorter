
import { GeminiResponse } from '../types';

export const processTextDocument = async (text: string, apiKey: string): Promise<GeminiResponse> => {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, apiKey }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response.' }));
      throw new Error(`API request failed: ${response.statusText} - ${errorData.error || 'Unknown error'}`);
    }

    const data = await response.json();
    
    // Basic validation to ensure the parsed object matches our expected structure.
    if (!data.title || !data.summary || !Array.isArray(data.keywords) || !data.ddc?.number || !data.ontologyReport) {
        throw new Error("AI response is missing required fields.");
    }

    return data as GeminiResponse;

  } catch (error) {
    console.error("Error calling backend service:", error);
    throw new Error("Failed to communicate with the analysis service. Please check your connection and try again.");
  }
};
