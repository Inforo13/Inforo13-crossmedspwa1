import React, { useState, useEffect, useRef } from 'react';
import { Medication } from '../types';
import { 
  ArrowLeft, Plus, Trash2, Save, Calendar, Clock, 
  Beaker, AlertCircle, Info, Check, Search, Loader2, Pill, Download
} from 'lucide-react';
import { getMedicationSuggestions, getDosageSuggestions } from '../services/interactionService';

interface Props {
  darkMode: boolean;
  onSave: (data: Partial<Medication>, keepOpen?: boolean) => Promise<void>;
  onBack: () => void;
  medications?: Medication[];
}

export const AddFormulaPage: React.FC<Props> = ({ darkMode, onSave, onBack, medications = [] }) => {
  // Main form states
  const [formulaName, setFormulaName] = useState('');
  const [recipeDate, setRecipeDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Component lists
  const [components, setComponents] = useState<{ name: string; dosage: string }[]>([]);
  
  // Current component to add inputs
  const [newCompName, setNewCompName] = useState('');
  const [newCompDosage, setNewCompDosage] = useState('');
  const [componentSuggestions, setComponentSuggestions] = useState<string[]>([]);
  const [isSearchingComponents, setIsSearchingComponents] = useState(false);
  const [showComponentDropdown, setShowComponentDropdown] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

  // Capsule instructions
  const [capsuleDosage, setCapsuleDosage] = useState(1);
  const [frequency, setFrequency] = useState('Diário');
  const [timePickerInput, setTimePickerInput] = useState('');
  const [times, setTimes] = useState<string[]>(['08:00']);
  const [howToTake, setHowToTake] = useState('Selecione');
  const [indication, setIndication] = useState('');
  const [durationMode, setDurationMode] = useState<'continuous' | 'defined'>('continuous');
  const [endDate, setEndDate] = useState('');
  
  // Alerts / States
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle outside dropdown clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (componentRef.current && !componentRef.current.contains(event.target as Node)) {
        setShowComponentDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Suggestions search helper
  const handleComponentChange = async (val: string) => {
    setNewCompName(val);
    if (val.length >= 2) {
      setIsSearchingComponents(true);
      setShowComponentDropdown(true);
      try {
        const results = await getMedicationSuggestions(val);
        setComponentSuggestions(results);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearchingComponents(false);
      }
    } else {
      setComponentSuggestions([]);
      setShowComponentDropdown(false);
    }
  };

  const selectComponentSuggestion = (name: string) => {
    setNewCompName(name);
    setShowComponentDropdown(false);
  };

  // Add component to active list
  const addComponent = () => {
    if (!newCompName.trim()) return;
    const dosageStr = newCompDosage.trim() || '---';
    setComponents(prev => [...prev, { name: newCompName.trim(), dosage: dosageStr }]);
    setNewCompName('');
    setNewCompDosage('');
  };

  // Remove component from list
  const removeComponent = (index: number) => {
    setComponents(prev => prev.filter((_, i) => i !== index));
  };

  // Handle times management
  const addTime = () => {
    if (!timePickerInput) return;
    if (!times.includes(timePickerInput)) {
      setTimes(prev => [...prev, timePickerInput].sort());
    }
    setTimePickerInput('');
  };

  const removeTime = (idx: number) => {
    setTimes(prev => prev.filter((_, i) => i !== idx));
  };

  // Handle Google Calendar sync for Compounded Formulas
  const handleGoogleCalendarSync = () => {
    const text = encodeURIComponent(`Tomar ${formulaName}`);
    
    const componentsListStr = components.map(c => `- ${c.name} (${c.dosage})`).join('\n');
    const displayInstructions = `Instruções: Fórmula manipulada na forma de cápsula. Tomar ${capsuleDosage} cápsula(s).\n\nComponentes:\n${componentsListStr}\n\nFrequência: ${frequency}\nHorários: ${times.join(', ')}\n${howToTake !== 'Selecione' ? `Como tomar: ${howToTake}\n` : ''}${indication ? `Indicação: ${indication}\n` : ''}`;
    
    const details = encodeURIComponent(`${displayInstructions}\n\nPara registrar que tomou e monitorar sua adesão, acesse: https://crossmeds.com.br`);
    const location = encodeURIComponent('Em casa');
    
    // Construct real start date time for Google Calendar TEMPLATE (format: YYYYMMDDTHHMMSS)
    const dateStr = (recipeDate || new Date().toISOString().split('T')[0]).replace(/-/g, '');
    const rawTime = times[0] || '08:00';
    const firstTime = rawTime.replace(':', '');
    
    const startDateTime = `${dateStr}T${firstTime}00`;
    let endHour = parseInt(rawTime.substring(0, 2)) + 1;
    if (endHour >= 24) endHour = 23;
    const endDateTime = `${dateStr}T${endHour.toString().padStart(2, '0')}${rawTime.substring(3)}00`;
    
    // Recurrence rule for active frequency
    const recur = '&recur=RRULE:FREQ=DAILY';
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}&location=${location}&dates=${startDateTime}/${endDateTime}${recur}&sf=true&output=xml`;
    window.open(googleCalendarUrl, '_blank');
    
    // Already saved, just go back
    setShowSavedModal(false);
    onBack();
  };

  // Handle ICS File download for Compounded Formulas
  const handleExportIcsFile = () => {
    const summary = `Tomar ${formulaName}`;
    const componentsListStr = components.map(c => `- ${c.name} (${c.dosage})`).join('\\n');
    const desc = `Instruções: Fórmula manipulada. Tomar ${capsuleDosage} cápsula(s).\\n\\nComponentes:\\n${componentsListStr}\\n\\nFrequência: ${frequency}\\nHorários: ${times.join(', ')}\\n${howToTake !== 'Selecione' ? `Como tomar: ${howToTake}\\n` : ''}${indication ? `Indicação: ${indication}\\n` : ''}\\n\\nPara registrar que tomou e monitorar sua adesão, acesse: https://crossmeds.com.br`;
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CrossMeds//NONSGML Medication Lembretes//PT',
      'BEGIN:VEVENT',
      `SUMMARY:${summary}`,
      `DESCRIPTION:${desc}`,
      'URL:https://crossmeds.com.br',
      'DTSTART:20260605T080000Z',
      'DTEND:20260605T083000Z',
      'RRULE:FREQ=DAILY',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${formulaName || 'formula'}_lembrete.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Already saved, just go back
    setShowSavedModal(false);
    onBack();
  };

  // Handle saving the completed formula
  const handleSave = async () => {
    if (!formulaName.trim()) {
      setErrorMsg('Por favor, informe o nome da fórmula.');
      return;
    }
    if (components.length === 0) {
      setErrorMsg('Por favor, adicione pelo menos um componente à fórmula.');
      return;
    }
    if (times.length === 0) {
      setErrorMsg('Por favor, adicione pelo menos um horário de administração.');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    // Pre-format the dosage text so it lists capsule count and lists ingredients summaries
    const compSummary = components.map(c => `${c.name} ${c.dosage}`).join(' + ');
    const displayDosageText = `${capsuleDosage} cápsula(s) e dose`;

    const formulaData: Partial<Medication> = {
      name: formulaName.trim(),
      isCompounded: true,
      components: components,
      dosage: displayDosageText,
      type: 'Fórmula',
      route: 'Oral',
      frequency: frequency,
      time: times[0] || '08:00',
      times: times,
      startDate: recipeDate,
      endDate: durationMode === 'defined' && endDate ? endDate : undefined,
      instructions: components.map(c => `${c.name}: ${c.dosage}`).join('\n'),
      howToTake: howToTake === 'Selecione' ? undefined : howToTake,
      indication: indication.trim() || undefined,
      active: true,
    };

    try {
      await onSave(formulaData, true);
      setSaveSuccess(true);
      setShowSavedModal(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Erro ao guardar a fórmula no Firestore.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`min-h-screen pb-24 ${darkMode ? 'bg-[#121824] text-white' : 'bg-[#f4fbf9] text-zinc-800'}`}>
      {/* Header Bar */}
      <header className={`sticky top-0 z-40 flex items-center gap-4 px-6 py-4 border-b ${
        darkMode ? 'bg-[#1a2232] border-zinc-800' : 'bg-[#e3f7f2] border-emerald-100'
      }`}>
        <button 
          onClick={onBack}
          className={`p-2 rounded-xl transition ${darkMode ? 'hover:bg-zinc-800' : 'hover:bg-emerald-200/50'}`}
        >
          <ArrowLeft size={20} className="text-[#0fb383]" />
        </button>
        <h1 className="text-lg font-black tracking-tight text-[#0fb383]">Adicionar Fórmula Manipulada</h1>
      </header>

      <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
        {errorMsg && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400">
            <AlertCircle size={20} className="shrink-0" />
            <p className="text-sm font-semibold">{errorMsg}</p>
          </div>
        )}

        {saveSuccess && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900 rounded-2xl flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
            <Check size={20} className="shrink-0" />
            <p className="text-sm font-semibold">Fórmula manipulada adicionada com sucesso!</p>
          </div>
        )}

        {/* Card 1: Nome da Fórmula */}
        <div className={`p-6 rounded-[2rem] border transition ${
          darkMode ? 'bg-[#1a2232] border-zinc-800' : 'bg-white border-zinc-100 shadow-sm'
        }`}>
          <div className="mb-6">
            <h2 className="text-lg font-black tracking-tight text-[#0fb383]">Nome da Fórmula</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Dê um nome para identificar sua fórmula (ex: "Remédio da manhã").</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-black uppercase text-zinc-400">Nome da Fórmula</label>
              <input
                type="text"
                placeholder="Ex: Fórmula para pressão"
                value={formulaName}
                onChange={(e) => setFormulaName(e.target.value)}
                className={`w-full mt-1.5 px-4 py-3.5 rounded-2xl border text-sm transition outline-none ${
                  darkMode 
                    ? 'bg-[#141b26] border-zinc-850 text-white focus:border-[#0fb383]' 
                    : 'bg-white border-zinc-150 text-zinc-800 focus:border-[#0fb383]'
                }`}
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase text-zinc-400">Data da Receita</label>
              <div className="relative mt-1.5">
                <input
                  type="date"
                  value={recipeDate}
                  onChange={(e) => setRecipeDate(e.target.value)}
                  className={`w-full px-4 py-3.5 pr-12 rounded-2xl border text-sm transition outline-none ${
                    darkMode 
                      ? 'bg-[#141b26] border-zinc-850 text-white focus:border-[#0fb383]' 
                      : 'bg-white border-zinc-150 text-zinc-800 focus:border-[#0fb383]'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Componentes */}
        <div className={`p-6 rounded-[2rem] border transition ${
          darkMode ? 'bg-[#1a2232] border-zinc-800' : 'bg-white border-zinc-100 shadow-sm'
        }`}>
          <div className="mb-6">
            <h2 className="text-lg font-black tracking-tight text-[#0fb383]">🧪 Componentes da Fórmula</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Adicione cada princípio ativo e sua respectiva dosagem.</p>
          </div>

          {/* Active list of added components */}
          {components.length > 0 && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 space-y-3">
              <label className="text-xs font-black uppercase text-[#0fb383]">Componentes Adicionados</label>
              <div className="grid grid-cols-1 gap-2">
                {components.map((comp, idx) => (
                  <div key={idx} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${
                    darkMode ? 'bg-[#161c28] border-zinc-800' : 'bg-white border-zinc-100 shadow-2xs'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-emerald-100 text-[#0fb383]">
                        <Beaker size={14} />
                      </div>
                      <span className="text-sm font-bold">{comp.name}</span>
                      <span className="text-xs text-zinc-400 italic">({comp.dosage})</span>
                    </div>
                    <button 
                      onClick={() => removeComponent(idx)}
                      className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 p-2 rounded-lg transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form to add a new component */}
          <div className="space-y-4 pt-4 border-t border-dashed border-zinc-150 dark:border-zinc-800">
            <div ref={componentRef} className="relative">
              <label className="text-xs font-black uppercase text-zinc-400">Nome do Componente</label>
              
              <div className="relative mt-1.5">
                <input
                  type="text"
                  placeholder="Buscar componente ou digite nome..."
                  value={newCompName}
                  onChange={(e) => handleComponentChange(e.target.value)}
                  className={`w-full px-4 py-3.5 pr-12 rounded-2xl border text-sm transition outline-none ${
                    darkMode 
                      ? 'bg-[#141b26] border-zinc-850 text-white focus:border-[#0fb383]' 
                      : 'bg-white border-zinc-150 text-zinc-800 focus:border-[#0fb383]'
                  }`}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400">
                  {isSearchingComponents ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Search size={18} />
                  )}
                </div>
              </div>

              {/* Suggestions dropdown */}
              {showComponentDropdown && componentSuggestions.length > 0 && (
                <div className={`absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border shadow-xl max-h-56 overflow-y-auto ${
                  darkMode ? 'bg-[#1a2232] border-zinc-800 text-white' : 'bg-white border-zinc-100 text-zinc-800'
                }`}>
                  {componentSuggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => selectComponentSuggestion(item)}
                      className={`w-full px-4 py-3 text-left text-sm transition font-medium ${
                        darkMode ? 'hover:bg-zinc-800 text-zinc-300' : 'hover:bg-[#f0faf7] text-zinc-700'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-black uppercase text-zinc-400">Dosagem do Componente (ex: 50mg, 12,5mcg)</label>
              <input
                type="text"
                placeholder="--- mg"
                value={newCompDosage}
                onChange={(e) => setNewCompDosage(e.target.value)}
                className={`w-full mt-1.5 px-4 py-3.5 rounded-2xl border text-sm transition outline-none ${
                  darkMode 
                    ? 'bg-[#141b26] border-zinc-850 text-white focus:border-[#0fb383]' 
                    : 'bg-white border-zinc-150 text-zinc-800 focus:border-[#0fb383]'
                }`}
              />
            </div>

            <button
              type="button"
              onClick={addComponent}
              disabled={!newCompName.trim()}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-[#0fb383]/10 hover:bg-[#0fb383]/15 text-[#0fb383] font-black text-sm uppercase transition disabled:opacity-50"
            >
              <Plus size={16} />
              Adicionar Componente
            </button>
          </div>
        </div>

        {/* Card 3: Capsule usage instructions */}
        <div className={`p-6 rounded-[2rem] border transition ${
          darkMode ? 'bg-[#1a2232] border-zinc-800' : 'bg-white border-zinc-100 shadow-sm'
        }`}>
          <div className="mb-6">
            <h2 className="text-lg font-black tracking-tight text-[#0fb383]">💊 Instruções de Uso da Cápsula</h2>
          </div>

          <div className="space-y-5">
            {/* Capsule Dosagem */}
            <div>
              <label className="text-xs font-black uppercase text-zinc-400">Dosagem</label>
              <div className="flex items-center gap-3 mt-1.5">
                <input
                  type="number"
                  min="1"
                  value={capsuleDosage}
                  onChange={(e) => setCapsuleDosage(Math.max(1, parseInt(e.target.value) || 1))}
                  className={`w-20 px-3 py-2.5 rounded-xl border text-sm transition text-center outline-none ${
                    darkMode 
                      ? 'bg-[#141b26] border-zinc-850 text-white focus:border-[#0fb383]' 
                      : 'bg-white border-zinc-150 text-zinc-800 focus:border-[#0fb383]'
                  }`}
                />
                <span className="text-xs font-semibold text-zinc-400">cápsula(s) por dose</span>
              </div>
            </div>

            {/* Frequência */}
            <div>
              <label className="text-xs font-black uppercase text-zinc-400">Frequência</label>
              <select
                value={frequency}
                onChange={(e) => {
                  const val = e.target.value;
                  setFrequency(val);
                  if (val === 'Duas vezes por dia' || val === 'A cada 12 horas') {
                    setTimes(['08:00', '20:00']);
                  } else if (val === 'Três vezes por dia') {
                    setTimes(['08:00', '14:00', '20:00']);
                  } else if (val === 'A cada 8 horas') {
                    setTimes(['08:00', '16:00', '00:00']);
                  } else if (val === 'A cada 6 horas') {
                    setTimes(['06:00', '12:00', '18:00', '00:00']);
                  } else if (val === 'Necessário (SOS)') {
                    setTimes([]);
                  } else if (val === 'Diário' || val === 'Dia sim, dia não') {
                    setTimes(['08:00']);
                  }
                }}
                className={`w-full mt-1.5 px-4 py-3.5 rounded-2xl border text-sm transition outline-none ${
                  darkMode 
                    ? 'bg-[#141b26] border-zinc-850 text-white focus:border-[#0fb383]' 
                    : 'bg-white border-[#e4ebe8] text-zinc-800 focus:border-[#0fb383]'
                }`}
              >
                <option value="Diário">Diário</option>
                <option value="Duas vezes por dia">Duas vezes por dia</option>
                <option value="Três vezes por dia">Três vezes por dia</option>
                <option value="A cada 12 horas">A cada 12 horas</option>
                <option value="A cada 8 horas">A cada 8 horas</option>
                <option value="A cada 6 horas">A cada 6 horas</option>
                <option value="Dia sim, dia não">Dia sim, dia não</option>
                <option value="Uma vez por semana">Uma vez por semana</option>
                <option value="Necessário (SOS)">Necessário (SOS)</option>
              </select>
            </div>

            {/* Horários */}
            <div>
              <label className="text-xs font-black uppercase text-zinc-400">Horários de Tomar ({times.length})</label>
              
              <div className="flex flex-wrap gap-2 mt-2">
                {times.map((t, idx) => (
                  <span 
                    key={idx} 
                    className="inline-flex items-center gap-1.5 bg-[#0fb383]/10 text-[#0fb383] px-3 py-1.5 rounded-xl text-xs font-black"
                  >
                    <Clock size={12} />
                    {t}
                    <button 
                      type="button" 
                      onClick={() => removeTime(idx)}
                      className="ml-1 text-[#0fb383] hover:text-red-500 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {times.length === 0 && (
                  <span className="text-xs font-semibold text-zinc-400 italic">Nenhum horário selecionado</span>
                )}
              </div>

              {/* Quick Preset Buttons matching MedicationForm.tsx layout */}
              <div className="flex flex-wrap gap-2 mt-3">
                {[
                  { time: '08:00', label: 'Manhã', icon: '🌅', color: 'hover:bg-amber-100 hover:border-amber-300 bg-amber-50/50 border-amber-100 text-amber-800' },
                  { time: '12:00', label: 'Almoço', icon: '☀️', color: 'hover:bg-orange-100 hover:border-orange-300 bg-orange-50/50 border-orange-100 text-orange-850' },
                  { time: '16:00', label: 'Tarde', icon: '🌆', color: 'hover:bg-rose-100 hover:border-rose-300 bg-rose-50/50 border-rose-100 text-rose-800' },
                  { time: '20:00', label: 'Noite', icon: '🌙', color: 'hover:bg-indigo-100 hover:border-indigo-300 bg-indigo-50/50 border-indigo-100 text-indigo-850' },
                  { time: '22:00', label: 'Deitar', icon: '😴', color: 'hover:bg-purple-100 hover:border-purple-300 bg-purple-50/50 border-purple-100 text-purple-800' }
                ].map((preset) => (
                  <button
                    key={preset.time}
                    type="button"
                    onClick={() => {
                      if (!times.includes(preset.time)) {
                        setTimes(prev => [...prev, preset.time].sort());
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      darkMode 
                        ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-750' 
                        : preset.color
                    }`}
                  >
                    <span>{preset.icon}</span>
                    <span className="font-black">{preset.time}</span>
                    <span className="text-[10px] opacity-75">{preset.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex gap-2 mt-3.5">
                <input
                  type="time"
                  value={timePickerInput}
                  onChange={(e) => setTimePickerInput(e.target.value)}
                  className={`px-4 py-2.5 rounded-xl border text-sm transition outline-none ${
                    darkMode 
                      ? 'bg-[#141b26] border-zinc-850 text-white focus:border-[#0fb383]' 
                      : 'bg-white border-zinc-150 text-zinc-800 focus:border-[#0fb383]'
                  }`}
                />
                <button
                  type="button"
                  onClick={addTime}
                  disabled={!timePickerInput}
                  className="px-4 py-2 bg-[#0fb383] hover:bg-[#0da276] text-white font-bold rounded-xl text-xs transition disabled:opacity-50 cursor-pointer"
                >
                  + Adicionar Manual
                </button>
              </div>
            </div>

            {/* Como tomar */}
            <div>
              <label className="text-xs font-black uppercase text-zinc-400">Como tomar a cápsula?</label>
              <select
                value={howToTake}
                onChange={(e) => setHowToTake(e.target.value)}
                className={`w-full mt-1.5 px-4 py-3.5 rounded-2xl border text-sm transition outline-none ${
                  darkMode 
                    ? 'bg-[#141b26] border-zinc-850 text-white focus:border-[#0fb383]' 
                    : 'bg-white border-zinc-150 text-zinc-800 focus:border-[#0fb383]'
                }`}
              >
                <option value="Selecione">Selecione</option>
                <option value="Em jejum (com água)">Em jejum (com água)</option>
                <option value="Com alimentos">Com alimentos</option>
                <option value="Após as refeições">Após as refeições</option>
                <option value="Antes de deitar">Antes de deitar</option>
                <option value="Com água abundante">Com água abundante</option>
              </select>
            </div>

            {/* Indicação */}
            <div>
              <label className="text-xs font-black uppercase text-zinc-400">Indicação da Fórmula</label>
              <input
                type="text"
                placeholder="Ex: Controle da pressão, Vitaminas"
                value={indication}
                onChange={(e) => setIndication(e.target.value)}
                className={`w-full mt-1.5 px-4 py-3.5 rounded-2xl border text-sm transition outline-none ${
                  darkMode 
                    ? 'bg-[#141b26] border-zinc-850 text-white focus:border-[#0fb383]' 
                    : 'bg-white border-zinc-150 text-zinc-800 focus:border-[#0fb383]'
                }`}
              />
            </div>

            {/* Duração do tratamento */}
            <div>
              <label className="text-xs font-black uppercase text-zinc-400 block mb-2">Duração do tratamento</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                  <input
                    type="radio"
                    name="duration"
                    checked={durationMode === 'continuous'}
                    onChange={() => setDurationMode('continuous')}
                    className="accent-[#0fb383]"
                  />
                  Uso contínuo
                </label>
                <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                  <input
                    type="radio"
                    name="duration"
                    checked={durationMode === 'defined'}
                    onChange={() => setDurationMode('defined')}
                    className="accent-[#0fb383]"
                  />
                  Definir data de término
                </label>
              </div>

              {durationMode === 'defined' && (
                <div className="mt-3">
                  <label className="text-[10px] font-black uppercase text-zinc-400">Data de Término</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={`w-full mt-1.5 px-4 py-3 py-3.5 rounded-2xl border text-sm transition outline-none ${
                      darkMode 
                        ? 'bg-[#141b26] border-zinc-850 text-white focus:border-[#0fb383]' 
                        : 'bg-white border-zinc-150 text-zinc-800 focus:border-[#0fb383]'
                    }`}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Save button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || saveSuccess}
          className="flex items-center justify-center gap-3 w-full py-4.5 rounded-[2rem] bg-[#0fb383] hover:bg-[#0da276] text-white font-black text-md uppercase transition shadow-lg shadow-[#0fb383]/20 disabled:opacity-55 cursor-pointer"
        >
          {saving ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Save size={20} />
          )}
          Salvar Fórmula
        </button>
      </div>

      {/* Saved Modal Overlay */}
      {showSavedModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1a2232] rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl text-center space-y-6 border border-emerald-50 dark:border-zinc-800 max-h-[90vh] overflow-y-auto transform transition-all scale-100 animate-in zoom-in-95 duration-200">
            
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/20 rounded-full flex items-center justify-center text-[#0fb383] mb-4 shadow-inner">
                <Check size={44} className="stroke-[3]" />
              </div>
              <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Fórmula Salva!</h2>
              <p className="text-[#0fb383] font-black text-[10px] uppercase tracking-widest mt-1.5">Fórmula manipulada registrada no prontuário</p>
              <p className="text-zinc-500 dark:text-zinc-400 font-bold text-sm max-w-sm mt-3.5 leading-relaxed">
                Deseja criar um lembrete no seu calendário agora para receber os alertas de horários das cápsulas?
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleGoogleCalendarSync}
                className="w-full py-4 px-6 bg-[#0fb383] hover:bg-[#0da276] active:scale-98 text-white font-black rounded-2xl flex items-center justify-center gap-3 shadow-md shadow-[#0fb383]/10 transition-all cursor-pointer"
              >
                <Calendar size={20} />
                Sincronizar com Google Calendar
              </button>

              <button
                type="button"
                onClick={handleExportIcsFile}
                className="w-full py-4 px-6 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-white active:scale-98 text-zinc-800 font-bold rounded-2xl flex items-center justify-center gap-3 transition-all cursor-pointer"
              >
                <Download size={20} />
                Exportar Ficheiro (.ics)
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSavedModal(false);
                  onBack();
                }}
                className="w-full py-4 px-6 bg-white dark:bg-[#121824] border-2 border-zinc-200/80 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 active:scale-98 text-zinc-600 dark:text-zinc-400 font-bold rounded-2xl flex items-center justify-center transition-all cursor-pointer"
              >
                Voltar à Página Inicial
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
