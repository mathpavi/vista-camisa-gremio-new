import React, { useState, useRef, useCallback, useEffect } from 'react';
import { generateGremioImage, generateGremioVideo, generateStickerImage } from './services/geminiService';
import { logEvent, getStats, getLogs, clearData, incrementStat, Stats, LogEntry } from './utils/tracking';

// SVG Icon Components defined outside the main component to prevent re-renders
const CameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3" />
  </svg>
);

const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" x2="12" y1="3" y2="15" />
  </svg>
);

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.9 5.8-5.8 1.9 5.8 1.9 1.9 5.8 1.9-5.8 5.8-1.9-5.8-1.9z"/>
        <path d="M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0"/>
    </svg>
);

const VideoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m22 8-6 4 6 4V8Z" />
        <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
    </svg>
);

const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5" />
        <polyline points="12 19 5 12 12 5" />
    </svg>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" y2="3" />
    </svg>
);

const StickerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.5 10c-1.2-4.5-5.5-8-10.5-8A8.5 8.5 0 0 0 2.2 11.2c-1 .6-1.7 1.7-1.7 3 0 1.9 1.6 3.5 3.5 3.5h12.5a4.5 4.5 0 0 0 .5-9Z"/>
        <path d="M16 16.5c-2-1.5-5-1.5-7 0"/>
        <path d="M15 9.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z"/>
        <path d="M9 9.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z"/>
    </svg>
);

