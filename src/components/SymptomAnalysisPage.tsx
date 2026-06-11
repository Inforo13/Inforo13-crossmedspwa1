import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  RotateCcw, 
  Send, 
  Bot, 
  User, 
  AlertTriangle,
  FileText,
  Shield,
  Clock
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { Medication } from '../types';
import { VoiceButton } from './VoiceButton';

interface Props {
  onBack: () => void;
  darkMode: boolean;
  medications: Medication[];
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface AnalysisResult {
  sugestao: string;
  gravidade: 'Alta' | 'Moderada' | 'Baixa' | 'Crítica';
  especialista: string;
  conduta: string;
}

export const SymptomAnalysisPage: React.FC<Props> = ({ onBack, darkMode, medications }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: 'Olá! Sou o assistente de triagem inteligente CrossMeds IA. Me descreva detalhadamente os sintomas que você está sentindo, como quando começaram e a intensidade da dor, para que possamos realizar uma análise prévia informativa.'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const symptoms = params.get('sintomas');
    if (symptoms && symptoms.trim() !== '') {
      if (messages.length === 1) {
        setIsLoading(true);
        const userMsg: Message = { role: 'user', text: symptoms };
        setMessages(prev => [...prev, userMsg]);
        executeSymptomAnalysis([userMsg]);
        
        // Clean URL parameter so reload doesn't trigger it again
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, []);

  const handleRestart = () => {
    setMessages([
      {
        role: 'model',
        text: 'Olá! Sou o assistente de triagem inteligente CrossMeds IA. Me descreva detalhadamente os sintomas que você está sentindo, como quando começaram e a intensidade da dor, para que possamos realizar uma análise prévia informativa.'
      }
    ]);
    setInputText('');
    setAnalysis(null);
  };

  const handleSuggestionClick = (symptom: string) => {
    setInputText(symptom);
  };

  const executeSymptomAnalysis = async (chatHistory: Message[]) => {
    if (!process.env.GEMINI_API_KEY) {
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          text: 'Erro: A chave de API do Gemini não está definida no ambiente. Por favor, configure-a em Settings > Secrets.'
        }
      ]);
      return;
    }

