// IMPORTANT: This file has been modified to work with a backend proxy.
// This is the secure way to handle API keys for a public application.
// The direct calls to the Gemini API have been replaced with fetch requests
// to your own serverless functions.

async function callApi<T>(endpoint: string, body: object): Promise<T> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export async function generateGremioImage(base64ImageData: string, mimeType: string): Promise<string | null> {
  try {
    const { imageData } = await callApi<{ imageData: string }>('/api/generate-image', {
      base64ImageData,
      mimeType,
    });
    return imageData;
  } catch (error: any) {
    console.error("Error calling backend for image generation:", error);
    throw new Error(error.message || "Falha ao se comunicar com o servidor para gerar a imagem.");
  }
}

export async function generateGremioVideo(base64ImageData: string, mimeType: string): Promise<string> {
    try {
        const { videoUrl } = await callApi<{ videoUrl: string }>('/api/generate-video', {
            base64ImageData,
            mimeType,
        });

        // The backend will return a temporary URL or a proxied blob URL.
        // For simplicity, we assume the backend returns a blob URL that can be used directly.
        // If the backend returns raw blob data, we'd convert it here.
        const response = await fetch(videoUrl);
         if (!response.ok) {
            throw new Error(`Falha ao baixar o vídeo do servidor. Status: ${response.statusText}`);
        }
        const videoBlob = await response.blob();
        return URL.createObjectURL(videoBlob);

    } catch (error: any) {
        console.error("Error calling backend for video generation:", error);
        throw new Error(error.message || "Falha ao se comunicar com o servidor para gerar o vídeo.");
    }
}


export async function generateStickerImage(base64ImageData: string, mimeType: string): Promise<string | null> {
  try {
    const { imageData } = await callApi<{ imageData: string }>('/api/generate-sticker', {
      base64ImageData,
      mimeType,
    });
    return imageData;
  } catch (error: any)
  {
    console.error("Error calling backend for sticker generation:", error);
    throw new Error(error.message || "Falha ao criar a figurinha através do servidor.");
  }
}