const AdminPanel: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [stats, setStats] = useState<Stats>({ images: 0, videos: 0, stickers: 0 });
    const [logs, setLogs] = useState<LogEntry[]>([]);

    const loadData = useCallback(() => {
        setStats(getStats());
        setLogs(getLogs());
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleClearData = () => {
        if (window.confirm("Tem certeza que deseja limpar todo o histórico e estatísticas? Esta ação não pode ser desfeita.")) {
            clearData();
            loadData();
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-6 p-4 text-white">
            <h2 className="text-3xl font-bold">Área Administrativa</h2>
            <p className="text-sm text-blue-300 -mt-4">Os dados são salvos localmente no seu navegador.</p>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-center">
                <div className="bg-black/30 p-4 rounded-lg border border-blue-400/50">
                    <h3 className="text-lg text-blue-200">Imagens Geradas</h3>
                    <p className="text-4xl font-bold">{stats.images}</p>
                </div>
                <div className="bg-black/30 p-4 rounded-lg border border-green-400/50">
                    <h3 className="text-lg text-green-200">Vídeos Gerados</h3>
                    <p className="text-4xl font-bold">{stats.videos}</p>
                </div>
                <div className="bg-black/30 p-4 rounded-lg border border-purple-400/50">
                    <h3 className="text-lg text-purple-200">Figurinhas Geradas</h3>
                    <p className="text-4xl font-bold">{stats.stickers}</p>
                </div>
            </div>

            {/* Logs */}
            <div className="w-full mt-6">
                <h3 className="text-2xl font-semibold mb-2">Histórico de Atividades</h3>
                <div className="bg-black/30 p-4 rounded-lg border border-white/20 max-h-60 overflow-y-auto">
                    {logs.length > 0 ? (
                        <ul className="space-y-2">
                            {logs.map((log, index) => (
                                <li key={index} className="flex justify-between items-center text-sm p-2 bg-black/20 rounded">
                                    <span>{log.event}</span>
                                    <span className="text-blue-300">{new Date(log.timestamp).toLocaleString()}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-blue-200">Nenhuma atividade registrada ainda.</p>
                    )}
                </div>
            </div>

            <div className="flex gap-4 mt-6">
                 <button onClick={onBack} className="flex items-center justify-center gap-2 bg-blue-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-blue-600 transition-all duration-300">
                    <BackIcon/> Voltar
                </button>
                <button onClick={handleClearData} className="bg-red-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-red-700 transition-all duration-300">
                    Limpar Dados Locais
                </button>
            </div>
        </div>
    );
};


const App: React.FC = () => {
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
    const [isGeneratingVideo, setIsGeneratingVideo] = useState<boolean>(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [videoError, setVideoError] = useState<string | null>(null);
    const [isGeneratingSticker, setIsGeneratingSticker] = useState<boolean>(false);
    const [stickerImage, setStickerImage] = useState<string | null>(null);
    const [stickerError, setStickerError] = useState<string | null>(null);
    const [view, setView] = useState<'main' | 'admin'>('main');

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const videoPlayerRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        logEvent('App Carregado');
    }, []);

    const stopCamera = useCallback(() => {
        setIsCameraActive(false);
    }, []);

    useEffect(() => {
        if (isCameraActive) {
            let active = true;
            const enableStream = async () => {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
                    if (active && videoRef.current) {
                        videoRef.current.srcObject = stream;
                        streamRef.current = stream;
                        setError(null);
                    } else {
                        stream.getTracks().forEach(track => track.stop());
                    }
                } catch (err) {
                    console.error("Error accessing camera:", err);
                    setError("Não foi possível acessar a câmera. Verifique as permissões do seu navegador.");
                    if(active) setIsCameraActive(false);
                }
            };
            enableStream();
            
            return () => {
                active = false;
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                    streamRef.current = null;
                }
            };
        }
    }, [isCameraActive]);
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setOriginalImage(reader.result as string);
                setError(null);
                logEvent('Imagem Enviada');
            };
            reader.onerror = () => {
                setError('Falha ao ler o arquivo de imagem.');
            }
            reader.readAsDataURL(file);
        }
    };
    
    const startCamera = () => {
        setIsCameraActive(true);
        logEvent('Câmera Iniciada');
    };
    
    const takePicture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.translate(canvas.width, 0);
                context.scale(-1, 1);
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
            }
            const dataUrl = canvas.toDataURL('image/jpeg');
            setOriginalImage(dataUrl);
            stopCamera();
            logEvent('Foto Capturada');
        }
    };
    
    const handleGremiofy = async () => {
        if (!originalImage) return;

        const hasApiKey = await window.aistudio.hasSelectedApiKey();
        if (!hasApiKey) {
            await window.aistudio.openSelectKey();
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);
        try {
            const [header, base64Data] = originalImage.split(',');
            const mimeType = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
            
            const newImageBase64 = await generateGremioImage(base64Data, mimeType);
            if (newImageBase64) {
              setGeneratedImage(`data:image/png;base64,${newImageBase64}`);
              incrementStat('images');
              logEvent('Imagem Gerada');
            } else {
              throw new Error("A API não retornou uma imagem.")
            }
        } catch (err: any) {
            let errorMessage = err.message || 'Ocorreu um erro ao gerar a imagem.';
             if (errorMessage.includes('API key not valid') || errorMessage.includes('permission to use this API') || errorMessage.includes('entity was not found')) {
                errorMessage = "Chave de API inválida. Por favor, selecione uma chave válida e tente novamente.";
                await window.aistudio.openSelectKey();
            }
            setError(errorMessage);
            logEvent('Erro ao Gerar Imagem');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateVideo = async () => {
        if (!generatedImage) return;

        const hasApiKey = await window.aistudio.hasSelectedApiKey();
        if (!hasApiKey) {
            await window.aistudio.openSelectKey();
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        setIsGeneratingVideo(true);
        setVideoError(null);
        try {
            const [header, base64Data] = generatedImage.split(',');
            const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
            const url = await generateGremioVideo(base64Data, mimeType);
            setVideoUrl(url);
            incrementStat('videos');
            logEvent('Vídeo Gerado');
        } catch (err: any) {
             let errorMessage = err.message || 'Ocorreu um erro ao gerar o vídeo.';
            if (errorMessage.includes('Requested entity was not found')) {
                errorMessage = "Chave de API inválida. Por favor, selecione uma chave válida e tente novamente.";
                await window.aistudio.openSelectKey();
            }
            setVideoError(errorMessage);
            logEvent('Erro ao Gerar Vídeo');
            console.error(err);
        } finally {
            setIsGeneratingVideo(false);
        }
    };

    const handleGenerateSticker = async () => {
        if (!generatedImage) return;
        setIsGeneratingSticker(true);
        setStickerError(null);
        setStickerImage(null);

        try {
            const [header, base64Data] = generatedImage.split(',');
            const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
            const stickerData = await generateStickerImage(base64Data, mimeType);
            if (stickerData) {
                setStickerImage(`data:image/png;base64,${stickerData}`);
                incrementStat('stickers');
                logEvent('Figurinha Gerada');
            } else {
                throw new Error("A API não retornou uma imagem de figurinha.");
            }
        } catch (err: any) {
            setStickerError(err.message || "Ocorreu um erro ao gerar a figurinha.");
            logEvent('Erro ao Gerar Figurinha');
            console.error(err);
        } finally {
            setIsGeneratingSticker(false);
        }
    };

    const handleSaveVideo = () => {
        if (!videoUrl) return;
        const a = document.createElement('a');
        a.href = videoUrl;
        a.download = 'video_gremio.mp4';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        logEvent('Vídeo Salvo');
    };

    const reset = () => {
        setOriginalImage(null);
        setGeneratedImage(null);
        setIsLoading(false);
        setError(null);
        stopCamera();
        setIsGeneratingVideo(false);
        setVideoUrl(null);
        setVideoError(null);
        setIsGeneratingSticker(false);
        setStickerImage(null);
        setStickerError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        if (videoUrl) {
            URL.revokeObjectURL(videoUrl);
        }
        logEvent('App Reiniciado');
    };

    const renderInitialState = () => (
        <div className="text-center p-8">
            <h2 className="text-2xl font-semibold mb-2 text-white">Pronto para vestir o manto?</h2>
            <p className="text-blue-200 mb-8">Escolha como carregar a imagem.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 w-full sm:w-auto bg-white text-blue-900 font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-gray-200 transition-all duration-300 transform hover:scale-105">
                    <UploadIcon /> Enviar Foto
                </button>
                <button onClick={startCamera} className="flex items-center justify-center gap-2 w-full sm:w-auto bg-blue-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105">
                    <CameraIcon /> Usar Câmera
                </button>
            </div>
        </div>
    );
    
    const renderCameraState = () => (
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-4 p-4">
            <div className="w-full aspect-square md:aspect-video rounded-lg overflow-hidden bg-black border-4 border-blue-400 shadow-2xl">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform -scale-x-100"></video>
            </div>
            <div className="flex gap-4">
                <button onClick={takePicture} className="bg-blue-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-blue-600 transition-colors duration-300 transform hover:scale-105">
                    Tirar Foto
                </button>
                <button onClick={stopCamera} className="bg-gray-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-gray-700 transition-colors duration-300">
                    Cancelar
                </button>
            </div>
        </div>
    );
    
    const renderImageReadyState = () => (
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-6 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-center">
                <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-black/30 border-2 border-blue-300/50 shadow-lg flex items-center justify-center">
                    <img src={originalImage!} alt="Original" className="w-full h-full object-contain" />
                </div>
                <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-black/30 border-2 border-dashed border-blue-300/50 shadow-lg flex items-center justify-center p-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center text-white">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mb-4"></div>
                            <p className="text-lg">Mágica Tricolor em andamento...</p>
                            <p className="text-sm text-blue-200">Isso pode levar alguns segundos.</p>
                        </div>
                    ) : (
                        <div className="text-center text-blue-200">
                          <SparklesIcon />
                          <p>A imagem com a camisa do Grêmio aparecerá aqui.</p>
                        </div>
                    )}
                </div>
            </div>
             <div className="flex flex-col items-center gap-2 mt-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={handleGremiofy} disabled={isLoading} className="flex items-center justify-center gap-3 bg-blue-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 disabled:bg-blue-400 disabled:cursor-not-allowed disabled:scale-100">
                        <SparklesIcon/> {isLoading ? 'Gerando...' : 'Vestir Camisa do Grêmio!'}
                    </button>
                    <button onClick={reset} disabled={isLoading} className="flex items-center justify-center gap-2 bg-gray-200 text-gray-800 font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-gray-300 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed">
                       <BackIcon/> Mudar Foto
                    </button>
                </div>
                <p className="text-sm text-blue-200">A geração de imagem requer uma chave de API. <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">Saiba mais sobre cobrança.</a></p>
            </div>
        </div>
    );

    const renderResultState = () => (
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-6 p-4">
            <h2 className="text-3xl font-bold text-white text-center">Puro Sentimento! 🔵⚫⚪</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <div className="flex flex-col items-center gap-2">
                    <h3 className="text-lg font-semibold text-blue-200">Antes</h3>
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-black/30 border-2 border-blue-300/50 shadow-lg">
                        <img src={originalImage!} alt="Original" className="w-full h-full object-contain" />
                    </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                     <h3 className="text-lg font-semibold text-blue-200">Depois</h3>
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-white/30 border-2 border-white/50 shadow-lg">
                        <img src={generatedImage!} alt="Gremio" className="w-full h-full object-contain" />
                    </div>
                </div>
            </div>
            
            {isGeneratingVideo ? (
                <VideoLoadingState />
            ) : (
                <div className="flex flex-col items-center w-full">
                    <div className="flex flex-col sm:flex-row gap-4 mt-6">
                        <button onClick={handleGenerateVideo} className="flex items-center justify-center gap-3 bg-green-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-105">
                            <VideoIcon/> Criar Vídeo da Torcida
                        </button>
                        <button onClick={reset} className="bg-white text-blue-900 font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-gray-200 transition-all duration-300 transform hover:scale-105">
                            Começar de Novo
                        </button>
                    </div>
                    <p className="text-sm text-blue-200 mt-2">A geração de vídeo requer uma chave de API. <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">Saiba mais sobre cobrança.</a></p>
                </div>
            )}
        </div>
    );

    const VideoLoadingState = () => {
        const messages = [
            "Convocando a torcida para a arquibancada...",
            "Ajustando o grito de gol...",
            "O Imortal está entrando em campo...",
            "Preparando a avalanche na geral...",
            "Só mais um instante, a vitória está próxima!"
        ];
        const [message, setMessage] = useState(messages[0]);

        useEffect(() => {
            const interval = setInterval(() => {
                setMessage(prev => {
                    const currentIndex = messages.indexOf(prev);
                    const nextIndex = (currentIndex + 1) % messages.length;
                    return messages[nextIndex];
                });
            }, 3000);
            return () => clearInterval(interval);
        }, []);

        return (
            <div className="flex flex-col items-center justify-center text-white text-center p-8">
                <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-400 mb-6"></div>
                <h2 className="text-2xl font-bold mb-2">Criando seu momento de glória!</h2>
                <p className="text-lg text-blue-200 transition-opacity duration-500">{message}</p>
                <p className="text-sm text-blue-300 mt-4">A geração de vídeo pode levar alguns minutos.</p>
            </div>
        );
    };

    const renderVideoResultState = () => (
         <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-6 p-4">
            <h2 className="text-3xl font-bold text-white text-center">Até a pé nós iremos! 🎶</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <div className="flex flex-col items-center gap-2">
                    <h3 className="text-lg font-semibold text-blue-200">Antes</h3>
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-black/30 border-2 border-blue-300/50 shadow-lg">
                        <img src={originalImage!} alt="Original" className="w-full h-full object-contain" />
                    </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                     <h3 className="text-lg font-semibold text-blue-200">Depois</h3>
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-white/30 border-2 border-white/50 shadow-lg">
                        <img src={generatedImage!} alt="Gremio" className="w-full h-full object-contain" />
                    </div>
                </div>
            </div>
            <div className="w-full max-w-3xl">
                <div className="w-full aspect-video rounded-lg overflow-hidden bg-black border-4 border-blue-400 shadow-2xl">
                    <video 
                        ref={videoPlayerRef}
                        src={videoUrl!} 
                        controls 
                        autoPlay 
                        loop 
                        className="w-full h-full"
                        onPlay={() => audioRef.current?.play()}
                        onPause={() => audioRef.current?.pause()}
                        onEnded={() => audioRef.current?.pause()}
                    />
                </div>
            </div>
             <div className="flex flex-wrap justify-center gap-4 mt-4">
                <button onClick={handleSaveVideo} className="flex items-center justify-center gap-2 bg-blue-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105">
                    <DownloadIcon /> Salvar Vídeo
                </button>
                <button onClick={handleGenerateSticker} disabled={isGeneratingSticker} className="flex items-center justify-center gap-2 bg-purple-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-purple-600 transition-all duration-300 transform hover:scale-105 disabled:bg-purple-400 disabled:cursor-not-allowed">
                    <StickerIcon /> {isGeneratingSticker ? 'Criando...' : 'Gerar Figurinha'}
                </button>
                <button onClick={reset} className="bg-white text-blue-900 font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-gray-200 transition-all duration-300 transform hover:scale-105">
                    Começar de Novo
                </button>
            </div>

            <div className="mt-6 w-full max-w-2xl text-center">
                {isGeneratingSticker && (
                    <div className="flex flex-col items-center text-white">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                        <p>Recortando para a figurinha...</p>
                    </div>
                )}
                {stickerError && <p className="text-red-400 bg-red-900/50 p-3 rounded-lg">{stickerError}</p>}
                {stickerImage && (
                    <div className="flex flex-col items-center gap-4 bg-black/30 p-6 rounded-lg border border-purple-400/50">
                        <h3 className="text-2xl font-bold text-white">Adicione sua Figurinha ao WhatsApp!</h3>
                        <img src={stickerImage} alt="Figurinha do WhatsApp" className="max-w-[200px] h-auto my-4" />
                        
                        <div className="text-left w-full max-w-md bg-black/40 p-4 rounded-md">
                            <p className="font-bold text-lg mb-2">Como adicionar:</p>
                            <ol className="list-decimal list-inside space-y-2 text-blue-100">
                                <li>
                                    <span className="font-semibold">Salve a figurinha:</span> Clique no botão abaixo para salvar a imagem no seu celular.
                                     <a href={stickerImage} download="figurinha_gremio.png" className="flex items-center justify-center gap-2 w-full mt-2 bg-green-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-105" onClick={() => logEvent('Figurinha Salva')}>
                                       <DownloadIcon /> Salvar Figurinha
                                    </a>
                                </li>
                                <li>
                                    <span className="font-semibold">Use um app "Sticker Maker":</span> Abra a loja de aplicativos (App Store ou Google Play) e baixe um criador de figurinhas.
                                </li>
                                <li>
                                    <span className="font-semibold">Adicione ao WhatsApp:</span> No app de figurinhas, crie um novo pacote, adicione a imagem que você salvou e exporte para o WhatsApp.
                                </li>
                            </ol>
                        </div>
                         <p className="text-xs text-blue-300 mt-4">
                           Por segurança, sites não podem adicionar figurinhas diretamente ao WhatsApp. <br/> Este método é a forma mais segura e recomendada.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
    
    const renderMainContent = () => {
        if (videoUrl) return renderVideoResultState();
        if (generatedImage) return renderResultState();
        if (originalImage) return renderImageReadyState();
        if (isCameraActive) return renderCameraState();
        return renderInitialState();
    }


    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-blue-900 via-black to-blue-700 text-white flex flex-col items-center justify-center p-4 overflow-hidden">
            <main className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center flex-grow">
                 {view === 'admin' ? (
                    <AdminPanel onBack={() => setView('main')} />
                ) : (
                    <>
                        <header className="text-center mb-8">
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Vista a Camisa do <span className="text-blue-400">Grêmio</span></h1>
                            <p className="text-lg text-blue-200 mt-2">Com o poder da Inteligência Artificial</p>
                        </header>
                        
                        <div className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-2xl p-4 min-h-[400px] flex items-center justify-center transition-all duration-500">
                            {renderMainContent()}
                        </div>
                        
                        {(error || videoError) && (
                            <div className="mt-6 bg-red-500/80 text-white font-bold py-3 px-6 rounded-lg shadow-lg text-center">
                                {error || videoError}
                            </div>
                        )}
                    </>
                )}
                
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <canvas ref={canvasRef} className="hidden"></canvas>
                <audio ref={audioRef} src="/hino.mp3" loop className="hidden"></audio>

            </main>
            <footer className="text-center py-4 text-blue-300 text-sm">
                <p>Criado com React, TailwindCSS e Gemini API.</p>
                 <button onClick={() => setView('admin')} className="text-blue-400/50 hover:text-blue-300 text-xs mt-2 underline">
                    Área Administrativa
                </button>
            </footer>
        </div>
    );
};

export default App;