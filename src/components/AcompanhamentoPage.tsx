import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Calendar, 
  Clock, 
  Activity, 
  Droplets, 
  FileText, 
  Check, 
  Trash2, 
  AlertCircle, 
  Printer, 
  CheckCircle2, 
  Info,
  Layers,
  Heart,
  TrendingUp,
  Stethoscope
} from 'lucide-react';

interface Props {
  onBack?: () => void;
  darkMode: boolean;
}

export interface FollowupRecord {
  id: string;
  type: 'glicemia' | 'pressao';
  date: string;
  time: string;
  glicemia?: string; // mg/dL
  sistolica?: string; // mmHg
  diastolica?: string; // mmHg
  momento: string;
  createdAt: string;
}

export const AcompanhamentoPage: React.FC<Props> = ({ onBack, darkMode }) => {
  // Helpers for current date & time
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

  // State for Glicemia Form
  const [glicemiaDate, setGlicemiaDate] = useState(getTodayDateString());
  const [glicemiaTime, setGlicemiaTime] = useState(getCurrentTimeString());
  const [glicemiaVal, setGlicemiaVal] = useState('0');
  const [glicemiaMomento, setGlicemiaMomento] = useState('Selecione');

  // State for Pressao Form
  const [pressaoDate, setPressaoDate] = useState(getTodayDateString());
  const [pressaoTime, setPressaoTime] = useState(getCurrentTimeString());
  const [sistolica, setSistolica] = useState('120');
  const [diastolica, setDiastolica] = useState('80');
  const [pressaoMomento, setPressaoMomento] = useState('Selecione o momento');

  // General States
  const [toDeleteId, setToDeleteId] = useState<string | null>(null);
  const [records, setRecords] = useState<FollowupRecord[]>([]);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isPrintMode, setIsPrintMode] = useState(false);

  // Load records from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('crossmeds_followup_records');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRecords(parsed);
        }
      } catch (e) {
        console.error('Error loading followup records:', e);
      }
    }
  }, []);

  // Sync latest to patient profile so other tabs are updated
  const syncLatestToProfile = (updatedList: FollowupRecord[]) => {
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

    // Sort records to find latest
    const sorted = [...updatedList].sort((a, b) => {
      const dateTimeA = new Date(`${a.date}T${a.time}`).getTime();
      const dateTimeB = new Date(`${b.date}T${b.time}`).getTime();
      return dateTimeB - dateTimeA;
    });

    const latestPressao = sorted.find(r => r.type === 'pressao');
    const latestGlicemia = sorted.find(r => r.type === 'glicemia');

    if (latestPressao) {
      if (latestPressao.sistolica) profile.pressaoSistolica = latestPressao.sistolica;
      if (latestPressao.diastolica) profile.profileDiastolic = latestPressao.diastolica;
    }
    if (latestGlicemia) {
      if (latestGlicemia.glicemia) profile.glicemia = latestGlicemia.glicemia;
    }

    localStorage.setItem('crossmeds_patient_profile', JSON.stringify(profile));
  };

  const handleSaveGlicemia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!glicemiaVal || parseFloat(glicemiaVal) < 0) {
      setAlert({ type: 'error', text: 'Por favor, insira um valor válido de glicemia.' });
      return;
    }

    const newRecord: FollowupRecord = {
      id: 'flog-' + Math.random().toString(36).substring(2, 9),
      type: 'glicemia',
      date: glicemiaDate,
      time: glicemiaTime,
      glicemia: glicemiaVal,
      momento: glicemiaMomento === 'Selecione' ? 'Não informado' : glicemiaMomento,
      createdAt: new Date().toISOString()
    };

    const updated = [newRecord, ...records];
    setRecords(updated);
    localStorage.setItem('crossmeds_followup_records', JSON.stringify(updated));
    syncLatestToProfile(updated);

    setAlert({ type: 'success', text: 'Medição de Glicemia salva e registrada com sucesso!' });
    setTimeout(() => setAlert(null), 4000);
  };

  const handleSavePressao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sistolica || !diastolica) {
      setAlert({ type: 'error', text: 'Por favor, insira valores válidos de pressão arterial.' });
      return;
    }

    const newRecord: FollowupRecord = {
      id: 'flog-' + Math.random().toString(36).substring(2, 9),
      type: 'pressao',
      date: pressaoDate,
      time: pressaoTime,
      sistolica,
      diastolica,
      momento: pressaoMomento === 'Selecione o momento' ? 'Não informado' : pressaoMomento,
      createdAt: new Date().toISOString()
    };

    const updated = [newRecord, ...records];
    setRecords(updated);
    localStorage.setItem('crossmeds_followup_records', JSON.stringify(updated));
    syncLatestToProfile(updated);

    setAlert({ type: 'success', text: 'Medição de Pressão Arterial salva e registrada com sucesso!' });
    setTimeout(() => setAlert(null), 4000);
  };

  const handleDeleteRecord = (id: string) => {
    setToDeleteId(id);
  };

  const confirmDeleteRecord = () => {
    if (!toDeleteId) return;
    const filtered = records.filter(r => r.id !== toDeleteId);
    setRecords(filtered);
    localStorage.setItem('crossmeds_followup_records', JSON.stringify(filtered));
    syncLatestToProfile(filtered);
    setAlert({ type: 'success', text: 'Registro excluído com sucesso.' });
    setToDeleteId(null);
    setTimeout(() => setAlert(null), 3000);
  };

  const formatDateBR = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  // Group readings to evaluate a 1-week/7-day cycle
  const uniqueDatesCount = new Set(records.map(r => r.date)).size;
  const progressPercent = Math.min(Math.round((uniqueDatesCount / 7) * 100), 100);

  return (
    <div className={`max-w-4xl mx-auto pt-2 pb-12 px-4 selection:bg-[#00aa74]/15 ${isPrintMode ? 'bg-white text-black p-8' : ''}`}>
      
      {/* Printable Report Header */}
      {isPrintMode ? (
        <div className="space-y-6">
          <div className="flex justify-between items-start border-b-2 border-zinc-900 pb-4">
            <div>
              <h1 className="text-3xl font-black text-black">CrossMeds - Relatório de Acompanhamento</h1>
              <p className="text-sm font-semibold text-zinc-650 mt-1">Monitoramento Semanal de Sinais Vitais (Glicemia & Pressão)</p>
            </div>
            <button 
              onClick={() => setIsPrintMode(false)}
              className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-bold print:hidden"
            >
              Voltar ao App
            </button>
          </div>

          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-xs space-y-2">
            <h3 className="font-extrabold text-sm text-zinc-900">Finalidade do Acompanhamento:</h3>
            <p className="text-zinc-700">
              Gerado para acompanhamento médico pós-mudança de medicação ou ajuste de dose. 
              Monitoramento diário realizado para verificação de resposta terapêutica.
            </p>
          </div>

          {/* Table representation for printing */}
          <table className="w-full text-xs text-left border-collapse border border-zinc-200">
            <thead>
              <tr className="bg-zinc-100 text-zinc-800 uppercase font-black tracking-wider border-b border-zinc-200 text-[10px]">
                <th className="py-2.5 px-3 border border-zinc-200">Data & Hora</th>
                <th className="py-2.5 px-3 border border-zinc-200">Tipo de Medição</th>
                <th className="py-2.5 px-3 border border-zinc-200">Resultados Obtidos</th>
                <th className="py-2.5 px-3 border border-zinc-200">Momento</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-zinc-400 font-semibold border border-zinc-200">
                    Nenhuma medição registrada no período de acompanhamento.
                  </td>
                </tr>
              ) : (
                records.map(rec => (
                  <tr key={rec.id} className="border-b border-zinc-200">
                    <td className="py-2 px-3 font-semibold border border-zinc-200">
                      {formatDateBR(rec.date)} às {rec.time}
                    </td>
                    <td className="py-2 px-3 font-extrabold uppercase tracking-wide border border-zinc-200">
                      {rec.type === 'glicemia' ? 'Glicemia' : 'Pressão Arterial'}
                    </td>
                    <td className="py-2 px-3 font-black text-sm border border-zinc-200">
                      {rec.type === 'glicemia' 
                        ? `${rec.glicemia} mg/dL` 
                        : `${rec.sistolica} x ${rec.diastolica} mmHg`
                      }
                    </td>
                    <td className="py-2 px-3 text-zinc-700 border border-zinc-200">
                      {rec.momento}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="flex justify-between items-center pt-16 text-xs text-zinc-500">
            <div className="text-center w-52 border-t border-zinc-400 pt-2 font-bold">
              Assinatura do Paciente
            </div>
            <div className="text-center w-52 border-t border-zinc-400 pt-2 font-bold">
              Assinatura da Enfermeira / Responsável
            </div>
          </div>
        </div>
      ) : (
        // Standard App View
        <div className="space-y-6">
          
          {/* Top Bar Navigation */}
          <div className="flex items-center gap-4 mb-4">
            {onBack && (
              <button
                onClick={onBack}
                className="p-3.5 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xs bg-white dark:bg-[#242b38] hover:bg-zinc-50 dark:hover:bg-[#2c3547] text-zinc-700 dark:text-zinc-300 border border-zinc-150/55 dark:border-zinc-800"
              >
                <ChevronLeft size={18} className="stroke-[3]" />
              </button>
            )}
            <div>
              <h2 className="text-2xl md:text-2.5xl font-black text-zinc-950 dark:text-white tracking-tight leading-none">
                Acompanhamento Médico diário
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold mt-1">
                Acompanhamento pós-alteração de remédios ou doses para levar ao médico de retorno.
              </p>
            </div>
          </div>

          {/* Interactive Educational Info Banner (Core request details) */}
          <div className="relative p-5 md:p-6 bg-[#e0f8f1] dark:bg-emerald-950/20 border border-[#a7f3d0]/60 dark:border-emerald-900/30 rounded-3xl flex items-start gap-4">
            <div className="w-10 h-10 bg-[#00aa74] rounded-full shrink-0 flex items-center justify-center text-white shadow-sm">
              <Stethoscope size={18} className="stroke-[2.5]" />
            </div>
            <div className="space-y-1.5 flex-1 select-none">
              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-850 dark:text-emerald-300 flex items-center gap-1.5">
                <Info size={13} />
                Como e quando usar esta página?
              </h4>
              <p className="text-xs font-bold text-emerald-900 dark:text-zinc-300 leading-relaxed">
                Esta página é utilizada quando o seu médico **muda de medicamento ou ajusta a dosagem**. 
                O ideal é realizar medições no posto de saúde ou em casa **todos os dias**, no mesmo horário 
                (como logo após o almoço), por pelo menos **uma semana**. 
              </p>
              <p className="text-xs font-semibold text-emerald-800 dark:text-zinc-400">
                A enfermeira, cuidador ou você mesmo registra os dados abaixo e no final do acompanhamento você leva os dados salvos para o seu médico validar se o ajuste deu certo.
              </p>
            </div>
          </div>

          {/* Success Alerts */}
          <AnimatePresence>
            {alert && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex items-center gap-2 p-4 rounded-2xl text-xs font-bold shadow-xs border ${
                  alert.type === 'success' 
                    ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30'
                    : 'bg-rose-50 dark:bg-[#3d1a24] text-rose-800 dark:text-rose-400 border-rose-100 dark:border-rose-950'
                }`}
              >
                <AlertCircle size={16} />
                {alert.text}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Forms Segment Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Registrar Glicemia Card */}
            <div className="bg-[#f0faf7] dark:bg-[#1f2835] border border-emerald-150/45 dark:border-[#2a3749] rounded-[2rem] p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-[#00897b] dark:text-[#26a69a] mb-5 border-b border-emerald-200/50 dark:border-zinc-800 pb-3">
                  <Droplets size={20} className="stroke-[2.5]" />
                  <h3 className="text-base font-black uppercase tracking-wider">Registrar Glicemia</h3>
                </div>

                <form onSubmit={handleSaveGlicemia} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-400">Data</label>
                      <input 
                        type="date" 
                        value={glicemiaDate} 
                        onChange={e => setGlicemiaDate(e.target.value)}
                        className="w-full mt-1 px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-205/65 dark:border-zinc-800 rounded-xl text-zinc-800 dark:text-white font-semibold outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-400">Hora</label>
                      <input 
                        type="time" 
                        value={glicemiaTime} 
                        onChange={e => setGlicemiaTime(e.target.value)}
                        className="w-full mt-1 px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-205/65 dark:border-zinc-800 rounded-xl text-zinc-800 dark:text-white font-semibold outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-400">Glicemia (mg/dL)</label>
                    <input 
                      type="number" 
                      placeholder="Ex: 99"
                      value={glicemiaVal} 
                      onChange={e => setGlicemiaVal(e.target.value)}
                      className="w-full mt-1 px-3.5 py-2.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-205/65 dark:border-zinc-800 rounded-xl text-zinc-800 dark:text-white font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-400">Momento da Medição</label>
                    <select 
                      value={glicemiaMomento}
                      onChange={e => setGlicemiaMomento(e.target.value)}
                      className="w-full mt-1 px-3 py-2.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-205/65 dark:border-zinc-800 rounded-xl text-zinc-800 dark:text-white font-semibold outline-none"
                    >
                      <option>Selecione</option>
                      <option>Em Jejum (Ao acordar)</option>
                      <option>Antes do Almoço</option>
                      <option>Após o Almoço (Posto de Saúde/Caregiver)</option>
                      <option>Antes do Jantar</option>
                      <option>Após o Jantar</option>
                      <option>Antes de Dormir</option>
                      <option>Outro horário</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 py-3 bg-[#1e88e5] hover:bg-[#1565c0] text-white text-xs uppercase font-black tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm hover:scale-101"
                  >
                    <Check size={14} className="stroke-[3]" />
                    Salvar Glicemia
                  </button>
                </form>
              </div>
            </div>

            {/* Registrar Pressão Arterial Card */}
            <div className="bg-[#fff5f5] dark:bg-[#251f21] border border-rose-150/45 dark:border-rose-950/40 rounded-[2rem] p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-rose-650 dark:text-rose-400 mb-5 border-b border-rose-200/50 dark:border-zinc-800 pb-3">
                  <Heart size={20} className="stroke-[2.5]" />
                  <h3 className="text-base font-black uppercase tracking-wider">Registrar Pressão</h3>
                </div>

                <form onSubmit={handleSavePressao} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-400">Data</label>
                      <input 
                        type="date" 
                        value={pressaoDate} 
                        onChange={e => setPressaoDate(e.target.value)}
                        className="w-full mt-1 px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-205/65 dark:border-zinc-800 rounded-xl text-zinc-800 dark:text-white font-semibold outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-400">Hora</label>
                      <input 
                        type="time" 
                        value={pressaoTime} 
                        onChange={e => setPressaoTime(e.target.value)}
                        className="w-full mt-1 px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-205/65 dark:border-zinc-800 rounded-xl text-zinc-800 dark:text-white font-semibold outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-400">Sistólica (PA)</label>
                      <input 
                        type="number" 
                        placeholder="Ex: 120"
                        value={sistolica} 
                        onChange={e => setSistolica(e.target.value)}
                        className="w-full mt-1 px-3.5 py-2.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-205/65 dark:border-zinc-800 rounded-xl text-zinc-800 dark:text-white font-semibold outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-400">Diastólica (PA)</label>
                      <input 
                        type="number" 
                        placeholder="Ex: 80"
                        value={diastolica} 
                        onChange={e => setDiastolica(e.target.value)}
                        className="w-full mt-1 px-3.5 py-2.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-205/65 dark:border-zinc-800 rounded-xl text-zinc-800 dark:text-white font-semibold outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-400">Momento da Medição</label>
                    <select 
                      value={pressaoMomento}
                      onChange={e => setPressaoMomento(e.target.value)}
                      className="w-full mt-1 px-3 py-2.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-205/65 dark:border-zinc-800 rounded-xl text-zinc-800 dark:text-white font-semibold outline-none"
                    >
                      <option>Selecione o momento</option>
                      <option>Ao acordar / Em Jejum</option>
                      <option>Antes do Almoço</option>
                      <option>Após o Almoço (Posto de Saúde/Caregiver)</option>
                      <option>Antes do Jantar</option>
                      <option>Após o Jantar</option>
                      <option>Antes de Dormir</option>
                      <option>Outro horário</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 py-3 bg-rose-600 hover:bg-rose-750 text-white text-xs uppercase font-black tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm hover:scale-101"
                  >
                    <Check size={14} className="stroke-[3]" />
                    Salvar Pressão
                  </button>
                </form>
              </div>
            </div>

          </div>

          {/* 1-Week Period Progress Goal Tracker */}
          <div className="bg-white dark:bg-[#242b38] border border-zinc-150/55 dark:border-zinc-800 rounded-[2rem] p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4.5">
              <div>
                <h4 className="text-sm font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-1.5">
                  <TrendingUp size={16} className="text-[#00aa74]" />
                  Acompanhamento de 1 Semana (Meta: 7 dias de medições)
                </h4>
                <p className="text-zinc-450 dark:text-zinc-400 text-[10px] font-semibold">
                  Seu médico precisa ver se os níveis se mantiveram estáveis na semana de mudança da dose.
                </p>
              </div>
              
              {records.length > 0 && (
                <button
                  onClick={() => setIsPrintMode(true)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-black text-[10px] uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Printer size={13} />
                  Imprimir ou Gerar Relatório
                </button>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-black uppercase text-zinc-500 dark:text-zinc-400">
                <span>Progresso: {uniqueDatesCount} de 7 dias monitorados</span>
                <span>{progressPercent}% concluído</span>
              </div>
              <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden border border-zinc-150/15">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              {uniqueDatesCount >= 7 ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-650 dark:text-emerald-400 pt-1">
                  <CheckCircle2 size={14} />
                  <span>Meta de 1 semana alcançada! Toque em "Imprimir ou Gerar Relatório" para levar ao médico de retorno.</span>
                </div>
              ) : (
                <p className="text-[10px] text-zinc-400 font-semibold italic">
                  Continue anotando diariamente para preencher uma semana completa de dados antes do retorno.
                </p>
              )}
            </div>
          </div>

          {/* Historical Logs List */}
          <div className="bg-white dark:bg-[#242b38] border border-zinc-150/55 dark:border-zinc-800 rounded-[2rem] p-6 shadow-xs space-y-4">
            <h3 className="text-base font-black text-zinc-900 dark:text-white tracking-tight leading-none mb-2 flex items-center gap-2">
              <FileText size={18} className="text-emerald-600" />
              Leituras e Medições Registradas no Acompanhamento
            </h3>

            {records.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-zinc-150 dark:border-zinc-800 rounded-2xl text-zinc-400">
                <p className="text-xs font-bold">Nenhum registro no diário de acompanhamento.</p>
                <p className="text-[10px] text-zinc-500 font-semibold mt-1">Insira os dados nos cartões de Glicose ou Pressão acima.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {records.map((rec) => (
                  <div 
                    key={rec.id}
                    className="p-4 bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-850 rounded-2xl flex items-center justify-between gap-4 group hover:scale-[1.005] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-xs ${
                        rec.type === 'glicemia' 
                          ? 'bg-[#1e88e5]/10 text-[#1e88e5]' 
                          : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {rec.type === 'glicemia' ? <Droplets size={16} /> : <Activity size={16} />}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black uppercase text-zinc-800 dark:text-zinc-200">
                            {rec.type === 'glicemia' ? 'Glicemia' : 'Pressão Arterial'}
                          </span>
                          <span className="text-zinc-300 dark:text-zinc-700 font-semibold">•</span>
                          <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
                            {rec.momento}
                          </span>
                        </div>

                        <div className="text-[10px] font-semibold text-zinc-450 dark:text-zinc-500 flex items-center gap-1">
                          <Calendar size={11} />
                          <span>{formatDateBR(rec.date)}</span>
                          <Clock size={11} className="ml-1" />
                          <span>{rec.time}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-sm font-black text-zinc-900 dark:text-white">
                        {rec.type === 'glicemia' 
                          ? `${rec.glicemia} mg/dL` 
                          : `${rec.sistolica}/${rec.diastolica} mmHg`
                      }
                      </span>
                      <button
                        onClick={() => handleDeleteRecord(rec.id)}
                        className="p-2 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all opacity-70 group-hover:opacity-100"
                        title="Apagar leitura"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

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
                  Tem certeza que deseja remover esta medição de acompanhamento?
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
