// This file is a Vercel serverless function that acts as a backend proxy.
// It should be placed in the /api directory.
// Vercel will automatically create an endpoint at /api/api for this function.

import { GoogleGenAI, Modality } from "@google/genai";

// This is the main handler for the Vercel serverless function.
// It expects a POST request.
export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const body = await request.json();
    const { action } = body;
    let responseData;

    switch (action) {
      case 'generate-image':
        responseData = await handleImageGeneration(body);
        break;
      case 'generate-video':
        responseData = await handleVideoGeneration(body);
        break;
      case 'generate-sticker':
        responseData = await handleStickerGeneration(body);
        break;
      default:
        return new Response(JSON.stringify({ error: 'Invalid action specified' }), { status: 400 });
    }

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error(`Error in API handler:`, error);
    return new Response(JSON.stringify({ error: error.message || 'An internal server error occurred.' }), { status: 500 });
  }
}

// --- Image Generation Logic ---
async function handleImageGeneration(body: { base64ImageData: string; mimeType: string }) {
  const { base64ImageData, mimeType } = body;
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64ImageData, mimeType } },
        { text: `Edite a imagem de forma fotorrealista para que a pessoa esteja vestindo a camisa oficial do Grêmio, sem logos de patrocinadores. O modelo é o tradicional, com listras verticais azuis e pretas. A edição precisa ser perfeita, respeitando a iluminação, sombras e o caimento do tecido no corpo da pessoa.` },
      ],
    },
    config: { responseModalities: [Modality.IMAGE] },
  });

  const imageData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!imageData) {
    throw new Error('API did not return image data.');
  }
  return { imageData };
}

// --- Sticker Generation Logic ---
async function handleStickerGeneration(body: { base64ImageData: string; mimeType: string }) {
    const { base64ImageData, mimeType } = body;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                { inlineData: { data: base64ImageData, mimeType: mimeType } },
                { text: 'Transforme esta imagem em uma figurinha de WhatsApp. Remova completamente o fundo, tornando-o transparente. Adicione uma fina borda branca ao redor da pessoa para dar o acabamento de sticker. O resultado deve ser um arquivo PNG com fundo transparente.' },
            ],
        },
        config: { responseModalities: [Modality.IMAGE] },
    });

    const imageData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!imageData) {
        throw new Error('API did not return sticker image data.');
    }
    return { imageData };
}

// --- Video Generation Logic ---
async function handleVideoGeneration(body: { base64ImageData: string; mimeType: string }) {
    const { base64ImageData, mimeType } = body;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: 'A pessoa nesta imagem está torcendo euforicamente por seu time de futebol, o Grêmio. Ela está cheia de paixão, celebrando um gol em um estádio lotado. O movimento deve ser cinematográfico e emocionante.',
        image: { imageBytes: base64ImageData, mimeType: mimeType },
        config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' },
    });

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    if (operation.error) {
        throw new Error(`Video generation operation failed: ${operation.error.message}`);
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error('Video generation finished but no download link was returned.');
    }
    
    // The final URL to the video, including the necessary key for download.
    // The frontend will fetch this URL to get the video blob.
    const finalVideoUrl = `${downloadLink}&key=${process.env.API_KEY}`;
    return { videoUrl: finalVideoUrl };
}
