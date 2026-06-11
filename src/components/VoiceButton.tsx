import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceButtonProps {
  onResult: (text: string) => void;
  placeholder?: string;
  className?: string;
  size?: number;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  onResult,
  placeholder = 'Fale agora...',
  className = '',
  size = 18
}) => {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionClass) {
      setSupported(true);
      const rec = new SpeechRecognitionClass();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'pt-BR';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onResult(transcript);
        }
        setIsListening(false);
      };

      rec.onerror = (event: any) => {
        console.error('Erro no reconhecimento de voz:', event);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, [onResult]);

  if (!supported) return null;

  const toggleListening = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch (err) {
        console.error('Falha ao iniciar reconhecimento:', err);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      title={isListening ? 'Ouvindo... Clique para parar' : 'Falar por voz'}
      className={`p-2.5 rounded-xl transition-all flex items-center justify-center relative group active:scale-90 ${
        isListening
          ? 'bg-red-50 dark:bg-rose-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 animate-pulse'
          : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-700/50'
      } ${className}`}
    >
      {isListening ? (
        <>
          <MicOff size={size} className="animate-bounce" />
          <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-rose-600 text-white text-[10px] font-black tracking-wide px-2 py-1 rounded shadow-md whitespace-nowrap z-50 animate-bounce">
            🔴 OUVINDO...
          </span>
        </>
      ) : (
        <Mic size={size} />
      )}
    </button>
  );
};
