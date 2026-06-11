import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Calendar, 
  Clock, 
  Activity, 
  Thermometer, 
  Droplets, 
  Wind, 
  Heart, 
  Percent,
  Trash2,
  Check,
  History,
  AlertCircle
} from 'lucide-react';

interface Props {
  onBack: () => void;
  darkMode: boolean;
}

export interface VitalSignRecord {
  id: string;
  date: string;
  time: string;
  pressaoSistolica: string;
  pressaoDiastolica: string;
  temperatura: string;
  glicemia: string;
  freqRespiratoria: string;
  freqCardiaca: string;
  saturacao: string;
  createdAt: string;
}

export const SinaisVitaisPage: React.FC<Props> = ({ onBack, darkMode }) => {
  // Current Date and Time
  const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getCurrentTimeString = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  // Form State
  const [toDeleteId, setToDeleteId] = useState<string | null>(null);
  const [date, setDate] = useState(getTodayDateString());
  const [time, setTime] = useState(getCurrentTimeString());
  const [pressaoSistolica, setPressaoSistolica] = useState('');
  const [pressaoDiastolica, setPressaoDiastolica] = useState('');
  const [temperatura, setTemperatura] = useState('36.5');
  const [glicemia, setGlicemia] = useState('99');
  const [freqRespiratoria, setFreqRespiratoria] = useState('16');
  const [freqCardiaca, setFreqCardiaca] = useState('70');
  const [saturacao, setSaturacao] = useState('98');

  // History State
  const [history, setHistory] = useState<VitalSignRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('crossmeds_sinais_vitais_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      } catch (e) {
        console.error('Error parsing vital signs history:', e);
      }
    }
  }, []);

  // Update primary patient profile with latest values
  const syncLatestVitalsToProfile = (recordsList: VitalSignRecord[]) => {
    if (recordsList.length === 0) return;
    
    // Sort records descending to find the absolute latest recorded vital signs
    const sorted = [...recordsList].sort((a, b) => {
      const dateTimeA = new Date(`${a.date}T${a.time}`).getTime();
      const dateTimeB = new Date(`${b.date}T${b.time}`).getTime();
      return dateTimeB - dateTimeA;
    });

    const latest = sorted[0];

    // Read current patient profile
    const savedProfile = localStorage.getItem('crossmeds_patient_profile');
    let profile = {
      nomeCompleto: 'Jeferson Saconato',
      idade: '',
      sexo: 'Masculino',
      peso: '',
      altura: '',
      pressaoSistolica: '',
      profileDiastolic: '',
      glicemia: '',
      colesterol: '',
      hba1cLab: ''
    };

    if (savedProfile) {
      try {
        profile = { ...profile, ...JSON.parse(savedProfile) };
      } catch (_) {}
    }

    // Sync latest vital signs if values were recorded
    if (latest.pressaoSistolica) profile.pressaoSistolica = latest.pressaoSistolica;
    if (latest.pressaoDiastolica) profile.profileDiastolic = latest.pressaoDiastolica;
    if (latest.glicemia) profile.glicemia = latest.glicemia;
    
    // Set updated date
    const now = new Date();
    const pad = (num: number) => String(num).padStart(2, '0');
    profile.hba1cLab = profile.hba1cLab || ''; // safe default
    
    localStorage.setItem('crossmeds_patient_profile', JSON.stringify(profile));
  };

  // Save Record
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const newRecord: VitalSignRecord = {
      id: 'vital-' + Math.random().toString(36).substring(2, 9),
      date,
      time,
      pressaoSistolica,
      pressaoDiastolica,
      temperatura,
      glicemia,
      freqRespiratoria,
      freqCardiaca,
      saturacao,
      createdAt: new Date().toISOString()
    };

    const updatedHistory = [newRecord, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('crossmeds_sinais_vitais_history', JSON.stringify(updatedHistory));

    // Force clinical sync to "crossmeds_patient_profile"
    syncLatestVitalsToProfile(updatedHistory);

    // Show temporary success feedback
    setAlertMsg({ type: 'success', text: 'Sinais vitais salvos com sucesso! Sincronizados com o Perfil.' });
    setTimeout(() => {
      setAlertMsg(null);
    }, 4000);

    // Optionally reset fields or leave them prefilled with the last used values for quick sequential monitoring.
  };

  // Delete Record
  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setToDeleteId(id);
  };

  const confirmDeleteRecord = () => {
    if (!toDeleteId) return;
    const filtered = history.filter(record => record.id !== toDeleteId);
    setHistory(filtered);
    localStorage.setItem('crossmeds_sinais_vitais_history', JSON.stringify(filtered));
    
    // Sync remaining latest or reset if empty
    syncLatestVitalsToProfile(filtered);

    setAlertMsg({ type: 'success', text: 'Registro removido com sucesso!' });
    setToDeleteId(null);
    setTimeout(() => {
      setAlertMsg(null);
    }, 3000);
  };

  // Convert HTML Date to Brazilian Format
  const formatDateBR = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  return (
    <div className="max-w-3xl mx-auto pt-2 pb-12 px-4 selection:bg-emerald-100">
      {/* Top Navigation Bar with Back Arrow */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-3.5 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xs bg-white dark:bg-[#242b38] hover:bg-zinc-50 dark:hover:bg-[#2c3547] text-zinc-700 dark:text-zinc-300 border border-zinc-150/55 dark:border-zinc-800"
        >
          <ChevronLeft size={18} className="stroke-[3]" />
        </button>
        <div>
          <h2 className="text-2xl md:text-2.5xl font-black text-zinc-950 dark:text-white tracking-tight leading-none">
            Registro de Sinais Vitais
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold mt-1">
            Mantenha o histórico atualizado para triagem e acompanhamento médico facilitado.
          </p>
        </div>
      </div>

      {/* Success/Error Alerts */}
      <AnimatePresence>
        {alertMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-center gap-2 p-4.5 rounded-2xl text-xs font-bold mb-5 shadow-xs border ${
              alertMsg.type === 'success' 
                ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30'
                : 'bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-400 border-red-100 dark:border-red-900/30'
            }`}
          >
            <AlertCircle size={16} />
            {alertMsg.text}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSave} className="space-y-5 print:hidden">
        
        {/* Date and Time Group */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#242b38] border border-zinc-150/55 dark:border-zinc-800 rounded-2xl p-3 shadow-xs">
            <span className="block text-[10px] font-black uppercase text-zinc-450 dark:text-zinc-400 tracking-wider mb-1">Data</span>
            <div className="flex items-center gap-2">
              <Calendar size={15} className="text-zinc-400 dark:text-emerald-500 shrink-0" />
              <input 
                type="date" 
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className="w-full bg-transparent border-none text-xs font-bold text-zinc-800 dark:text-white focus:outline-hidden focus:ring-0"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-[#242b38] border border-zinc-150/55 dark:border-zinc-800 rounded-2xl p-3 shadow-xs">
            <span className="block text-[10px] font-black uppercase text-zinc-450 dark:text-zinc-400 tracking-wider mb-1">Hora</span>
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-zinc-400 dark:text-emerald-500 shrink-0" />
              <input 
                type="time" 
                value={time}
                onChange={e => setTime(e.target.value)}
                required
                className="w-full bg-transparent border-none text-xs font-bold text-zinc-800 dark:text-white focus:outline-hidden focus:ring-0"
              />
            </div>
          </div>
        </div>

        {/* Vital Parameters Block inputs */}
        <div className="bg-white dark:bg-[#242b38] border border-zinc-150/55 dark:border-zinc-800 rounded-[2rem] p-6 md:p-8 space-y-5 shadow-xs">
          
          {/* Pressure row */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-850/55">
            <div className="flex items-center gap-2 text-rose-650 dark:text-rose-400 mb-2">
              <Activity size={18} className="stroke-[2.5]" />
              <label className="text-xs font-black uppercase tracking-wider">Pressão Arterial (PA)</label>
            </div>
            <div className="flex items-center gap-3">
              <input 
                type="number" 
                placeholder="Sistólica"
                value={pressaoSistolica}
                onChange={e => setPressaoSistolica(e.target.value)}
                className="w-1/2 px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-800 dark:text-white"
              />
              <span className="font-extrabold text-zinc-400">X</span>
              <input 
                type="number" 
                placeholder="Diastólica"
                value={pressaoDiastolica}
                onChange={e => setPressaoDiastolica(e.target.value)}
                className="w-1/2 px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-800 dark:text-white"
              />
              <span className="text-xs font-black text-zinc-400 uppercase tracking-wider shrink-0 w-12 text-right">mmHg</span>
            </div>
          </div>

          {/* Temperature row */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-850/55">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
              <Thermometer size={18} className="stroke-[2.5]" />
              <label className="text-xs font-black uppercase tracking-wider">Temperatura (TEMP)</label>
            </div>
            <div className="flex items-center gap-3">
              <input 
                type="text" 
                placeholder="Ex: 36.5"
                value={temperatura}
                onChange={e => setTemperatura(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-800 dark:text-white"
              />
              <span className="text-xs font-black text-zinc-400 uppercase tracking-wider shrink-0 w-12 text-right">°C</span>
            </div>
          </div>

          {/* Glicemia row */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-850/55">
            <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 mb-2">
              <Droplets size={18} className="stroke-[2.5]" />
              <label className="text-xs font-black uppercase tracking-wider">Glicemia (GLIC)</label>
            </div>
            <div className="flex items-center gap-3">
              <input 
                type="number" 
                placeholder="Ex: 99"
                value={glicemia}
                onChange={e => setGlicemia(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-800 dark:text-white"
              />
              <span className="text-xs font-black text-zinc-400 uppercase tracking-wider shrink-0 w-12 text-right">mg/dL</span>
            </div>
          </div>

          {/* Frequência Respiratória row */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-850/55">
            <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 mb-2">
              <Wind size={18} className="stroke-[2.5]" />
              <label className="text-xs font-black uppercase tracking-wider">Frequência Respiratória (FR)</label>
            </div>
            <div className="flex items-center gap-3">
              <input 
                type="number" 
                placeholder="Ex: 16"
                value={freqRespiratoria}
                onChange={e => setFreqRespiratoria(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-800 dark:text-white"
              />
              <span className="text-xs font-black text-zinc-400 uppercase tracking-wider shrink-0 w-12 text-right">rpm</span>
            </div>
          </div>

          {/* Frequência Cardíaca row */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-850/55">
            <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400 mb-2">
              <Heart size={18} className="stroke-[2.5]" />
              <label className="text-xs font-black uppercase tracking-wider">Frequência Cardíaca (FC)</label>
            </div>
            <div className="flex items-center gap-3">
              <input 
                type="number" 
                placeholder="Ex: 70"
                value={freqCardiaca}
                onChange={e => setFreqCardiaca(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-800 dark:text-white"
              />
              <span className="text-xs font-black text-zinc-400 uppercase tracking-wider shrink-0 w-12 text-right">bpm</span>
            </div>
          </div>

          {/* Saturação de Oxigênio row */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-850/55">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
              <Percent size={18} className="stroke-[2.5]" />
              <label className="text-xs font-black uppercase tracking-wider">Saturação de Oxigênio (SAT)</label>
            </div>
            <div className="flex items-center gap-3">
              <input 
                type="number" 
                placeholder="Ex: 98"
                value={saturacao}
                onChange={e => setSaturacao(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-800 dark:text-white"
              />
              <span className="text-xs font-black text-zinc-400 uppercase tracking-wider shrink-0 w-12 text-right">%</span>
            </div>
          </div>

        </div>

        {/* Action button representing full-fidelity of screenshot */}
        <button
          type="submit"
          className="w-full py-4.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-md hover:shadow-lg hover:scale-101 active:scale-99 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Check size={18} className="stroke-[3]" />
          Salvar Dados
        </button>

        {/* Toggleable history drawer button */}
        <button
          type="button"
          onClick={() => setShowHistory(!showHistory)}
          className="w-full py-3 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400 font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <History size={15} />
          {showHistory ? 'Ocultar Histórico' : 'Ver Histórico'}
        </button>
      </form>

      {/* Histórico Section Drawer */}
      <AnimatePresence>
        {(showHistory || history.length > 0) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4.5 mt-6 border-t border-zinc-150/45 dark:border-zinc-800/60 pt-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black tracking-tight text-zinc-900 dark:text-white leading-none flex items-center gap-2">
                <History size={18} className="text-emerald-600" />
                Histórico de Medições
              </h3>
              <p className="text-[10px] uppercase font-black tracking-widest text-[#00aa74] bg-[#e2f8f0] dark:bg-emerald-950/20 px-3 py-1 rounded-full">
                {history.length} {history.length === 1 ? 'registro' : 'registros'}
              </p>
            </div>

            {history.length === 0 ? (
              <div className="text-center py-10 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400">
                <p className="text-xs font-bold">Nenhum sinal vital registrado no histórico.</p>
                <p className="text-[10px] mt-1 font-semibold text-zinc-550">Preencha os campos acima para salvar.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {history.map((rec, idx) => (
                  <div 
                    key={rec.id}
                    className={`relative p-5 rounded-2xl border transition-all ${
                      idx === 0 
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/30 shadow-xs' 
                        : 'bg-white dark:bg-[#242b38] border-zinc-150/55 dark:border-zinc-800'
                    }`}
                  >
                    {idx === 0 && (
                      <span className="absolute top-4 right-14 text-[9px] uppercase font-black tracking-wider bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md">
                        Mais Recente
                      </span>
                    )}

                    <button
                      onClick={(e) => handleDelete(rec.id, e)}
                      className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all"
                      title="Apagar este registro"
                    >
                      <Trash2 size={15} />
                    </button>

                    <div className="flex items-center gap-2 text-zinc-850 dark:text-zinc-150 mb-3.5">
                      <Calendar size={13} className="text-zinc-400" />
                      <span className="text-xs font-extrabold">{formatDateBR(rec.date)}</span>
                      <span className="text-zinc-300 dark:text-zinc-700 font-extrabold">•</span>
                      <Clock size={13} className="text-zinc-400" />
                      <span className="text-xs font-extrabold">{rec.time}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-1">
                      {/* PA */}
                      {rec.pressaoSistolica && rec.pressaoDiastolica && (
                        <div className="amber-glow px-3 py-2 bg-zinc-50/70 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800 text-center">
                          <span className="block text-[8px] uppercase font-black text-zinc-400 dark:text-zinc-500">Pressão (PA)</span>
                          <span className="text-xs font-black text-rose-650 dark:text-rose-400 mt-0.5 block">{rec.pressaoSistolica}/{rec.pressaoDiastolica} <span className="text-[9px] font-bold text-zinc-400">mmHg</span></span>
                        </div>
                      )}

                      {/* Temp */}
                      {rec.temperatura && (
                        <div className="px-3 py-2 bg-zinc-50/70 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800 text-center">
                          <span className="block text-[8px] uppercase font-black text-zinc-400 dark:text-zinc-500">Temperatura</span>
                          <span className="text-xs font-black text-amber-600 dark:text-amber-400 mt-0.5 block">{rec.temperatura} <span className="text-[9px] font-bold text-zinc-400">°C</span></span>
                        </div>
                      )}

                      {/* Glicemia */}
                      {rec.glicemia && (
                        <div className="px-3 py-2 bg-zinc-50/70 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800 text-center">
                          <span className="block text-[8px] uppercase font-black text-zinc-400 dark:text-zinc-500">Glicemia</span>
                          <span className="text-xs font-black text-sky-600 dark:text-sky-400 mt-0.5 block">{rec.glicemia} <span className="text-[9px] font-bold text-zinc-400">mg/dL</span></span>
                        </div>
                      )}

                      {/* FR */}
                      {rec.freqRespiratoria && (
                        <div className="px-3 py-2 bg-zinc-50/70 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800 text-center">
                          <span className="block text-[8px] uppercase font-black text-zinc-400 dark:text-zinc-500">Respiração</span>
                          <span className="text-xs font-black text-teal-600 dark:text-teal-400 mt-0.5 block">{rec.freqRespiratoria} <span className="text-[9px] font-bold text-zinc-400">rpm</span></span>
                        </div>
                      )}

                      {/* FC */}
                      {rec.freqCardiaca && (
                        <div className="px-3 py-2 bg-zinc-50/70 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800 text-center">
                          <span className="block text-[8px] uppercase font-black text-zinc-400 dark:text-zinc-500">Cardíaca</span>
                          <span className="text-xs font-black text-pink-600 dark:text-pink-400 mt-0.5 block">{rec.freqCardiaca} <span className="text-[9px] font-bold text-zinc-400">bpm</span></span>
                        </div>
                      )}

                      {/* Saturação */}
                      {rec.saturacao && (
                        <div className="px-3 py-2 bg-zinc-50/70 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800 text-center">
                          <span className="block text-[8px] uppercase font-black text-zinc-400 dark:text-zinc-500">Saturação</span>
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">{rec.saturacao} <span className="text-[9px] font-bold text-zinc-400">%</span></span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {toDeleteId !== null && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setToDeleteId(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />
          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className={`relative w-full max-w-sm overflow-hidden rounded-[2rem] border p-6 md:p-8 shadow-2xl ${
              darkMode ? 'bg-[#242b38] border-zinc-805 text-white' : 'bg-white border-zinc-150 text-zinc-900'
            }`}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-950/30 text-red-605 dark:text-red-400 rounded-2xl flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-black tracking-tight leading-tight uppercase">
                  Confirmar Exclusão
                </h3>
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Deseja excluir este registro de sinal vital?
                </p>
              </div>
            </div>

            <div className="flex gap-3.5 mt-6">
              <button
                type="button"
                onClick={() => setToDeleteId(null)}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all text-center border active:scale-95 cursor-pointer ${
                  darkMode 
                    ? 'border-zinc-800 bg-zinc-800 hover:bg-zinc-750 text-zinc-300' 
                    : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-650'
                }`}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteRecord}
                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all text-center cursor-pointer shadow-lg shadow-red-500/10"
              >
                Confirmar
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};
