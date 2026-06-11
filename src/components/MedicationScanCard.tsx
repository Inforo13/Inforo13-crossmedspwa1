import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Sparkles, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { analyzeMedicationImage } from '../services/interactionService';

interface Props {
  onMedicationIdentified: (name: string) => void;
  darkMode: boolean;
}

export const MedicationScanCard: React.FC<Props> = ({ onMedicationIdentified, darkMode }) => {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ name: string; activeIngredient?: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Convert File to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
    });
  };

  const processImageFile = async (file: File) => {
    if (!file) return;

    setError(null);
    setSuccessInfo(null);
    setLoading(true);
    setStatusMessage('Lendo arquivo de imagem...');

    try {
      // Create reader preview
      const base64 = await fileToBase64(file);
      setImagePreview(base64);

      // Start processing steps
      setStatusMessage('Buscando imagem do medicamento...');
      await new Promise(r => setTimeout(r, 600));
      
      setStatusMessage('Identificando princípio ativo em nossa IA...');
      
      const mimeType = file.type || 'image/jpeg';
      const result = await analyzeMedicationImage(base64, mimeType);

      if (result && result.name) {
        setSuccessInfo({
          name: result.name,
          activeIngredient: result.activeIngredient
        });
        setStatusMessage('Medicamento identificado com sucesso!');
        
        // Pass to parent search input after a brief delay so user can celebrate success
        setTimeout(() => {
          onMedicationIdentified(result.name);
          // Auto-clear preview and success info after completing search
          setImagePreview(null);
          setSuccessInfo(null);
        }, 1500);
      } else {
        setError('Não foi possível identificar um medicamento nesta embalagem. Tente uma foto mais nítida ou digite acima.');
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err?.message?.includes('API_KEY') 
        ? 'Chave de API do Gemini não configurada. Ative-a no painel de configurações para usar canais de IA.'
        : 'Houve um problema de rede ou formato ao ler a caixa do remédio. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleCancel = () => {
    setImagePreview(null);
    setError(null);
    setSuccessInfo(null);
    setLoading(false);
  };

  return (
    <div className={`rounded-3xl p-1 overflow-hidden transition-all duration-300 ${
      darkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-gradient-to-br from-[#e0faf2] to-[#cbf7eb] border border-teal-150 shadow-xs'
    }`}>
      {/* Invisible HTML5 inputs to trigger native camera and standard file upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={cameraInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        capture="environment" 
        className="hidden" 
      />

      <div className="p-6 md:p-8 flex flex-col items-center">
        {!imagePreview ? (
          /* 1. INITIAL PROMPT STATE */
          <div className="w-full flex flex-col items-center text-center">
            {/* Scan target circle with animation */}
            <div className="w-18 h-18 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center mb-5 relative">
              <Camera size={26} className="stroke-[2.5]" />
              <div className="absolute inset-0 border-2 border-dashed border-teal-500/60 dark:border-teal-400/60 rounded-full animate-spin [animation-duration:12s] scale-110"></div>
            </div>

            <h4 className="text-lg font-black text-teal-900 dark:text-emerald-400 tracking-tight leading-none mb-2">
              Escaneie a Embalagem
            </h4>
            <p className="text-teal-900/60 dark:text-zinc-400 text-xs font-semibold max-w-sm mb-6 leading-relaxed">
              Tire uma foto da caixa do medicamento para que a IA possa identificá-lo e verificar interações com seus outros remédios.
            </p>

            {/* Blue and White buttons exactly from screenshot */}
            <div className="w-full max-w-md flex flex-col gap-3">
              <button
                type="button"
                onClick={handleCameraClick}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer select-none"
              >
                <Camera size={18} className="stroke-[3]" />
                Tirar Foto
              </button>

              <button
                type="button"
                onClick={handleUploadClick}
                className="w-full py-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-750 font-black text-sm rounded-2xl flex items-center justify-center gap-2.5 shadow-xs transition-all active:scale-98 cursor-pointer select-none"
              >
                <Upload size={18} className="stroke-[2.5]" />
                Selecionar Arquivo
              </button>
            </div>
          </div>
        ) : (
          /* 2. LOADING / SCANNING STATE */
          <div className="w-full flex flex-col items-center max-w-md text-center">
            {/* Visual crop area with scanning green line */}
            <div className="relative w-48 h-48 rounded-2xl border-2 border-teal-400 overflow-hidden shadow-md bg-zinc-950 mb-5 flex items-center justify-center group">
              <img 
                src={imagePreview} 
                alt="Medication" 
                className="w-full h-full object-cover opacity-80" 
              />
              
              {/* Green holographic scanning line overlay */}
              {loading && (
                <div className="absolute inset-x-0 top-0 h-1.5 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)] animate-[scan_2s_infinite_ease-in-out]" />
              )}

              {/* Dotted corner markers */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-teal-300" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-teal-300" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-teal-300" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-teal-300" />
            </div>

            {/* Scanning Status Text */}
            <div className="space-y-4 w-full">
              {loading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2.5 justify-center">
                    <RefreshCw size={14} className="animate-spin text-teal-600 dark:text-teal-400" />
                    <span className="text-zinc-800 dark:text-zinc-200 text-sm font-black tracking-tight uppercase">
                      Processando Imagem
                    </span>
                  </div>
                  <p className="text-zinc-550 dark:text-zinc-400 text-xs font-semibold px-4 animate-pulse">
                    {statusMessage}
                  </p>
                </div>
              ) : error ? (
                <div className="p-4 bg-rose-50/70 dark:bg-rose-950/20 border border-rose-250/30 rounded-2xl space-y-2">
                  <div className="flex items-center justify-center gap-2 text-rose-700 dark:text-rose-400">
                    <AlertCircle size={18} className="stroke-[2.5]" />
                    <span className="text-xs font-bold uppercase tracking-wider">Falha na Triagem</span>
                  </div>
                  <p className="text-zinc-650 dark:text-zinc-350 text-xs font-medium leading-relaxed">
                    {error}
                  </p>
                </div>
              ) : successInfo ? (
                <div className="p-4.5 bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-2xl space-y-2">
                  <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 size={18} className="stroke-[2.5]" />
                    <span className="text-xs font-black uppercase tracking-wider">Identificado!</span>
                  </div>
                  <div className="text-center">
                    <p className="text-zinc-900 dark:text-white text-base font-black uppercase tracking-tight">
                      {successInfo.name}
                    </p>
                    {successInfo.activeIngredient && (
                      <p className="text-zinc-400 text-[10px] uppercase font-black tracking-wider mt-1">
                        Princípio ativo: {successInfo.activeIngredient}
                      </p>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Cancel or Back button to reset preview */}
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2.5 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors mx-auto cursor-pointer"
              >
                Cancelar / Retentar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Styled animation keyframes embedded cleanly via Tailwind component style */}
      <style>{`
        @keyframes scan {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
      `}</style>
    </div>
  );
};
