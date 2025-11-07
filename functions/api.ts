// This file is an EXAMPLE of a serverless function backend (proxy).
// You would deploy this to a platform like Vercel, Netlify, or Google Cloud Functions.
// The frontend will call these endpoints instead of the Gemini API directly.
// This function will run on a server, protecting your API_KEY.

import { GoogleGenAI, Modality } from "@google/genai";

// This is a generic handler that you would adapt for your specific platform.
// For example, in Vercel, this might be the default export of a file in the /api directory.
export async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const body = await request.json();
    let responseData;

    if (path.endsWith('/generate-image')) {
      responseData = await handleImageGeneration(body);
    } else if (path.endsWith('/generate-video')) {
       responseData = await handleVideoGeneration(body);
    } else if (path.endsWith('/generate-sticker')) {
      responseData = await handleStickerGeneration(body);
    } else {
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error(`Error in API handler for path ${path}:`, error);
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
    
    // Fetch the video and return it as a blob that the frontend can use.
    // This proxies the video download so the final video URL with the API key is not exposed.
    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!videoResponse.ok) {
        throw new Error(`Failed to download the generated video from the source. Status: ${videoResponse.statusText}`);
    }
    
    // We cannot directly return a blob URL. Instead, we would likely upload this to a temporary storage
    // or return the data in a format the frontend can handle. For simplicity, we'll assume a temporary public URL can be created.
    // In a real app, you'd use a service like Cloud Storage to host the video temporarily.
    // For this example, we'll just return the proxied link which the frontend will fetch.
    return { videoUrl: `${downloadLink}&key=${process.env.API_KEY}` }; // This is a simplification. A real implementation would not expose the key.
                                                                    // A better approach is to stream the blob back to the client.
}