    try {
      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const medList = medications.map(m => `- ${m.name} (${m.dosage})`).join('\n');
      
      const systemInstruction = `
        Você é o Dr. CrossMeds, um médico de triagem clínica assistido por IA inteligente.
        O paciente está relatando sintomas. Seu dever é conduzir um diálogo empático, fazendo apenas 1 ou no máximo 2 perguntas direcionadas de cada vez para esclarecer a queixa principal, cronologia, severidade (escala 0-10) e sintomas associados.
        
        Atualmente, o paciente está tomando os seguintes medicamentos regulados:
        ${medList || 'Nenhum medicamento ativo cadastrado'}

        No momento em que você tiver informações suficientes de triagem (geralmente após 3 ou 4 turnos de mensagens) ou se o paciente relatar sinais clássicos de alerta grave (por exemplo, dor torácica que radia para braço/mandíbula, dispneia súbita, perda de força de um lado do corpo), você deve encerrar as perguntas e emitir a ANÁLISE COMPLETA.

        Para emitir a análise completa, você deve obrigatoriamente incluir no final do seu texto a tag "[ANALISE_COMPLETA]" seguida de um bloco de código JSON plano com o seguinte formato exato (não use blocos markdown de código, envie o json direto logo após a marcação):
        {
          "sugestao": "Explicação clínica preliminar da suspeita diagnóstica baseado no relato (ex: Radiculopatia Cervical, Síndrome Coronariana Aguda, etc).",
          "gravidade": "Alta" | "Moderada" | "Baixa" | "Crítica",
          "especialista": "Indicação do médico ideal (ex: Clínico Geral, Cardiologista, Neurologista, Pronto-Socorro/Emergência).",
          "conduta": "Ações imediatas e acompanhamento sugerido (ex: Assistir ao pronto-socorro imediatamente, agendar consulta eletiva em 48h, etc)."
        }

        Exemplo de conclusão:
        "... Entendi seus sintomas. Vou concluir nossa triagem com a análise preliminar detalhada abaixo.

        [ANALISE_COMPLETA]{
          \"sugestao\": \"A dor de cabeça súbita de forte intensidade necessita afastar causas vasculares.\",
          \"gravidade\": \"Crítica\",
          \"especialista\": \"Pronto-Socorro / Emergência Hospitalar\",
          \"conduta\": \"Dirija-se ao hospital mais próximo imediatamente para acompanhamento e exames de imagem.\"
        }"

        Por favor, faça respostas curtas de no máximo 2 parágrafos antes de emitir a análise completa para não cansar o paciente, sempre em língua portuguesa brasileira do tipo coloquial e amigável.
      `;

      const formattedContents = [
        { role: 'user', parts: [{ text: systemInstruction }] },
        ...chatHistory.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }))
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: formattedContents
      });

      const responseText = response.text || '';
      
      // Check for [ANALISE_COMPLETA] marker
      if (responseText.includes('[ANALISE_COMPLETA]')) {
        const parts = responseText.split('[ANALISE_COMPLETA]');
        const chatText = parts[0].trim();
        const jsonText = parts[1].trim();

        setMessages(prev => [
          ...prev,
          { role: 'model', text: chatText || 'Triagem concluída. Veja o resultado visual abaixo com o parecer médico.' }
        ]);

        try {
          // Attempt to extract JSON from backticks or raw
          const cleanJson = jsonText.replace(/```json|```/g, '').trim();
          const parsedAnalysis = JSON.parse(cleanJson) as AnalysisResult;
          setAnalysis(parsedAnalysis);
        } catch (jsonErr) {
          console.error("Error parsing Gemini analysis JSON:", jsonErr, jsonText);
          // Safe fallback analysis
          setAnalysis({
            sugestao: "Análise realizada com base nas queixas relatadas de dor ou desconforto.",
            gravidade: "Moderada",
            especialista: "Clínico Geral",
            conduta: "Procure agendar uma consulta médica prioritária para avaliação clínica física detalhada."
          });
        }
      } else {
        setMessages(prev => [
          ...prev,
          { role: 'model', text: responseText }
        ]);
      }
    } catch (err) {
      console.error("Error calling Gemini API:", err);
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          text: 'Tive um problema ao me comunicar com a central médica de inteligência artificial. Por favor, tente enviar sua mensagem novamente.'
        }
      ]);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMsg = inputText.trim();
    setInputText('');
    
    const updatedHistory = [...messages, { role: 'user' as const, text: userMsg }];
    setMessages(updatedHistory);
    setIsLoading(true);

    await executeSymptomAnalysis(updatedHistory);
    setIsLoading(false);
  };

  // Pre-configured typical chips
  const symptomSuggestions = [
    "Dor forte no peito que irradia pro braço",
    "Dor de cabeça intensa com tontura e enjoo",
    "Falta de ar ao subir escadas",
    "Dor de estômago queimação após comer",
    "Dor na lombar irradiando para as pernas"
  ];

  return (
    <div className="space-y-6 pt-2 pb-12 max-w-3xl mx-auto selection:bg-emerald-100">
      
      {/* Header controls */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className={`p-3.5 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-sm ${
              darkMode ? 'bg-[#242b38] hover:bg-[#2c3547] text-zinc-350 border border-zinc-800' : 'bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-150/55'
            }`}
          >
            <ChevronLeft size={18} className="stroke-[3]" />
          </button>
          <div>
            <h1 className="text-2.5xl font-black text-zinc-900 dark:text-white tracking-tight leading-none">
              Análise de Sintomas
            </h1>
            <p className="text-zinc-400 text-xs font-semibold mt-1">Chat de triagem médica prévia por IA.</p>
          </div>
        </div>

        <button
          onClick={handleRestart}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 border rounded-xl text-xs font-black uppercase tracking-wider transition-all hover:scale-102 ${
            darkMode 
              ? 'bg-[#1e2432]/50 border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400' 
              : 'bg-emerald-50/70 border-emerald-100 hover:bg-emerald-150/60 text-emerald-700'
          }`}
        >
          <RotateCcw size={14} className="stroke-[2.5]" />
          <span className="hidden md:inline">Nova Análise</span>
        </button>
      </div>

      {/* Main Chat Frame Container */}
      <div className={`rounded-[2.5rem] border overflow-hidden p-5 md:p-6 flex flex-col min-h-[500px] max-h-[620px] transition-all duration-300 relative ${
        darkMode ? 'bg-[#242b38] border-[#2e3a4e]' : 'bg-emerald-50/15 border-zinc-150/60 shadow-xs'
      }`}>
        {/* Chat window bubble area with nice green background like standard WhatsApp/clinical app style */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1 max-h-[460px] min-h-[300px]">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* Avatar on left for bot */}
              {msg.role === 'model' && (
                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Bot size={18} />
                </div>
              )}

              <div className={`p-4 rounded-[1.5rem] leading-relaxed text-sm ${
                msg.role === 'user'
                  ? 'bg-emerald-700 dark:bg-emerald-800 text-white rounded-tr-none max-w-[82%] font-semibold shadow-xs'
                  : 'bg-white dark:bg-[#1a212d] text-zinc-800 dark:text-white border border-zinc-100 dark:border-zinc-800/85 rounded-tl-none max-w-[82%] font-semibold shadow-xs'
              }`}>
                {msg.text.split('\n').map((line, idx) => (
                  <p key={idx} className={idx > 0 ? 'mt-2' : ''}>
                    {line}
                  </p>
                ))}
              </div>

              {/* Avatar on right for user */}
              {msg.role === 'user' && (
                <div className="h-9 w-9 rounded-full bg-zinc-200 dark:bg-zinc-750 text-zinc-600 dark:text-zinc-350 flex items-center justify-center shrink-0 border border-zinc-300/40">
                  <User size={18} />
                </div>
              )}
            </div>
          ))}

          {/* Prompt Loading Indicators */}
          {isLoading && (
            <div className="flex items-start gap-3 justify-start">
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shrink-0 animate-pulse">
                <Bot size={18} />
              </div>
              <div className="p-4 bg-white dark:bg-[#1a212d] text-zinc-400 dark:text-zinc-550 border border-zinc-100 dark:border-zinc-800 rounded-[1.5rem] rounded-tl-none flex items-center gap-1.5 shadow-xs">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips - only shown when chat hasn't finished and input is empty */}
        {!analysis && !isLoading && !inputText && (
          <div className="flex gap-2 overflow-x-auto pb-4 select-none scrollbar-none scroll-smooth">
            {symptomSuggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(s)}
                className={`text-xs py-2 px-3.5 font-bold rounded-full text-left cursor-pointer shrink-0 border transition-all active:scale-97 ${
                  darkMode 
                    ? 'bg-zinc-800/85 hover:bg-zinc-800 border-zinc-700/60 text-emerald-400' 
                    : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-850 shadow-xs'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Messaging input box footer */}
        {!analysis && (
          <form onSubmit={handleSend} className="flex items-center gap-2 w-full">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Digite seus sintomas em detalhes aqui..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isLoading}
                className={`w-full py-4 pl-5 pr-14 rounded-2xl border transition-all text-sm font-semibold outline-none focus:ring-4 focus:ring-emerald-500/10 placeholder-zinc-400/80 ${
                  darkMode
                    ? 'bg-zinc-900 border-zinc-850 text-white focus:border-emerald-500 focus:bg-zinc-950'
                    : 'bg-zinc-50 border-zinc-150 text-zinc-850 focus:border-emerald-500 focus:bg-white'
                }`}
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className={`absolute right-2 top-2 px-4.5 py-2.5 rounded-xl text-white font-black transition-all hover:scale-103 active:scale-95 ${
                  inputText.trim() && !isLoading 
                    ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer shadow-md' 
                    : 'bg-zinc-300 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
                }`}
              >
                <Send size={15} className="stroke-[2.5]" />
              </button>
            </div>
            <VoiceButton 
              onResult={(text) => setInputText(text)}
              placeholder="Descreva os sintomas..."
              className="h-[52px] w-[52px] rounded-2xl"
              size={18}
            />
          </form>
        )}
      </div>

      {/* Dynamic Render block "Análise Preliminar Concluída" exactly like the screenshot */}
      {analysis && (
        <div className={`rounded-[2.5rem] border p-6 md:p-8 space-y-6 transition-all duration-300 ${
          darkMode ? 'bg-[#242b38] border-[#2e3a4e]' : 'bg-white border-zinc-150/60 shadow-lg'
        }`}>
          {/* Section banner */}
          <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4.5">
            <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <FileText size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-zinc-900 dark:text-white leading-none">Análise Preliminar Concluída</h3>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider mt-1">Interpretação automática baseada em IA</p>
            </div>
          </div>

          {/* Details details list */}
          <div className="space-y-4 font-semibold text-sm">
            {/* Provável Causa */}
            <div className="space-y-1">
              <span className="text-xs font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Sugestão de Análise</span>
              <p className="text-zinc-800 dark:text-zinc-150 leading-relaxed bg-zinc-50/50 dark:bg-zinc-900/40 p-4 rounded-xl border border-zinc-100/50 dark:border-zinc-850">
                {analysis.sugestao}
              </p>
            </div>

            {/* Severity Badge row */}
            <div className="flex items-center justify-between py-3.5 border-b border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-zinc-400" />
                <span className="font-extrabold text-zinc-800 dark:text-zinc-200">Classificação de Risco</span>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-xs font-black border uppercase tracking-wider ${
                analysis.gravidade === 'Alta' || analysis.gravidade === 'Crítica'
                  ? 'bg-rose-150/50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200/50 animate-pulse'
                  : analysis.gravidade === 'Moderada'
                    ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200/50'
                    : 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-250'
              }`}>
                {analysis.gravidade}
              </span>
            </div>

            {/* Specialist Row */}
            <div className="flex items-center justify-between py-3.5 border-b border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-2">
                <Bot size={16} className="text-zinc-400" />
                <span className="font-extrabold text-zinc-800 dark:text-zinc-200">Especialista Recomendado</span>
              </div>
              <span className={`px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-black rounded-lg border border-transparent`}>
                {analysis.especialista}
              </span>
            </div>

            {/* Conduta Recomendada */}
            <div className="space-y-1 pt-2">
              <span className="text-xs font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Conduta Recomendada</span>
              <p className="text-zinc-800 dark:text-zinc-150 leading-relaxed bg-zinc-50/50 dark:bg-zinc-900/40 p-4 rounded-xl border border-zinc-100/50 dark:border-zinc-850">
                {analysis.conduta}
              </p>
            </div>
          </div>

          {/* Legal Warning Disclaimer */}
          <div className="p-4 bg-rose-50/35 dark:bg-rose-950/15 border border-rose-100/55 dark:border-rose-950/35 rounded-2xl flex gap-3">
            <AlertTriangle className="text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" size={18} />
            <p className="text-[11px] text-rose-700 dark:text-rose-400 font-semibold leading-relaxed">
              <strong>Aviso Legal:</strong> Esta é uma análise preliminar baseada em inteligência artificial para apoio de pré-triagem informativa. Em nenhuma hipótese substitui uma consulta, exame físico, diagnóstico ou aconselhamento médico profissional definitivo. Se estiver sentindo sintomas graves como aperto no peito, falta de ar severa ou paralisia súbita, dirija-se imediatamente ao pronto-socorro regulado ou chame o serviço de emergência do SAMU (192).
            </p>
          </div>

          {/* Restart button inside completed analysis */}
          <button
            onClick={handleRestart}
            className="w-full py-4.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 hover:shadow-xl transition-all cursor-pointer font-extrabold"
          >
            <RotateCcw size={15} /> Iniciar Nova Análise
          </button>
        </div>
      )}
    </div>
  );
};
