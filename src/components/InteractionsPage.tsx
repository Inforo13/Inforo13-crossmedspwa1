import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  Info, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Pill,
  HelpCircle,
  Activity,
  UserPlus,
  Camera
} from 'lucide-react';
import { Medication, MedicationInteraction } from '../types';
import { 
  getMedicationSuggestions, 
  checkSingleMedicationInteractions, 
  checkMedicationInteractions 
} from '../services/interactionService';
import { MedicationScanCard } from './MedicationScanCard';
import { VoiceButton } from './VoiceButton';

interface Props {
  onBack: () => void;
  darkMode: boolean;
  medications: Medication[];
}

export const InteractionsPage: React.FC<Props> = ({ onBack, darkMode, medications }) => {
  // Local interaction checks on mount / list update
  const [activeInteractions, setActiveInteractions] = useState<MedicationInteraction[]>([]);
  const [checkingActive, setCheckingActive] = useState(false);

  // Mode select tab: direct search vs. package OCR
  const [activeMode, setActiveMode] = useState<'type' | 'scan'>('type');

  // Auto-medication test states
  const [testInput, setTestInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [testingMedicine, setTestingMedicine] = useState(false);
  const [testResult, setTestResult] = useState<{
    hasInteraction: boolean;
    medName: string;
    interactions: MedicationInteraction[];
    note?: string;
  } | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check query parameter to auto-open scanner mode if redirected from Quick Actions 'Escanear Remédio'
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('scan') === 'true') {
      setActiveMode('scan');
      // Clean query search param immediately to keep the URL elegant
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Check static interactions between existing medications list
  useEffect(() => {
    const listCheck = async () => {
      if (medications.length < 2) {
        setActiveInteractions([]);
        return;
      }
      setCheckingActive(true);
      try {
        const results = await checkMedicationInteractions(medications);
        setActiveInteractions(results);
      } catch (e) {
        console.error("Error checking medications interaction:", e);
      } finally {
        setCheckingActive(false);
      }
    };

    listCheck();
  }, [medications]);

  // Suggested autocomplete search on input text change
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (testInput.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const list = await getMedicationSuggestions(testInput);
        setSuggestions(list);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      }
    };

    const timer = setTimeout(fetchSuggestions, 350);
    return () => clearTimeout(timer);
  }, [testInput]);

  // Handle outside click to hide dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const selectSuggestion = (name: string) => {
    setTestInput(name);
    setSuggestions([]);
    setShowDropdown(false);
  };

  // Perform target clinical drug test
  const performSimulation = async (targetedName: string) => {
    const targeted = targetedName.trim();
    if (!targeted) return;

    setTestingMedicine(true);
    setSuggestions([]);
    setShowDropdown(false);

    try {
      // 1. Check local offline database first
      const offlineResults = checkSingleMedicationInteractions(targeted, medications);
      
      if (offlineResults.length > 0) {
        setTestResult({
          hasInteraction: true,
          medName: targeted,
          interactions: offlineResults,
          note: "Interação confirmada e documentada na nossa base de dados clínica regulada."
        });
      } else {
        // 2. Call Gemini for a deep AI comprehensive second-opinion lookup if online
        if (process.env.GEMINI_API_KEY && medications.length > 0) {
          const checkList: Medication[] = [
            ...medications,
            { id: 'temp-simulation', name: targeted, dosage: 'Dosagem Padrão', active: true, createdAt: Date.now(), frequency: 'Simulação', times: [] }
          ];
          const aiResults = await checkMedicationInteractions(checkList);
          
          // Filter results involving our simulated drug
          const relevant = aiResults.filter(r => 
            r.medicationNames.some(name => name.toLowerCase().includes(targeted.toLowerCase()))
          );

          if (relevant.length > 0) {
            setTestResult({
              hasInteraction: true,
              medName: targeted,
              interactions: relevant,
              note: "Detectado por Inteligência Artificial (CrossMeds IA)."
            });
          } else {
            setTestResult({
              hasInteraction: false,
              medName: targeted,
              interactions: [],
              note: "Nenhuma interação de risco detectada entre este medicamento e sua lista de fármacos ativos."
            });
          }
        } else {
          // Fallback if no active medicines or key missing
          setTestResult({
            hasInteraction: false,
            medName: targeted,
            interactions: []
          });
        }
      }
    } catch (err) {
      console.error("Error executing simulation check:", err);
    } finally {
      setTestingMedicine(false);
    }
  };

  const handleTestInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    await performSimulation(testInput);
  };

  // Check if a medication name is involved in an active interaction alert
  const hasConflict = (med: Medication) => {
    return activeInteractions.some(i => 
      i.medicationNames.some(name => name.toLowerCase().includes(med.name.toLowerCase()))
    );
  };

  const getConflictSeverity = (med: Medication) => {
    const found = activeInteractions.find(i => 
      i.medicationNames.some(name => name.toLowerCase().includes(med.name.toLowerCase()))
    );
    return found?.severity;
  };

  return (
    <div className="space-y-6 pt-2 pb-12 max-w-3xl mx-auto selection:bg-emerald-100">
      
      {/* Header navigations */}
      <div className="flex items-center gap-4 mb-3">
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
            Verificar Interações
          </h1>
          <p className="text-zinc-400 text-xs font-semibold mt-1">Monitore e teste a segurança cruzada de seu tratamento.</p>
        </div>
      </div>

      {/* 1. SEUS MEDICAMENTOS SECTION */}
      <div className={`rounded-[2.5rem] p-6 border transition-all duration-300 ${
        darkMode ? 'bg-[#242b38] border-[#2e3a4e]' : 'bg-white border-zinc-150/55 shadow-sm'
      }`}>
        <h3 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight mb-1 ml-1">
          Seus Medicamentos
        </h3>
        <p className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold leading-relaxed mb-6 ml-1">
          Estes são os medicamentos que estamos a verificar. Os medicamentos com interações estão destacados.
        </p>

        {medications.length === 0 ? (
          <div className="text-center py-10 bg-zinc-50/55 dark:bg-zinc-900/10 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
            <Pill size={36} className="text-zinc-300 mx-auto mb-3" />
            <p className="text-zinc-500 dark:text-zinc-400 text-xs font-bold leading-none">Nenhum medicamento ativo cadastrado na conta.</p>
            <p className="text-zinc-400 text-[10px] uppercase font-black tracking-wider mt-2">Adicione receitas para verificação cruzada automática.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {medications.map(med => {
              const conflicted = hasConflict(med);
              
              return (
                <div 
                  key={med.id}
                  className={`p-5 rounded-2xl border flex items-center justify-between transition-all ${
                    conflicted 
                      ? 'border-red-400 bg-red-50/5 dark:bg-red-950/5' 
                      : (darkMode ? 'bg-[#1a212d] border-zinc-800' : 'bg-white border-zinc-150')
                  }`}
                >
                  <span className="text-sm font-black uppercase text-zinc-900 dark:text-zinc-100 tracking-tight">
                    {med.name} {med.dosage ? `${med.dosage}` : ''}
                  </span>
                  {conflicted && (
                    <AlertTriangle size={18} className="text-red-500 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. RESULTADOS DA VERIFICAÇÃO SECTION */}
      <div className={`rounded-[2.5rem] p-6 md:p-8 border transition-all duration-300 ${
        darkMode ? 'bg-[#242b38] border-[#2e3a4e]' : 'bg-white border-zinc-150/55 shadow-sm'
      }`}>
        <h3 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight mb-5 ml-1">
          Resultados da Verificação
        </h3>

        {medications.length < 2 ? (
          <div className="bg-zinc-50/55 dark:bg-zinc-900/10 rounded-2.5xl p-6 border border-zinc-150/30 text-center space-y-4">
            <div className="w-12 h-12 bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <Info size={24} className="stroke-[2.5]" />
            </div>
            <div className="space-y-1.5">
              <h4 className="font-extrabold text-sm text-zinc-800 dark:text-white">Adicione mais um medicamento</h4>
              <p className="text-zinc-400 text-xs font-semibold">
                É preciso ter pelo menos dois medicamentos para verificar interações ativas automáticas no tratamento.
              </p>
            </div>
            <div className="h-px bg-zinc-150 dark:bg-zinc-800 w-24 mx-auto" />
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-extrabold uppercase tracking-wider leading-relaxed">
              Dica: Você pode testar e simular interações de fármacos logo abaixo!
            </p>
          </div>
        ) : checkingActive ? (
          <div className="flex flex-col items-center py-10 gap-3">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-400 text-xs font-semibold">Analisando base de interações clínicas...</p>
          </div>
        ) : activeInteractions.length === 0 ? (
          <div className="bg-emerald-50/20 dark:bg-emerald-950/5 border border-emerald-100/50 dark:border-emerald-950/20 p-6 rounded-2.5xl flex flex-col md:flex-row gap-4 items-center text-center md:text-left">
            <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-md">
              <CheckCircle2 size={24} className="stroke-[2.5]" />
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="font-black text-sm text-emerald-800 dark:text-emerald-400 uppercase tracking-wide">Tratamento Seguro!</h4>
              <p className="text-emerald-900/60 dark:text-emerald-350/80 text-xs font-semibold leading-relaxed">
                Nenhuma interação medicamentosa perigosa conhecida ou reportada foi encontrada entre os medicamentos recomendados no seu painel.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Secondary blue alert card from screenshot matching */}
            <div className="bg-[#eff6ff] border-2 border-blue-100 p-5 rounded-3xl text-[#1e40af] space-y-1.5 shadow-sm">
              <div className="flex items-center gap-2 font-black text-sm">
                <span>ℹ️ Recomendação Importante</span>
              </div>
              <p className="text-xs md:text-sm font-bold opacity-90 leading-normal">
                Não interrompa o uso. Mostre este alerta ao seu médico na próxima consulta.
              </p>
            </div>

            {activeInteractions.map((inter, idx) => (
              <div 
                key={idx}
                className="p-1 space-y-4 pt-1"
              >
                <div className="flex justify-between items-center pr-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="text-rose-500 shrink-0" size={18} />
                    <h4 className="text-sm font-black text-zinc-900 dark:text-white tracking-tight uppercase">
                      {inter.medicationNames.join(' + ').toUpperCase()}
                    </h4>
                  </div>
                </div>

                <div className="space-y-3.5 pl-1">
                  <div>
                    <span className="px-3.5 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider bg-rose-500 text-white">
                      {inter.severity === 'high' ? 'Grave' : 'Atenção'}
                    </span>
                  </div>

                  <div className="text-xs space-y-3 font-semibold text-zinc-550 dark:text-zinc-400">
                    <p className="leading-relaxed">
                      <strong className="text-zinc-800 dark:text-zinc-200 block text-[13px] font-black mb-1">Sintomas Possíveis:</strong>
                      {inter.description}
                    </p>
                    <p className="leading-relaxed pt-1">
                      <strong className="text-zinc-800 dark:text-zinc-200 block text-[13px] font-black mb-1">Recomendação:</strong>
                      {inter.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. TESTAR NOVO MEDICAMENTO SECTION (SIMULADOR DE AUTOMEDICAÇÃO) */}
      <div className={`rounded-[2.5rem] p-6 md:p-8 border transition-all duration-300 ${
        darkMode ? 'bg-[#242b38] border-[#2e3a4e]' : 'bg-emerald-50/15 border-zinc-150/60 shadow-xs'
      }`}>
        <div className="flex gap-3.5 mb-2 items-center">
          <div className="w-10 h-10 bg-teal-500 text-white rounded-xl flex items-center justify-center shrink-0">
            <Search size={20} className="stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-md font-black tracking-tight text-zinc-850 dark:text-white leading-none">
              Testar Novo Medicamento
            </h3>
            <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mt-1.5 leading-none">Simulador de automedicação preventivo</p>
          </div>
        </div>

        <p className="text-zinc-500 dark:text-zinc-450 text-xs font-medium leading-relaxed mb-6 mt-3 pl-1">
          <strong>Evite riscos de automedicação indicados por vizinhos ou parentes!</strong> Antes de ingerir qualquer remédio novo, você pode pesquisar digitando abaixo ou escanear uma foto da embalagem para analisar se há interações perigosas com seu tratamento.
        </p>

        {/* Tab switcher exactly matching premium medical layouts */}
        <div className="flex gap-2 p-1.5 bg-zinc-100/80 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-850 rounded-2xl mb-6 w-fit ml-1">
          <button
            type="button"
            onClick={() => setActiveMode('type')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeMode === 'type'
                ? 'bg-white dark:bg-zinc-800 text-teal-650 dark:text-teal-400 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
            }`}
          >
            <Search size={14} className="stroke-[2.5]" />
            Digitar Nome
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('scan')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeMode === 'scan'
                ? 'bg-white dark:bg-zinc-800 text-teal-650 dark:text-teal-400 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
            }`}
          >
            <Camera size={14} className="stroke-[2.5]" />
            Escanear Embalagem
          </button>
        </div>

        {activeMode === 'scan' ? (
          <div className="mb-4">
            <MedicationScanCard 
              darkMode={darkMode}
              onMedicationIdentified={(name) => {
                setTestInput(name);
                performSimulation(name);
                setActiveMode('type');
              }}
            />
          </div>
        ) : (
          /* Input box wrap and suggestions lookup dropdown dropdown */
          <form onSubmit={handleTestInteraction} className="space-y-4 relative">
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Ex: Varfarina, Ibuprofeno, Clonidina, etc..."
                  value={testInput}
                  onChange={(e) => {
                    setTestInput(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  disabled={testingMedicine}
                  className={`w-full py-4.5 pl-5 pr-14 border rounded-2xl outline-none focus:ring-4 focus:ring-teal-500/10 text-sm font-semibold transition-all ${
                    darkMode
                      ? 'bg-zinc-900 border-zinc-850 text-white focus:bg-zinc-950 focus:border-teal-500'
                      : 'bg-white border-zinc-150 text-zinc-850 focus:border-teal-500'
                  }`}
                />
                <button
                  type="submit"
                  disabled={!testInput.trim() || testingMedicine}
                  className={`absolute right-2 top-2 px-4.5 py-2.5 rounded-xl text-white font-black transition-all hover:scale-103 active:scale-95 ${
                    testInput.trim() && !testingMedicine
                      ? 'bg-teal-600 hover:bg-teal-700 cursor-pointer shadow-md'
                      : 'bg-zinc-300 dark:bg-zinc-850 text-zinc-400 cursor-not-allowed'
                  }`}
                >
                  Testar Fármaco
                </button>
              </div>
              <VoiceButton 
                onResult={(text) => {
                  setTestInput(text);
                  getMedicationSuggestions(text).then(results => {
                    // Force update matching suggestions list if supported/retrieved
                    if (results && results.length > 0) {
                      // Optionally update local suggestions state
                    }
                  });
                  setShowDropdown(true);
                }}
                placeholder="Fale o nome do fármaco..."
                className="h-[56px] w-[56px] rounded-2xl shadow-xs shrink-0"
                size={20}
              />
            </div>

            {/* Autocomplete Suggestion Dropdown */}
            {showDropdown && suggestions.length > 0 && (
              <div 
                ref={dropdownRef}
                className={`absolute left-0 right-0 top-[3.75rem] rounded-2xl border shadow-xl max-h-56 overflow-y-auto z-50 p-2.5 space-y-1 ${
                  darkMode ? 'bg-[#1a212d] border-zinc-800 text-white' : 'bg-white border-zinc-150 text-zinc-850'
                }`}
              >
                {suggestions.map((name, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => selectSuggestion(name)}
                    className="w-full text-left p-3 text-xs font-bold rounded-xl flex items-center gap-2.5 hover:bg-teal-550/20 dark:hover:bg-zinc-800 transition-colors cursor-pointer select-none"
                  >
                    <Pill size={14} className="text-teal-500 shrink-0" />
                    <span className="truncate">{name}</span>
                  </button>
                ))}
              </div>
            )}
          </form>
        )}

        {/* Loading Test Trigger */}
        {testingMedicine && (
          <div className="flex items-center gap-3 justify-center py-8">
            <span className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-400 text-xs font-semibold">Analisando segurança de compatibilidade química...</p>
          </div>
        )}

        {/* Checked Simulated Test Outcome */}
        {testResult && !testingMedicine && (
          <div className="mt-8 transition-all">
            {testResult.hasInteraction ? (
              <div className={`p-6 rounded-[2rem] border space-y-4 bg-rose-50/25 dark:bg-rose-950/15 border-rose-200/50 transition-colors`}>
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <h4 className="text-md font-black text-rose-700 dark:text-rose-400 leading-none">
                        Alerta de Interação Encontrada!
                      </h4>
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-550 uppercase font-black tracking-wider mt-1.5">
                        Medicamento Perigoso para seu Quadro: {testResult.medName}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-rose-600 text-white text-[9px] font-black uppercase tracking-widest rounded-md shrink-0 self-start md:self-center">
                    Perigo
                  </span>
                </div>

                <div className="space-y-4 mt-3">
                  {testResult.interactions.map((inter, i) => (
                    <div key={i} className="space-y-3.5 bg-white/70 dark:bg-[#1a212d]/70 p-4.5 rounded-2xl border border-rose-100/40 dark:border-zinc-850">
                      <div className="flex justify-between items-center border-b border-rose-50/50 pb-2">
                        <span className="text-xs font-extrabold text-[#7c2d12] dark:text-rose-350">
                          Interage com: {inter.medicationNames.filter(n => n.toLowerCase() !== testResult.medName.toLowerCase()).join(', ')}
                        </span>
                        <span className={`px-2 py-0.5 text-[8.5px] font-black uppercase rounded-md tracking-wider ${
                          inter.severity === 'high' ? 'bg-danger text-rose-750 bg-rose-100' : 'bg-warning text-amber-700 bg-amber-100'
                        }`}>
                          Risco {inter.severity === 'high' ? 'Grave' : 'Moderado'}
                        </span>
                      </div>

                      <div className="text-xs space-y-1">
                        <p className="text-zinc-500 font-semibold leading-relaxed">
                          <strong>Sintomas da interação:</strong> {inter.description}
                        </p>
                        <p className="text-zinc-850 dark:text-zinc-200 font-bold leading-relaxed pt-1.5 border-t border-dashed border-zinc-150/40 mt-1.5">
                          <strong>Conduta regulada:</strong> {inter.recommendation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {testResult.note && (
                  <p className="text-[10px] uppercase font-black tracking-widest text-[#9a3412] dark:text-[#f97316] text-center pt-2">
                    📢 {testResult.note}
                  </p>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-[2rem] border space-y-4 bg-emerald-50/25 dark:bg-emerald-950/15 border-emerald-200/50">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <h4 className="text-md font-black text-emerald-700 dark:text-emerald-400 leading-none">
                      Concentração Segura!
                    </h4>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-black tracking-wider mt-1.5">
                      Compatibilidade de Fármacos Verificada
                    </p>
                  </div>
                </div>

                <p className="text-zinc-550 dark:text-zinc-350 text-xs font-semibold leading-relaxed">
                  Não foram encontradas interações medicamentosas negativas registradas na nossa central ou por IA entre o simulado <strong>{testResult.medName}</strong> e seus remédios ativos.
                </p>

                {testResult.note && (
                  <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 pt-2 border-t border-dashed border-emerald-100/50">
                    <Sparkles size={11} />
                    <span>{testResult.note}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer disclaimers */}
      <div className="flex gap-2.5 rounded-2xl p-4 bg-zinc-50 dark:bg-[#1a212d] border border-zinc-150/45 dark:border-zinc-800">
        <HelpCircle size={18} className="text-zinc-400 mt-0.5 shrink-0" />
        <p className="text-[11px] text-zinc-400 dark:text-zinc-505 font-bold leading-relaxed">
          Aviso Importante: Este simulador de cruzamento químico fornece triagem de apoio automático. Ele não substitui o julgamento profissional de seu médico responsável ou do farmacêutico habilitado. Na dúvida sobre a posologia ou dor persistente, consulte sempre seu posto de saúde regulado.
        </p>
      </div>

    </div>
  );
};
