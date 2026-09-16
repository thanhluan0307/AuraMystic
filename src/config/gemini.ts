import { GoogleGenAI } from '@google/genai';

// API Key configured via EXPO_PUBLIC_GEMINI_API_KEY in .env
export const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

// Model to use
export const GEMINI_MODEL = 'gemini-3.6-flash';

// Initialize @google/genai instance
let aiClient: GoogleGenAI | null = null;
try {
  if (GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }
} catch (err) {
  console.warn('GoogleGenAI client init error:', err);
}

/**
 * Robust Gemini calling utility that uses @google/genai SDK,
 * with resilient fallback to Gemini REST endpoint if React Native / Hermes
 * lacks certain Node.js primitives.
 */
export async function generateAIText(
  prompt: string,
  systemInstruction?: string,
  onChunk?: (chunk: string, accumulated: string) => void
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Chưa cấu hình API Key Gemini. Vui lòng thêm EXPO_PUBLIC_GEMINI_API_KEY vào file .env.');
  }

  // If streaming callback provided, use streaming flow
  if (onChunk) {
    return generateAITextStream(prompt, systemInstruction, onChunk);
  }

  // First attempt: Official @google/genai SDK
  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: systemInstruction
          ? {
              systemInstruction: {
                parts: [{ text: systemInstruction }],
              },
            }
          : undefined,
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (sdkError: any) {
      console.warn('SDK call warning, attempting fallback:', sdkError?.message || sdkError);
    }
  }

  // Fallback: Direct Gemini REST endpoint using standard fetch
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    const payload: any = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    };

    if (systemInstruction) {
      payload.system_instruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Gemini API HTTP ${res.status}: ${errBody}`);
    }

    const data = await res.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (candidateText) {
      return candidateText;
    }
    throw new Error('Không nhận được câu trả lời hợp lệ từ Gemini.');
  } catch (error: any) {
    console.error('Gemini call failed:', error);
    throw new Error(error?.message || 'Lỗi khi kết nối với Vũ trụ Tâm linh (Gemini API).');
  }
}

/**
 * Stream Gemini AI response in real-time.
 * Invokes onChunk whenever a new chunk arrives.
 */
export async function generateAITextStream(
  prompt: string,
  systemInstruction?: string,
  onChunk?: (chunk: string, accumulated: string) => void
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Chưa cấu hình API Key Gemini. Vui lòng thêm EXPO_PUBLIC_GEMINI_API_KEY vào file .env.');
  }

  // First attempt: Official @google/genai SDK generateContentStream
  if (aiClient) {
    try {
      const responseStream = await aiClient.models.generateContentStream({
        model: GEMINI_MODEL,
        contents: prompt,
        config: systemInstruction
          ? {
              systemInstruction: {
                parts: [{ text: systemInstruction }],
              },
            }
          : undefined,
      });

      let accumulated = '';
      for await (const chunk of responseStream) {
        const text = chunk.text || '';
        if (text) {
          accumulated += text;
          if (onChunk) {
            onChunk(text, accumulated);
          }
        }
      }

      if (accumulated) {
        return accumulated;
      }
    } catch (sdkStreamError: any) {
      console.warn('SDK streaming call warning, falling back to REST:', sdkStreamError?.message || sdkStreamError);
    }
  }

  // Fallback: Fetch full response and deliver smooth flowing phrases to onChunk
  const fullText = await generateAIText(prompt, systemInstruction);
  if (onChunk) {
    // Deliver in phrases (6-8 words) at a comfortable 45ms cadence to keep UI at 60 FPS
    const words = fullText.split(' ');
    let running = '';
    const chunkSize = 6;
    for (let i = 0; i < words.length; i += chunkSize) {
      const piece = words.slice(i, i + chunkSize).join(' ') + ' ';
      running += piece;
      onChunk(piece, running.trim());
      await new Promise((r) => setTimeout(r, 45));
    }
    onChunk('', fullText);
  }
  return fullText;
}

