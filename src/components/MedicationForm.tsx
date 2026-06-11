import React, { useState, useEffect, useRef } from 'react';
import { Medication, MedicationInteraction } from '../types';
import { VoiceButton } from './VoiceButton';
import { 
  X, Search, Loader2, Pill, Clock, Calendar, FileText, 
  Layers, Navigation, Package, Box, ArrowLeft, Plus, 
  Download, Save, Camera, Upload, ChevronDown, Check, Trash2, 
  Sparkles, AlertCircle, ShoppingBag
} from 'lucide-react';
import { getMedicationSuggestions, getDosageSuggestions, checkSingleMedicationInteractions } from '../services/interactionService';

interface Props {
  medication?: Medication;
  onSave: (data: Partial<Medication>, keepOpen?: boolean) => void;
  onClose: () => void;
  medications?: Medication[];
}

export const MedicationForm: React.FC<Props> = ({ medication, onSave, onClose, medications = [] }) => {
  const [formData, setFormData] = useState<Partial<Medication>>({
    name: '',
    dosage: '',
    frequency: 'Diário',
    times: [],
    startDate: new Date().toISOString().split('T')[0],
    instructions: '',
    active: true,
    type: 'Comprimidos',
    route: 'Oral',
    stock: 30,
    initialStock: 30,
    refillThreshold: 5,
    indication: '',
    howToTake: 'Selecione',
    purchaseDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    purchaseLocation: 'Selecione',
    durationDays: undefined,
  });

  // State to simulate receipt scanning animation
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccessMessage, setScanSuccessMessage] = useState('');

  // Stock controller optionality state
  const [controlarEstoque, setControlarEstoque] = useState(false);

  // Settle display quantities and dosage row fields
  const [dosageValue, setDosageValue] = useState('100 MG');
  const [quantity, setQuantity] = useState(1);
  const [stockDurationMessage, setStockDurationMessage] = useState('');

  // Inline time picker states for elderly/low-literacy users
  const [newTimeInput, setNewTimeInput] = useState('');
  const [timeError, setTimeError] = useState('');

  // Confirmation modal state
  const [showSavedModal, setShowSavedModal] = useState(false);

  // Auto suggestions states
  const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);
  const [dosageSuggestions, setDosageSuggestions] = useState<string[]>([]);
  const [isSearchingName, setIsSearchingName] = useState(false);
  const [showNameDropdown, setShowNameDropdown] = useState(false);
  const nameRef = useRef<HTMLDivElement>(null);

  // Auto populate on edit view
  useEffect(() => {
    if (medication) {
      setFormData({
        ...medication,
        times: medication.times || [medication.time || '08:00']
      });
      if (medication.dosage) {
        setDosageValue(medication.dosage);
      }
      if (medication.name) {
        getDosageSuggestions(medication.name).then(doses => {
          setDosageSuggestions(doses);
        });
      }
      setControlarEstoque(medication.stock !== undefined && medication.stock !== null);
    } else {
      setControlarEstoque(false);
    }
  }, [medication]);

  // Real-time active drug interactions
  const [activeInteractions, setActiveInteractions] = useState<MedicationInteraction[]>([]);

  useEffect(() => {
    if (!formData.name) {
      setActiveInteractions([]);
      return;
    }
    // Filter out the medication currently being edited from the check
    const otherMeds = medications.filter(m => !medication || m.id !== medication.id);
    const foundInteractions = checkSingleMedicationInteractions(formData.name, otherMeds);
    setActiveInteractions(foundInteractions);
  }, [formData.name, medications, medication]);

  // Handle outside dropdown clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (nameRef.current && !nameRef.current.contains(event.target as Node)) {
        setShowNameDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNameChange = async (val: string) => {
    setFormData(prev => ({ ...prev, name: val }));
    if (val.length >= 2) {
      setIsSearchingName(true);
      setShowNameDropdown(true);
      const results = await getMedicationSuggestions(val);
      setNameSuggestions(results);
      setIsSearchingName(false);
    } else {
      setNameSuggestions([]);
      setShowNameDropdown(false);
    }
  };

  const selectName = async (name: string) => {
    setFormData(prev => ({ ...prev, name }));
    setShowNameDropdown(false);
    
    const suggestedDoses = await getDosageSuggestions(name);
    setDosageSuggestions(suggestedDoses);
    
    if (name.toUpperCase().includes("LOSARTANA")) {
      setFormData(prev => ({ 
        ...prev, 
        type: "Comprimidos",
        indication: "Anti-hipertensivo (bloqueador do receptor de angiotensina II)" 
      }));
    } else if (name.toUpperCase().includes("AAS") || name.toUpperCase().includes("ACETILSALICILICO")) {
      setFormData(prev => ({
        ...prev,
        type: "Comprimidos",
        indication: "Analgésico / Anti-inflamatório / Antiagregante Plaquetário"
      }));
    }

    if (suggestedDoses && suggestedDoses.length > 0) {
      setDosageValue(suggestedDoses[0]);
      setFormData(prev => ({ ...prev, dosage: suggestedDoses[0] }));
    } else {
      setDosageValue('');
      setFormData(prev => ({ ...prev, dosage: '' }));
    }
  };

  const handleScanSimulation = () => {
    setIsScanning(true);
    setScanSuccessMessage('');
    setTimeout(() => {
      setIsScanning(false);
      setScanSuccessMessage('Receita digitalizada com sucesso! Campo nome pré-preenchido.');
      setFormData(prev => ({
        ...prev,
        name: 'Losartana Potássica',
        dosage: '100 MG',
        frequency: 'Diário',
        times: ['08:00'],
        type: 'Comprimidos',
        route: 'Oral',
        howToTake: 'Com refeição ou após refeição',
        indication: 'Anti-hipertensivo (bloqueador do receptor de angiotensina II)',
        stock: 30,
        initialStock: 30,
        purchaseLocation: 'Selecione',
        durationDays: undefined,
      }));
      setDosageValue('100 MG');
      setDosageSuggestions(['50 MG', '100 MG']);
      setQuantity(1);
    }, 2000);
  };

  const handleAddNewTimeInList = (selectedTime?: string) => {
    const timeToAdd = selectedTime || newTimeInput;
    if (!timeToAdd) {
      setTimeError('Por favor, defina um horário ou toque em uma sugestão abaixo.');
      return;
    }
    
    setTimeError('');
    const currentTimes = [...(formData.times || [])];
    
    if (currentTimes.includes(timeToAdd)) {
      setTimeError('Este horário já está adicionado.');
      return;
    }
    
    currentTimes.push(timeToAdd);
    currentTimes.sort((a, b) => {
      const [hA, mA] = a.split(':').map(Number);
      const [hB, mB] = b.split(':').map(Number);
      return (hA * 60 + mA) - (hB * 60 + mB);
    });
    
    setFormData(prev => ({ ...prev, times: currentTimes }));
    if (!selectedTime) {
      setNewTimeInput(''); 
    }
  };

  const handleRemoveClockTime = (index: number) => {
    const currentTimes = [...(formData.times || [])];
    currentTimes.splice(index, 1);
    setFormData(prev => ({ ...prev, times: currentTimes }));
  };

  const getTimePeriodInfo = (timeStr: string) => {
    if (!timeStr) return { label: 'Horário', icon: '⏰', color: 'bg-zinc-100/50 text-zinc-700' };
    const [hourStr] = timeStr.split(':');
    const hour = parseInt(hourStr, 10);
    
    if (hour >= 5 && hour < 12) {
      return { label: 'Manhã', icon: '🌅', color: 'bg-amber-50 text-amber-700 border-amber-100/50' };
    } else if (hour >= 12 && hour < 18) {
      return { label: 'Tarde / Almoço', icon: '☀️', color: 'bg-orange-50 text-orange-700 border-orange-100/50' };
    } else if (hour >= 18 && hour < 23) {
      return { label: 'Noite / Jantar', icon: '🌙', color: 'bg-indigo-50 text-indigo-700 border-indigo-100/50' };
    } else {
      return { label: 'Madrugada / Deitar', icon: '😴', color: 'bg-purple-50 text-purple-700 border-purple-100/50' };
    }
  };

  const handleCalculateStockEnding = () => {
    const currentStock = formData.stock || 0;
    const dosesPerDay = formData.times?.length || 1;
    if (currentStock <= 0) {
      setStockDurationMessage('Por favor, informe uma Quantidade Atual maior que zero.');
      return;
    }
    const daysRemaining = Math.floor(currentStock / (quantity * dosesPerDay));
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysRemaining);

    const formattedDate = targetDate.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    setStockDurationMessage(
      `Com base na quantidade atual (${currentStock} ${formData.type?.toLowerCase()}), seu estoque vai durar aproximadamente ${daysRemaining} dias, terminando em: ${formattedDate}.`
    );
  };

  const getFinalMedicationToSubmit = () => {
    const medicationToSubmit = {
      ...formData,
      dosage: dosageValue.trim() || '1 Dose',
      time: formData.times?.[0] || '08:00',
    };
    
    if (!controlarEstoque) {
      delete medicationToSubmit.stock;
      delete medicationToSubmit.initialStock;
      delete medicationToSubmit.refillThreshold;
      delete medicationToSubmit.purchaseDate;
      delete medicationToSubmit.expiryDate;
      delete medicationToSubmit.purchaseLocation;
    }
    
    return medicationToSubmit;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    
    // Save medication directly and keep the form open so the user sees the success modal options
    onSave(getFinalMedicationToSubmit(), true);
    setShowSavedModal(true);
  };

  const handleFinishSave = () => {
    setShowSavedModal(false);
    onClose();
  };

  const handleGoogleCalendarSync = () => {
    // Generate Google Calendar Link Dynamically
    const text = encodeURIComponent(`Tomar ${formData.name}`);
    const details = encodeURIComponent(`Dosagem: ${dosageValue}\nInstruções: ${formData.howToTake !== 'Selecione' && formData.howToTake ? formData.howToTake : ''}. Indicação: ${formData.instructions || ''}\n\nPara registrar que tomou e monitorar sua adesão, acesse: https://crossmeds.com.br`);
    const location = encodeURIComponent('Em casa');
    
    // Construct real start date time for Google Calendar TEMPLATE (format: YYYYMMDDTHHMMSS)
    const dateStr = (formData.startDate || new Date().toISOString().split('T')[0]).replace(/-/g, '');
    const rawTime = formData.times?.[0] || '08:00';
    const firstTime = rawTime.replace(':', '');
    
    const startDateTime = `${dateStr}T${firstTime}00`;
    let endHour = parseInt(rawTime.substring(0, 2)) + 1;
    if (endHour >= 24) endHour = 23;
    const endDateTime = `${dateStr}T${endHour.toString().padStart(2, '0')}${rawTime.substring(3)}00`;
    
    // Recurrence rule for active frequency
    const recur = '&recur=RRULE:FREQ=DAILY';
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}&location=${location}&dates=${startDateTime}/${endDateTime}${recur}&sf=true&output=xml`;
    window.open(googleCalendarUrl, '_blank');
    
    // Already saved, just close form and return home
    onClose();
  };

  const handleExportIcsFile = () => {
    // Generate real iCalendar standard string
    const summary = `Tomar ${formData.name}`;
    const desc = `Dose: ${dosageValue} por via ${formData.route}. ${formData.instructions || ''}\\n\\nPara registrar que tomou e monitorar sua adesão, acesse: https://crossmeds.com.br`;
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
    link.setAttribute('download', `${formData.name || 'medicamento'}_lembrete.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Already saved, just close form and return home
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#e8f5ee] z-50 overflow-y-auto px-4 py-6 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto bg-[#f8fcf9] rounded-[2.5rem] border border-zinc-200/80 shadow-lg overflow-hidden pb-12">
        
        {/* Custom Screen Header exactly like photos */}
        <div className="px-6 py-6 border-b border-emerald-100/50 flex items-center gap-4 bg-white">
          <button 
            type="button" 
            onClick={onClose} 
            className="p-3 bg-zinc-50 hover:bg-zinc-100 rounded-full transition-all active:scale-95 text-zinc-700"
            id="back-btn-form"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <span className="text-[10px] font-black tracking-widest text-[#15a350] uppercase">Módulo de Prescrição</span>
            <h2 className="text-2xl font-black text-zinc-900 tracking-tight leading-tight">
              {medication ? 'Editar Medicamento' : 'Cadastrar Medicamento'}
            </h2>
          </div>
        </div>

        {/* Outer Form */}
        <form onSubmit={handleSubmit} className="px-6 md:px-10 py-8 space-y-8">
          
          {/* INTERACTION ALERTS BANNER (SCREENSHOT ALIGNED) */}
          {activeInteractions.length > 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
              {activeInteractions.map((inter, idx) => {
                let cardBg = 'bg-[#dc2626] border-red-700'; // high severity
                let headerText = '⚠️⚠️ INTERAÇÃO QUE EXIGE ACOMPANHAMENTO';
                
                if (inter.severity === 'moderate') {
                  cardBg = 'bg-[#ea580c] border-orange-600';
                  headerText = '⚠️⚠️ INTERAÇÃO QUE EXIGE ATENÇÃO (RELAÇÃO MODERADA)';
                } else if (inter.severity === 'low') {
                  cardBg = 'bg-[#16a34a] border-emerald-600';
                  headerText = '✅ INTERAÇÃO EM MONITORAMENTO (RELAÇÃO LEVE)';
                }
                
                return (
                  <div key={idx} className="space-y-3">
                    {/* Primary interaction status card (solid background, bold sans-serif text) */}
                    <div className={`${cardBg} text-white p-6 rounded-3xl space-y-3 shadow-md border-2`}>
                      <div className="flex items-center gap-2 text-base md:text-[17px] font-black tracking-wide">
                        <span>{headerText}</span>
                      </div>
                      <p className="text-sm md:text-base font-bold leading-normal">
                        Interação entre {inter.medicationNames[0].toUpperCase()} e {inter.medicationNames[1].toUpperCase()}. Sintomas: {inter.description}
                      </p>
                      <p className="text-[13px] md:text-sm font-bold leading-normal pt-1 border-t border-white/20">
                        <strong className="underline font-black">Recomendação:</strong> {inter.recommendation}
                      </p>
                    </div>

                    {/* Secondary blue alert card from screenshot */}
                    <div className="bg-[#eff6ff] border-2 border-blue-100 p-5 rounded-3xl text-[#1e40af] space-y-2">
                      <div className="flex items-center gap-2 font-black text-sm">
                        <span>ℹ️ Recomendação Importante</span>
                      </div>
                      <p className="text-xs md:text-sm font-bold opacity-90 leading-normal">
                        Não interrompa o uso. Mostre este alerta ao seu médico na próxima consulta.
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Section: Scan Section exact visual matching */}
          <div className="bg-[#eefcf4] rounded-3xl p-6 border border-emerald-100 text-center relative overflow-hidden shadow-xs">
            {isScanning && (
              <div className="absolute inset-0 bg-emerald-950/20 backdrop-blur-xs flex flex-col items-center justify-center z-10">
                <Loader2 size={40} className="text-[#15a350] animate-spin mb-3" />
                <span className="text-sm font-extrabold text-white uppercase tracking-wider">Analisando Prescrição...</span>
              </div>
            )}
            
            <div className="flex flex-col items-center mb-5">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-50 mb-3">
                <Camera size={28} />
              </div>
              <h3 className="text-xl font-extrabold text-[#2563eb] tracking-tight">Escanear Receita Médica</h3>
              <p className="text-xs font-semibold text-zinc-500 mt-1">Fotografe sua receita para preenchimento automático</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <button
                type="button"
                onClick={handleScanSimulation}
                className="flex-1 py-4.5 px-6 bg-[#3b82f6] hover:bg-blue-600 active:scale-95 text-white font-extrabold text-sm rounded-2xl shadow-md shadow-blue-100 flex items-center justify-center gap-2 transition-all"
                id="btn-scan-recipe"
              >
                <Camera size={18} />
                Fotografar Receita
              </button>
              
              <button
                type="button"
                onClick={handleScanSimulation}
                className="flex-1 py-4.5 px-6 bg-[#15a350] hover:bg-emerald-600 active:scale-95 text-white font-extrabold text-sm rounded-2xl shadow-md shadow-emerald-100 flex items-center justify-center gap-2 transition-all"
                id="btn-select-file"
              >
                <Upload size={18} />
                Selecionar Arquivo
              </button>
            </div>

            {scanSuccessMessage && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-[#15a350] rounded-xl text-xs font-bold inline-block max-w-lg">
                🎉 {scanSuccessMessage}
              </div>
            )}
          </div>

          {/* Section: Informações do Medicamento */}
          <div className="bg-white rounded-[2rem] border border-zinc-100 p-6 md:p-8 space-y-6 shadow-xs">
            <h3 className="text-lg font-black text-zinc-900 border-b border-zinc-50 pb-3 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-[#15a350] rounded-full"></div>
              Informações do Medicamento
            </h3>

            {/* Nome do Medicamento with autocompletion */}
            <div className="space-y-2 relative" ref={nameRef}>
              <label className="text-xs font-black text-zinc-500 uppercase tracking-wider block">
                Nome do Medicamento
              </label>
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <input
                    required
                    type="text"
                    placeholder="Selecione ou digite um medicamento..."
                    className="w-full pl-5 pr-12 py-4 bg-[#f8fcf9] border border-zinc-200/80 rounded-2xl focus:ring-4 focus:ring-[#15a350]/10 focus:border-[#15a350] outline-none font-bold text-zinc-800 transition-all placeholder:text-zinc-400 placeholder:font-semibold"
                    value={formData.name || ''}
                    onChange={e => handleNameChange(e.target.value)}
                    id="medication-name-input"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {isSearchingName ? (
                      <Loader2 size={18} className="text-[#15a350] animate-spin" />
                    ) : (
                      <ChevronDown size={18} className="text-zinc-400" />
                    )}
                  </div>
                </div>
                <VoiceButton 
                  onResult={(text) => handleNameChange(text)}
                  placeholder="Diga o nome do remédio..."
                  className="h-[56px] w-[56px] rounded-2xl shadow-xs"
                  size={20}
                />
              </div>

              {/* Autocomplete Suggestion Dropdown */}
              {showNameDropdown && nameSuggestions.length > 0 && (
                <div className="absolute top-[102%] left-0 right-0 max-h-64 overflow-y-auto bg-white border border-emerald-100 rounded-2xl shadow-xl z-50 p-2 space-y-1">
                  {nameSuggestions.map((name, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => selectName(name)}
                      className="w-full text-left px-4 py-3 hover:bg-[#eefcf4] rounded-xl text-sm font-bold text-zinc-700 transition-colors flex items-center gap-2"
                    >
                      <Pill size={14} className="text-[#15a350]" />
                      {name.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Data da Receita */}
            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-wider block">
                Data da Receita
              </label>
              <div className="relative">
                <input
                  required
                  type="date"
                  className="w-full pl-12 pr-5 py-4 bg-[#f8fcf9] border border-zinc-200/80 rounded-2xl focus:ring-4 focus:ring-[#15a350]/10 focus:border-[#15a350] outline-none font-bold text-zinc-800 transition-all"
                  value={formData.startDate}
                  onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  id="data-receita-input"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                  <Calendar size={18} />
                </div>
              </div>
            </div>

            {/* Dosagem & Custom Row Setup as in Screenshot 4 */}
            {formData.name && (
              <div className="space-y-3 pt-2">
                <label className="text-xs font-black text-zinc-500 uppercase tracking-wider block mb-1">
                  Dosagem
                </label>
                
                {/* Predefined values row */}
                <div className="bg-[#fcfefe] border border-zinc-100 p-4 rounded-2xl space-y-2">
                  <span className="text-[11px] font-bold text-zinc-400 block">
                    {dosageSuggestions.length > 0 ? 'Dosagem disponível na receita/base de dados:' : 'Ou selecione uma concentração sugerida:'}
                  </span>
                  <div className="flex flex-wrap gap-4">
                    {(dosageSuggestions.length > 0 ? dosageSuggestions : ['25 MG', '50 MG', '100 MG', '500 MG']).map((preset) => (
                      <label key={preset} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          name="preset-dosage"
                          checked={dosageValue.toUpperCase().trim() === preset.toUpperCase().trim()}
                          onChange={() => {
                            setDosageValue(preset);
                            setFormData(prev => ({ ...prev, dosage: preset }));
                          }}
                          className="w-4 h-4 text-[#15a350] border-zinc-300 focus:ring-[#15a350]/20 checked:bg-[#15a350]"
                        />
                        <span className="text-sm font-bold text-zinc-700 group-hover:text-emerald-700 transition-colors">
                          {preset}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Custom Flex Row (Concentration + Qty. + Form unit) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  
                  {/* Concentration Input */}
                  <div className="md:col-span-6 relative">
                    <input
                      required
                      type="text"
                      placeholder="Concentração (ex: 100 MG)"
                      value={dosageValue}
                      onChange={e => {
                        setDosageValue(e.target.value);
                        setFormData(prev => ({ ...prev, dosage: e.target.value }));
                      }}
                      className="w-full px-5 py-4 bg-[#f8fcf9] border border-zinc-200/80 rounded-2xl focus:ring-4 focus:ring-[#15a350]/10 focus:border-[#15a350] outline-none font-bold text-zinc-800 transition-all placeholder:text-zinc-400 placeholder:font-semibold"
                      id="dosage-val-input"
                    />
                  </div>

                  {/* Dose Quantity Selector */}
                  <div className="md:col-span-2 relative">
                    <select
                      className="w-full pl-4 pr-10 py-4 bg-[#f8fcf9] border border-zinc-200/80 rounded-2xl focus:ring-4 focus:ring-[#15a350]/10 focus:border-[#15a350] outline-none font-bold text-zinc-800 appearance-none cursor-pointer"
                      value={quantity}
                      onChange={e => setQuantity(parseInt(e.target.value))}
                      id="select-qty-units"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                      <ChevronDown size={16} />
                    </div>
                  </div>

                  {/* Medication unit category */}
                  <div className="md:col-span-4 relative">
                    <select
                      className="w-full pl-4 pr-10 py-4 bg-[#f8fcf9] border border-zinc-200/80 rounded-2xl focus:ring-4 focus:ring-[#15a350]/10 focus:border-[#15a350] outline-none font-bold text-zinc-800 appearance-none cursor-pointer"
                      value={formData.type}
                      onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      id="select-med-type"
                    >
                      <option value="Comprimidos">Comprimidos</option>
                      <option value="Cápsulas">Cápsulas</option>
                      <option value="Gotas">Gotas</option>
                      <option value="Xarope / mL">Xarope / mL</option>
                      <option value="Injetável">Injetável</option>
                      <option value="Pomada">Pomada</option>
                      <option value="Doses / Puffs">Doses / Puffs</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Frequência */}
            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-wider block">
                Frequência
              </label>
              <div className="relative">
                <select
                  required
                  className="w-full pl-5 pr-12 py-4 bg-[#f8fcf9] border border-zinc-200/80 rounded-2xl focus:ring-4 focus:ring-[#15a350]/10 focus:border-[#15a350] outline-none font-bold text-zinc-800 appearance-none cursor-pointer"
                  value={formData.frequency}
                  onChange={e => {
                    setFormData(prev => ({ ...prev, frequency: e.target.value }));
                    // Adjust multiple times based on shorthand
                    if (e.target.value === '2x ao dia') setFormData(prev => ({ ...prev, times: ['08:00', '20:00'] }));
                    else if (e.target.value === '3x ao dia') setFormData(prev => ({ ...prev, times: ['08:00', '14:00', '20:00'] }));
                    else if (e.target.value === '4x ao dia') setFormData(prev => ({ ...prev, times: ['06:00', '12:00', '18:00', '00:00'] }));
                    else setFormData(prev => ({ ...prev, times: [] }));
                  }}
                  id="frequency-select"
                >
                  <option value="Selecione">Selecione</option>
                  <option value="Diário">Diário</option>
                  <option value="2x ao dia">2x ao dia</option>
                  <option value="3x ao dia">3x ao dia</option>
                  <option value="4x ao dia">4x ao dia</option>
                  <option value="Semanal">Semanal</option>
                  <option value="Se necessário (SOS)">Se necessário (SOS)</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>

            {/* Horários */}
            <div className="space-y-4 bg-zinc-50/50 p-4 rounded-3xl border border-zinc-100">
              <div className="space-y-1">
                <label className="text-sm font-bold text-zinc-800 block">
                  ⏰ Escolha o Horário de Tomar
                </label>
                <span className="text-[11px] text-zinc-400 block font-medium">
                  Selecione o horário abaixo e adicione para criar a lista de alarmes.
                </span>
              </div>

              {/* Inline input + add button right next to it ("na frente") */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type="time"
                    value={newTimeInput}
                    onChange={e => setNewTimeInput(e.target.value)}
                    className="w-full px-5 py-4 bg-white border-2 border-zinc-200 rounded-2xl focus:ring-4 focus:ring-[#15a350]/10 focus:border-[#15a350] outline-none font-bold text-xl text-zinc-700 transition-all text-center sm:text-left"
                    style={{ minHeight: '56px' }}
                  />
                  {!newTimeInput && (
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-zinc-300 font-bold text-base hidden sm:inline">
                      -- : --
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleAddNewTimeInList()}
                  className="px-6 py-4 bg-[#15a350] hover:bg-emerald-600 active:scale-[0.98] text-white font-bold text-base rounded-2xl flex items-center justify-center gap-2 shadow-xs transition-all whitespace-nowrap"
                  style={{ minHeight: '56px' }}
                >
                  <Plus size={20} className="stroke-[3]" /> Adicionar Horário
                </button>
              </div>

              {timeError && (
                <p className="text-red-600 font-bold text-xs flex items-center gap-1.5 px-1">
                  <AlertCircle size={14} /> {timeError}
                </p>
              )}

              {/* Elderly-friendly presets (big buttons, pre-formatted times & icons) */}
              <div className="space-y-2 pt-1 border-t border-dashed border-zinc-200">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                  🕒 Toque para adicionar direto:
                </span>
                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2">
                  {[
                    { time: '08:00', label: 'Manhã', icon: '🌅', color: 'hover:bg-amber-100 hover:border-amber-300 bg-amber-50/50 border-amber-100 text-amber-800' },
                    { time: '12:00', label: 'Almoço', icon: '☀️', color: 'hover:bg-orange-100 hover:border-orange-300 bg-orange-50/50 border-orange-100 text-orange-850' },
                    { time: '16:05', label: 'Tarde', icon: '🌆', color: 'hover:bg-rose-100 hover:border-rose-300 bg-rose-50/50 border-rose-100 text-rose-800' },
                    { time: '20:00', label: 'Noite', icon: '🌙', color: 'hover:bg-indigo-100 hover:border-indigo-300 bg-indigo-50/50 border-indigo-100 text-indigo-805' },
                    { time: '22:00', label: 'Deitar', icon: '😴', color: 'hover:bg-purple-100 hover:border-purple-300 bg-purple-50/50 border-purple-100 text-purple-800' },
                  ].map(preset => (
                    <button
                      key={preset.time}
                      type="button"
                      onClick={() => handleAddNewTimeInList(preset.time)}
                      className={`py-3 px-2 border-2 rounded-xl flex flex-col items-center justify-center transition-all ${preset.color} active:scale-95`}
                    >
                      <span className="text-xl mb-0.5" role="img" aria-label={preset.label}>{preset.icon}</span>
                      <span className="font-extrabold text-[13px]">{preset.time}</span>
                      <span className="text-[9px] font-bold opacity-80">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* List of currently added times (styled for low literacy: big cards) */}
              <div className="space-y-2 pt-2 border-t border-dashed border-zinc-200">
                <span className="text-[11px] font-black text-zinc-500 uppercase tracking-wider block">
                  Horários Escolhidos ({formData.times?.length || 0})
                </span>
                
                {(!formData.times || formData.times.length === 0) ? (
                  <div className="py-6 px-4 border-2 border-dashed border-zinc-200 rounded-2xl text-center">
                    <span className="text-2xl block mb-1">⏱️</span>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
                      Nenhum horário adicionado ainda
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Adicione acima ou toque em um botão de atalho rápido.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {formData.times.map((time, idx) => {
                      const period = getTimePeriodInfo(time);
                      return (
                        <div 
                          key={time} 
                          className={`flex items-center justify-between p-3.5 border-2 rounded-2xl font-bold text-base transition-all ${period.color} shadow-xs`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{period.icon}</span>
                            <div>
                              <div className="text-xl font-extrabold tracking-tight text-zinc-800 leading-none">
                                {time}
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-wider opacity-75">
                                {period.label}
                              </span>
                            </div>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => handleRemoveClockTime(idx)}
                            className="bg-white/90 hover:bg-red-50 hover:text-red-600 text-zinc-400 p-2.5 rounded-full border border-zinc-200 hover:border-red-200 transition-all active:scale-95 flex items-center justify-center"
                            title="Remover horário"
                          >
                            <Trash2 size={18} className="stroke-[2.5]" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Como tomar */}
            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-wider block">
                Como tomar
              </label>
              <div className="relative">
                <select
                  className="w-full pl-5 pr-12 py-4 bg-[#f8fcf9] border border-zinc-200/80 rounded-2xl focus:ring-4 focus:ring-[#15a350]/10 focus:border-[#15a350] outline-none font-bold text-zinc-800 appearance-none cursor-pointer"
                  value={formData.howToTake}
                  onChange={e => setFormData(prev => ({ ...prev, howToTake: e.target.value }))}
                  id="how-to-take-select"
                >
                  <option value="Selecione">Selecione</option>
                  <option value="Com refeição">Com refeição</option>
                  <option value="Com refeição ou após refeição">Com refeição ou após refeição</option>
                  <option value="Com ou sem alimentos">Com ou sem alimentos</option>
                  <option value="Em jejum (30min antes ou 2h após refeições)">Em jejum (30min antes ou 2h após refeições)</option>
                  <option value="Jejum, 30–60 minutos antes do café da manhã">Jejum, 30–60 minutos antes do café da manhã</option>
                  <option value="Durante ou logo após a refeição principal">Durante ou logo após a refeição principal</option>
                  <option value="À noite, com jantar">À noite, com jantar</option>
                  <option value="Com água, preferencialmente com refeição">Com água, preferencialmente com refeição</option>
                  <option value="Em jejum absoluto 30-40 antes do café da manhã">Em jejum absoluto 30-40 antes do café da manhã</option>
                  <option value="Com refeição contendo gordura">Com refeição contendo gordura</option>
                  <option value="Em jejum (à noite), preferencialmente 2h após jantar">Em jejum (à noite), preferencialmente 2h após jantar</option>
                  <option value="30 min antes do café da manhã">30 min antes do café da manhã</option>
                  <option value="Ao deitar">Ao deitar</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>

            {/* Indicação */}
            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-wider block">
                Indicação
              </label>
              <input
                type="text"
                placeholder="Ex: Dor de cabeça"
                value={formData.indication || ''}
                onChange={e => setFormData(prev => ({ ...prev, indication: e.target.value }))}
                className="w-full px-5 py-4 bg-[#f8fcf9] border border-zinc-200/80 rounded-2xl focus:ring-4 focus:ring-[#15a350]/10 focus:border-[#15a350] outline-none font-bold text-zinc-800 transition-all placeholder:text-zinc-400 placeholder:font-semibold"
                id="indication-input"
              />
            </div>

            {/* Duração do tratamento (Continuous use toggle) */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-wider block">
                Duração do tratamento
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="duration-type"
                    checked={formData.durationDays === undefined}
                    onChange={() => setFormData(prev => ({ ...prev, durationDays: undefined, endDate: undefined }))}
                    className="w-5 h-5 text-[#15a350] border-zinc-300 focus:ring-[#15a350]/20 checked:bg-[#15a350]"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-zinc-800 group-hover:text-emerald-700 transition-colors">
                      Uso contínuo
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="duration-type"
                    checked={formData.durationDays !== undefined}
                    onChange={() => setFormData(prev => ({ ...prev, durationDays: 30, endDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0] }))}
                    className="w-5 h-5 text-[#15a350] border-zinc-300 focus:ring-[#15a350]/20 checked:bg-[#15a350]"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-zinc-800 group-hover:text-emerald-700 transition-colors">
                      Definir data de término
                    </span>
                  </div>
                </label>
              </div>

              {formData.durationDays !== undefined && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 p-4 bg-zinc-50/50 rounded-2xl border border-zinc-100 animate-in fade-in duration-200">
                  <div className="space-y-2">
                    <span className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-widest block">Qtd de Dias</span>
                    <input
                      type="number"
                      min="1"
                      className="w-full px-4 py-3 bg-[#f8fcf9] border border-zinc-200/80 rounded-xl focus:outline-none focus:border-[#15a350] font-bold text-zinc-700"
                      value={formData.durationDays || ''}
                      onChange={e => {
                        const days = parseInt(e.target.value) || 0;
                        const date = new Date();
                        date.setDate(date.getDate() + days);
                        setFormData(prev => ({ 
                          ...prev, 
                          durationDays: days, 
                          endDate: date.toISOString().split('T')[0] 
                        }));
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-widest block">Data de Término</span>
                    <input
                      type="date"
                      className="w-full px-4 py-3 bg-[#f8fcf9] border border-zinc-200/80 rounded-xl focus:outline-none focus:border-[#15a350] font-bold text-zinc-700"
                      value={formData.endDate || ''}
                      onChange={e => {
                        const endStr = e.target.value;
                        const d1 = new Date(formData.startDate || '');
                        const d2 = new Date(endStr);
                        const days = Math.max(1, Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
                        setFormData(prev => ({ ...prev, endDate: endStr, durationDays: days }));
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Section: Controle de Estoque (Package/Box Icon match) */}
          <div className="bg-white rounded-[2rem] border border-zinc-100 p-6 md:p-8 space-y-6 shadow-xs relative">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <h3 className="text-lg font-black text-[#15a350] flex items-center gap-2">
                <Box size={22} className="text-[#10b981]" />
                Controle de Estoque <span className="text-[11px] bg-zinc-100 text-zinc-500 py-0.5 px-2 rounded-full font-bold ml-1.5 uppercase tracking-wide">Facultativo</span>
              </h3>
              
              <button
                type="button"
                onClick={() => setControlarEstoque(!controlarEstoque)}
                className={`w-12 h-6.5 flex items-center rounded-full p-1 transition-all outline-none ${
                  controlarEstoque ? 'bg-[#15a350]' : 'bg-zinc-200'
                }`}
                id="toggle-controlar-estoque"
              >
                <div 
                  className={`w-5.5 h-5.5 bg-white rounded-full shadow transform transition-all ${
                    controlarEstoque ? 'translate-x-5.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {controlarEstoque ? (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Quantidade Atual */}
                  <div className="space-y-1">
                    <label className="text-xs font-black text-zinc-500 uppercase tracking-wider block">
                      Quantidade Atual
                    </label>
                    <input
                      type="number"
                      placeholder="Ex: 30"
                      className="w-full px-5 py-4 bg-[#f8fcf9] border border-zinc-200/80 rounded-2xl focus:ring-4 focus:ring-[#15a350]/10 focus:border-[#15a350] outline-none font-bold text-zinc-800 transition-all placeholder:text-zinc-400"
                      value={formData.stock === 0 ? '' : formData.stock}
                      onChange={e => {
                        const st = parseInt(e.target.value) || 0;
                        setFormData(prev => ({ ...prev, stock: st, initialStock: st }));
                      }}
                      id="stock-input"
                    />
                    <span className="text-[11px] text-zinc-400 font-semibold block pl-1">
                      Quantos comprimidos/doses você tem
                    </span>
                  </div>

                  {/* Data da Compra */}
                  <div className="space-y-1">
                    <label className="text-xs font-black text-zinc-500 uppercase tracking-wider block">
                      Data da Compra
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        className="w-full pl-12 pr-5 py-4 bg-[#f8fcf9] border border-zinc-200/80 rounded-2xl focus:ring-4 focus:ring-[#15a350]/10 focus:border-[#15a350] outline-none font-bold text-zinc-800 transition-all"
                        value={formData.purchaseDate}
                        onChange={e => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                        id="purchase-date-input"
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                        <Calendar size = {18} />
                      </div>
                    </div>
                  </div>

                  {/* Data de Vencimento */}
                  <div className="space-y-1">
                    <label className="text-xs font-black text-zinc-500 uppercase tracking-wider block">
                      Data de Vencimento
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="mm/aaaa"
                        className="w-full pl-12 pr-5 py-4 bg-[#f8fcf9] border border-zinc-200/80 rounded-2xl focus:ring-4 focus:ring-[#15a350]/10 focus:border-[#15a350] outline-none font-bold text-zinc-800 transition-all placeholder:text-zinc-400"
                        value={formData.expiryDate || ''}
                        onChange={e => {
                          let val = e.target.value.replace(/\D/g, '');
                          if (val.length > 2) {
                            val = val.substring(0, 2) + '/' + val.substring(2, 6);
                          }
                          setFormData(prev => ({ ...prev, expiryDate: val }));
                        }}
                        id="expiry-date-input"
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                        <Calendar size={18} />
                      </div>
                    </div>
                  </div>

                  {/* Local da Compra */}
                  <div className="space-y-1">
                    <label className="text-xs font-black text-zinc-500 uppercase tracking-wider block">
                      Local da Compra
                    </label>
                    <div className="relative">
                      <select
                        className="w-full pl-5 pr-12 py-4 bg-[#f8fcf9] border border-zinc-200/80 rounded-2xl focus:ring-4 focus:ring-[#15a350]/10 focus:border-[#15a350] outline-none font-bold text-zinc-800 appearance-none cursor-pointer"
                        value={formData.purchaseLocation}
                        onChange={e => setFormData(prev => ({ ...prev, purchaseLocation: e.target.value }))}
                        id="purchase-location-select"
                      >
                        <option value="Selecione">Selecione</option>
                        <option value="Farmácia Preço Popular">Farmácia Preço Popular</option>
                        <option value="Droga Raia">Droga Raia</option>
                        <option value="Drogasil">Drogasil</option>
                        <option value="Pague Menos">Pague Menos</option>
                        <option value="SUS / Posto de Saúde">SUS / Posto de Saúde</option>
                        <option value="Outro">Outro</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                        <ChevronDown size={18} />
                      </div>
                    </div>
                  </div>

                </div>

                {/* Calculate Button directly replicated from picture */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleCalculateStockEnding}
                    className="w-full py-4 px-6 bg-[#f97316] hover:bg-orange-600 active:scale-95 text-white font-extrabold text-sm rounded-2xl transition-all shadow-md shadow-orange-100 flex items-center justify-center gap-2"
                    id="btn-calculate-stock"
                  >
                    <Clock size={16} />
                    Calcular Data de Fim do Medicamento
                  </button>
                  
                  {stockDurationMessage && (
                    <div className="mt-3 p-4 bg-orange-50 border border-orange-200 text-orange-800 rounded-2xl text-xs font-extrabold leading-relaxed animate-in slide-in-from-top-2 duration-200 flex gap-2">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      <span>{stockDurationMessage}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-4 text-center bg-zinc-50 border border-dashed border-zinc-200 rounded-2xl">
                <p className="text-sm font-bold text-zinc-500">
                  ⚠️ Controle de Estoque Desativado.
                </p>
                <p className="text-xs text-zinc-400 mt-1 font-medium">Toque no botão de alternância acima para ativar quando desejar.</p>
              </div>
            )}

          </div>

          {/* Clinica Instructions details area */}
          <div className="bg-white rounded-[2rem] border border-zinc-100 p-6 md:p-8 space-y-4 shadow-xs">
            <h3 className="text-lg font-black text-zinc-900 border-b border-zinc-50 pb-3 flex items-center gap-2">
              <FileText size={20} className="text-[#10b981]" />
              Notas Clínicas e Instruções
            </h3>
            <textarea
              placeholder="Instruções adicionais (ex: Evitar álcool, tomar com água gelada...)"
              className="w-full px-5 py-4 bg-[#f8fcf9] border border-zinc-200/80 rounded-2xl focus:ring-4 focus:ring-[#15a350]/10 focus:border-[#15a350] outline-none resize-none h-32 font-medium text-zinc-800 placeholder:text-zinc-400"
              value={formData.instructions || ''}
              onChange={e => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
            />
          </div>

          {/* Form Action Controls */}
          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-5 px-6 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-extrabold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              className="flex-1 py-5 px-6 bg-[#15a350] hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-xl shadow-emerald-100 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Save size={18} />
              Salvar Medicamento
            </button>
          </div>

        </form>
      </div>

      {/* REPLICATED HOLISTIC OVERLAY MODAL: screenshot 8 */}
      {showSavedModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl text-center space-y-6 border border-emerald-50 max-h-[90vh] overflow-y-auto transform transition-all scale-100 animate-in zoom-in-95 duration-200">
            
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-[#15a350] mb-4 shadow-inner">
                <Check size={44} className="stroke-[3]" />
              </div>
              <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Medicamento Salvo!</h2>
              <p className="text-[#15a350] font-black text-[10px] uppercase tracking-widest mt-1.5">Prescrição Registrada no Prontuário</p>
              <p className="text-zinc-500 font-bold text-sm max-w-sm mt-3.5 leading-relaxed">
                Deseja criar um lembrete no seu calendário agora?
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleGoogleCalendarSync}
                className="w-full py-4 px-6 bg-[#15a350] hover:bg-[#118f43] active:scale-98 text-white font-black rounded-2xl flex items-center justify-center gap-3 shadow-md shadow-emerald-100 transition-all"
              >
                <Calendar size={20} />
                Sincronizar com Google Calendar
              </button>

              <button
                type="button"
                onClick={handleExportIcsFile}
                className="w-full py-4 px-6 bg-zinc-100 hover:bg-zinc-200 active:scale-98 text-zinc-800 font-bold rounded-2xl flex items-center justify-center gap-3 transition-all"
              >
                <Download size={20} />
                Exportar Ficheiro (.ics)
              </button>

              <button
                type="button"
                onClick={handleFinishSave}
                className="w-full py-4 px-6 bg-white border-2 border-zinc-200/80 hover:bg-zinc-50 active:scale-98 text-zinc-600 font-bold rounded-2xl flex items-center justify-center transition-all"
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
