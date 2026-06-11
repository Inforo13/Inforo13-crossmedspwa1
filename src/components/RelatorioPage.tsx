import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Printer, 
  User, 
  Activity, 
  Heart, 
  Calendar, 
  CheckCircle2, 
  X, 
  Edit3, 
  Plus, 
  AlertTriangle, 
  QrCode, 
  FileText, 
  Smile, 
  Clock, 
  UserPlus, 
  Layers 
} from 'lucide-react';
import { Medication, HealthLog } from '../types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface Props {
  medications: Medication[];
  onUpdateMedications?: (updated: Medication[]) => void;
  user: any;
  darkMode: boolean;
  onBack: () => void;
}

export const RelatorioPage: React.FC<Props> = ({ 
  medications, 
  onUpdateMedications, 
  user, 
  darkMode, 
  onBack 
}) => {
  // Personal & Clinical Profile States (synchronized with crossmeds_patient_profile in localStorage)
  const [profile, setProfile] = useState({
    nomeCompleto: 'Jeferson Saconato',
    idade: '66',
    sexo: 'Masculino',
    peso: '78',
    altura: '1.75',
    colesterol: '190',
    glicemia: '110',
    pressaoSistolica: '120',
    pressaoDiastolica: '80',
    alergias: 'Penicilina, Corantes, Corante Tartrazina',
    doencas: 'Hipertensão, Diabetes Tipo 2',
    tipoSanguineo: 'O+',
    contatoEmergenciaNome: 'Clara Saconato',
    contatoEmergenciaParentesco: 'Cônjuge (Esposa/Marido)',
    contatoEmergenciaTelefone: '(11) 99887-7665',
    lastUpdated: '08/06/2026 às 13:42'
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ ...profile });
  const [selectedDoseToEdit, setSelectedDoseToEdit] = useState<{
    medId: string;
    dateStr: string;
    currentStatus: 'taken' | 'skipped' | undefined;
  } | null>(null);

  // Load patient profile from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('crossmeds_patient_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        
        // Intelligent backwards compatibility parsing for old parentesco
        let inferredParentesco = parsed.contatoEmergenciaParentesco || 'Cônjuge (Esposa/Marido)';
        let inferredNome = parsed.contatoEmergenciaNome || '';
        
        if (!parsed.contatoEmergenciaParentesco && parsed.contatoEmergenciaNome) {
          const nameLower = parsed.contatoEmergenciaNome.toLowerCase();
          if (nameLower.includes('esposa') || nameLower.includes('marido') || nameLower.includes('cônjuge') || nameLower.includes('conjuge')) {
            inferredParentesco = 'Cônjuge (Esposa/Marido)';
            inferredNome = parsed.contatoEmergenciaNome.replace(/Esposa|Marido|Cônjuge|Conjuge/gi, '').replace(/\(|\)/g, '').trim();
          } else if (nameLower.includes('pai')) {
            inferredParentesco = 'Pai';
            inferredNome = parsed.contatoEmergenciaNome.replace(/Pai/gi, '').replace(/\(|\)/g, '').trim();
          } else if (nameLower.includes('mãe') || nameLower.includes('mae')) {
            inferredParentesco = 'Mãe';
            inferredNome = parsed.contatoEmergenciaNome.replace(/Mãe|Mae/gi, '').replace(/\(|\)/g, '').trim();
          } else if (nameLower.includes('filho')) {
            inferredParentesco = 'Filho';
            inferredNome = parsed.contatoEmergenciaNome.replace(/Filho/gi, '').replace(/\(|\)/g, '').trim();
          } else if (nameLower.includes('filha')) {
            inferredParentesco = 'Filha';
            inferredNome = parsed.contatoEmergenciaNome.replace(/Filha/gi, '').replace(/\(|\)/g, '').trim();
          } else if (nameLower.includes('irmão') || nameLower.includes('irmao')) {
            inferredParentesco = 'Irmão';
            inferredNome = parsed.contatoEmergenciaNome.replace(/Irmão|Irmao/gi, '').replace(/\(|\)/g, '').trim();
          } else if (nameLower.includes('irmã') || nameLower.includes('irma')) {
            inferredParentesco = 'Irmã';
            inferredNome = parsed.contatoEmergenciaNome.replace(/Irmã|Irma/gi, '').replace(/\(|\)/g, '').trim();
          } else if (nameLower.includes('tio')) {
            inferredParentesco = 'Tio';
            inferredNome = parsed.contatoEmergenciaNome.replace(/Tio/gi, '').replace(/\(|\)/g, '').trim();
          } else if (nameLower.includes('tia')) {
            inferredParentesco = 'Tia';
            inferredNome = parsed.contatoEmergenciaNome.replace(/Tia/gi, '').replace(/\(|\)/g, '').trim();
          }
        }

        const merged = { 
          ...profile, 
          ...parsed,
          contatoEmergenciaNome: inferredNome || parsed.contatoEmergenciaNome || profile.contatoEmergenciaNome,
          contatoEmergenciaParentesco: inferredParentesco
        };
        setProfile(merged);
        setEditForm(merged);
      } catch (err) {
        console.error('Erro ao ler prontuário de saúde:', err);
      }
    } else {
      // Seed default profile values if non-existent
      localStorage.setItem('crossmeds_patient_profile', JSON.stringify(profile));
    }
  }, []);

  // Save profile state to localStorage and update timestamp
  const handleSaveProfile = (updatedProfile: typeof profile) => {
    const now = new Date();
    const pad = (num: number) => String(num).padStart(2, '0');
    const timestamp = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} às ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    
    const finalProfile = {
      ...updatedProfile,
      lastUpdated: timestamp
    };
    
    setProfile(finalProfile);
    localStorage.setItem('crossmeds_patient_profile', JSON.stringify(finalProfile));
    setIsEditingProfile(false);
  };

  // Calculate BMI (IMC) dynamically
  const pesoNum = parseFloat(profile.peso) || 0;
  const alturaNum = parseFloat(profile.altura) || 0;
  let imc: number | null = null;
  let imcClass = 'Não cadastrado';
  let imcColor = 'text-zinc-500';

  if (pesoNum > 0 && alturaNum > 0) {
    imc = Number((pesoNum / (alturaNum * alturaNum)).toFixed(1));
    if (imc < 18.5) {
      imcClass = 'Abaixo do peso';
      imcColor = 'text-amber-500';
    } else if (imc < 24.9) {
      imcClass = 'Peso saudável';
      imcColor = 'text-emerald-500';
    } else if (imc < 29.9) {
      imcClass = 'Sobrepeso';
      imcColor = 'text-amber-500';
    } else {
      imcClass = 'Obesidade';
      imcColor = 'text-rose-500';
    }
  }

  // Calculate estimated HbA1c based on glucose state
  // Formula: (Glucose + 46.7) / 28.7
  const glicoseNum = parseFloat(profile.glicemia) || 0;
  let hba1c: string = '-';
  if (glicoseNum > 0) {
    hba1c = ((glicoseNum + 46.7) / 28.7).toFixed(1);
  }

  // Get date helper array for the last 30 days backwards from today
  const getLast30Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push(d);
    }
    return days;
  };

  const last30Days = getLast30Days();

  // Handle setting/overwriting dose status retrospectively for "Gráfico de Adesão"
  const handleToggleDoseStatus = async (med: Medication, date: Date, newStatus: 'taken' | 'skipped' | undefined) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    // Choose the first time or default 08:00
    const timeString = med.times && med.times.length > 0 ? med.times[0] : (med.time || '08:00');
    const historyKey = `${dateString} ${timeString}`;

    const updatedHistory = { ...(med.doseHistory || {}) };
    if (newStatus) {
      updatedHistory[historyKey] = newStatus;
    } else {
      delete updatedHistory[historyKey];
    }

    const updates: Partial<Medication> = {
      doseHistory: updatedHistory,
      ...(newStatus === 'taken' && dateString === new Date().toISOString().split('T')[0] 
        ? { lastTaken: new Date().toISOString() } 
        : {}
      )
    };

    // Reflect updates immediately in UI state
    const nextMedications = medications.map(m => m.id === med.id ? { ...m, ...updates } : m);
    if (onUpdateMedications) {
      onUpdateMedications(nextMedications);
    }

    // Persist to user storage
    const token = user?.uid || 'guest';
    if (token.startsWith('wsaconato-terra-test') || token === 'guest') {
      localStorage.setItem(`medications_${token}`, JSON.stringify(nextMedications));
    } else {
      try {
        await updateDoc(doc(db, 'medications', med.id), updates);
      } catch (err) {
        console.error('Erro ao salvar adesão no Firestore:', err);
      }
    }
    setSelectedDoseToEdit(null);
  };

  // Helper to determine the status of a specific day for a med
  const getDoseStatusForDay = (med: Medication, date: Date): 'taken' | 'skipped' | 'none' => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    const history = med.doseHistory || {};
    // Check any matching time slots for this date key
    const matchingKey = Object.keys(history).find(k => k.startsWith(dateString));
    if (matchingKey) {
      return history[matchingKey];
    }
    return 'none';
  };

  // Calculate adherence percentage for the past 30 days
  const calculateAdherenceRate = (med: Medication) => {
    let takenCount = 0;
    let loggedCount = 0;
    
    last30Days.forEach(day => {
      const status = getDoseStatusForDay(med, day);
      if (status !== 'none') {
        loggedCount++;
        if (status === 'taken') {
          takenCount++;
        }
      }
    });

    if (loggedCount === 0) return 100; // Standby
    return Math.round((takenCount / loggedCount) * 100);
  };

  // SOS QR Code text content
  const getSOSQRDataText = () => {
    return `--- PACIENTE SOS EMERGE ---\n` +
      `NOME: ${profile.nomeCompleto}\n` +
      `IDADE: ${profile.idade} anos | SANGUE: ${profile.tipoSanguineo}\n` +
      `DOENÇAS: ${profile.doencas}\n` +
      `ALERGIAS: ${profile.alergias}\n` +
      `MEDICAMENTOS EM USO:\n` +
      medications.filter(m => m.active).map(m => ` • ${m.name} (${m.dosage}) - ${m.frequency}`).join('\n') + `\n` +
      `RESPONSÁVEL: ${profile.contatoEmergenciaNome} (${profile.contatoEmergenciaParentesco || 'Não Informado'}) - CONTATO: ${profile.contatoEmergenciaTelefone}\n` +
      `Sistema CrossMeds PWA Inteligente`;
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(getSOSQRDataText())}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pt-2 pb-14 px-1" id="patient-report-page">
      {/* Header and Back Navigation */}
      <div className="flex justify-between items-center bg-transparent gap-4 mb-4 select-none print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className={`p-3.5 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-sm ${
              darkMode ? 'bg-[#242b38] hover:bg-[#2c3547] text-zinc-300 border border-zinc-800' : 'bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-150/50'
            }`}
          >
            <ChevronLeft size={18} className="stroke-[3]" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight leading-none">
              Relatório do Paciente
            </h2>
            <p className="text-zinc-100/80 text-xs font-semibold mt-1">
              Compartilhe seu histórico de saúde, exames e adesão terapêutica.
            </p>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4.5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md hover:scale-103"
        >
          <Printer size={15} /> Imprimir Relatório
        </button>
      </div>

      {/* Main Print Layout */}
      <div className="space-y-6 print:space-y-4 print:text-black">
        
        {/* Banner: Relatório de Saúde */}
        <div className={`rounded-[2rem] p-6 border transition-all duration-300 relative overflow-hidden shadow-sm ${
          darkMode ? 'bg-[#242b38] border-[#2e3a4e] text-white' : 'bg-white border-emerald-100'
        }`}>
          <div className="absolute right-0 top-0 translate-x-5 -translate-y-5 w-44 h-44 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
                Prontuário Consolidado
              </span>
              <h1 className="text-3xl font-black tracking-tight mt-3 text-zinc-900 dark:text-white">
                Relatório de Saúde
              </h1>
              <p className="text-zinc-400 text-xs mt-1.5 font-bold">
                Gerado em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            
            <div className="text-right">
              <p className="text-xs font-black uppercase text-zinc-400">Código SOS</p>
              <div className="text-sm font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-300 px-3 py-1.5 rounded-lg mt-1 inline-block">
                #MED-{user?.uid ? user.uid.substring(0, 6).toUpperCase() : 'GUEST'}
              </div>
            </div>
          </div>
        </div>

        {/* Card: Dados Pessoais */}
        <div className={`rounded-[2rem] p-6 border transition-all duration-300 shadow-sm ${
          darkMode ? 'bg-[#242b38] border-[#2e3a4e]' : 'bg-white border-zinc-100'
        }`}>
          <div className="flex justify-between items-center mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-2">
              <User className="text-emerald-500" size={18} />
              <h3 className="font-extrabold text-sm uppercase tracking-tight text-zinc-700 dark:text-zinc-300">
                Dados Pessoais
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-zinc-400 text-[10px] font-semibold italic">
                Última atualização: {profile.lastUpdated}
              </span>
              <button
                onClick={() => {
                  setEditForm({ ...profile });
                  setIsEditingProfile(!isEditingProfile);
                }}
                className="p-2 hover:bg-zinc-150/40 dark:hover:bg-zinc-800 rounded-xl transition-all cursor-pointer text-emerald-500 print:hidden"
              >
                <Edit3 size={15} />
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!isEditingProfile ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <span className="text-[10px] uppercase font-black text-zinc-400 tracking-wider">Nome Completo</span>
                    <p className="text-lg font-black text-zinc-900 dark:text-white">{profile.nomeCompleto}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-black text-zinc-400 tracking-wider">Idade</span>
                      <p className="text-md font-bold">{profile.idade} anos</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-black text-zinc-400 tracking-wider">Gênero</span>
                      <p className="text-md font-bold">{profile.sexo}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-black text-zinc-400 tracking-wider">Peso</span>
                      <p className="text-md font-bold">{profile.peso} kg</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-black text-zinc-400 tracking-wider">Altura</span>
                      <p className="text-md font-bold">{profile.altura} m</p>
                    </div>
                  </div>

                  {/* Detalhes do Responsável */}
                  <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-4 mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-black text-zinc-400 tracking-wider">Nome do Responsável</span>
                      <p className="text-sm font-black text-zinc-800 dark:text-zinc-250 mt-0.5">
                        {profile.contatoEmergenciaNome || 'Não informado'}
                      </p>
                      <span className="text-[9px] uppercase font-black tracking-wider text-emerald-600 dark:text-emerald-450 bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block mt-1">
                        {profile.contatoEmergenciaParentesco || 'Outro'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-black text-zinc-400 tracking-wider">Telefone do Responsável</span>
                      <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1 tracking-wide">
                        {profile.contatoEmergenciaTelefone || 'Não informado'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 py-1 justify-center border-t md:border-t-0 md:border-l border-zinc-100 dark:border-zinc-800 md:pl-6">
                  {/* BMI Widget */}
                  <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-[#1b2432]/60 border-[#2e3a4e]' : 'bg-zinc-50 border-zinc-100'}`}>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] uppercase font-black text-zinc-450 tracking-wider">IMC Calculado</span>
                      <span className={`text-[10px] font-black uppercase tracking-wider ${imcColor}`}>{imcClass}</span>
                    </div>
                    <p className="text-2.5xl font-black mt-1 text-zinc-850 dark:text-white">
                      {imc !== null ? imc : '-'}
                    </p>
                  </div>

                  {/* HbA1c Widget */}
                  <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-[#1b2432]/60 border-[#2e3a4e]' : 'bg-zinc-50 border-zinc-100'}`}>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] uppercase font-black text-zinc-450 tracking-wider">HbA1c Estimada (%)</span>
                      <span className="text-[10px] font-semibold text-zinc-400">Lab: {profile.hba1cLab || '-'}%</span>
                    </div>
                    <p className="text-2.5xl font-black mt-1 text-zinc-850 dark:text-white">
                      {hba1c}%
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-black uppercase text-zinc-450">Nome Completo</label>
                    <input
                      type="text"
                      className={`px-4 py-2.5 rounded-xl border font-bold text-sm outline-none transition-colors ${
                        darkMode ? 'bg-[#1b2432] border-[#2e3a4e] focus:border-emerald-500' : 'bg-zinc-50 border-zinc-200 focus:border-emerald-500 focus:bg-white'
                      }`}
                      value={editForm.nomeCompleto}
                      onChange={e => setEditForm({ ...editForm, nomeCompleto: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div className="flex flex-col gap-1.5 col-span-1">
                      <label className="text-[11px] font-black uppercase text-zinc-450">Idade</label>
                      <input
                        type="number"
                        className={`px-3 py-2.5 rounded-xl border text-center font-bold text-sm outline-none transition-colors ${
                          darkMode ? 'bg-[#1b2432] border-[#2e3a4e]' : 'bg-zinc-50 border-zinc-200'
                        }`}
                        value={editForm.idade}
                        onChange={e => setEditForm({ ...editForm, idade: e.target.value })}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 col-span-1">
                      <label className="text-[11px] font-black uppercase text-zinc-450">Peso (kg)</label>
                      <input
                        type="text"
                        className={`px-2 py-2.5 rounded-xl border text-center font-bold text-sm outline-none transition-colors ${
                          darkMode ? 'bg-[#1b2432] border-[#2e3a4e]' : 'bg-zinc-50 border-zinc-200'
                        }`}
                        value={editForm.peso}
                        onChange={e => setEditForm({ ...editForm, peso: e.target.value })}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 col-span-1">
                      <label className="text-[11px] font-black uppercase text-zinc-450">Altura (m)</label>
                      <input
                        type="text"
                        className={`px-2 py-2.5 rounded-xl border text-center font-bold text-sm outline-none transition-colors ${
                          darkMode ? 'bg-[#1b2432] border-[#2e3a4e]' : 'bg-zinc-50 border-zinc-200'
                        }`}
                        value={editForm.altura}
                        onChange={e => setEditForm({ ...editForm, altura: e.target.value })}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 col-span-1">
                      <label className="text-[11px] font-black uppercase text-zinc-450">Gênero</label>
                      <select
                        className={`px-2 py-2.5 rounded-xl border font-bold text-xs outline-none transition-colors h-[42px] ${
                          darkMode ? 'bg-[#1b2432] border-[#2e3a4e]' : 'bg-zinc-50 border-zinc-200'
                        }`}
                        value={editForm.sexo}
                        onChange={e => setEditForm({ ...editForm, sexo: e.target.value })}
                      >
                        <option value="Masculino">Masc</option>
                        <option value="Feminino">Fem</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Seção Nova: Edição do Responsável no formulário */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-zinc-100 dark:border-zinc-800/80 pt-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-black uppercase text-zinc-450">Nome do Responsável</label>
                    <input
                      type="text"
                      placeholder="Ex: Clara Saconato"
                      className={`px-4 py-2.5 rounded-xl border font-bold text-sm outline-none transition-colors ${
                        darkMode ? 'bg-[#1b2432] border-[#2e3a4e] focus:border-emerald-500' : 'bg-zinc-50 border-zinc-200 focus:border-emerald-500 focus:bg-white'
                      }`}
                      value={editForm.contatoEmergenciaNome}
                      onChange={e => setEditForm({ ...editForm, contatoEmergenciaNome: e.target.value })}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-black uppercase text-zinc-450">Grau de Parentesco</label>
                    <select
                      className={`px-4 py-2.5 rounded-xl border font-bold text-sm outline-none transition-colors h-[42px] cursor-pointer ${
                        darkMode ? 'bg-[#1b2432] border-[#2e3a4e]' : 'bg-zinc-50 border-zinc-200 focus:bg-white'
                      }`}
                      value={editForm.contatoEmergenciaParentesco}
                      onChange={e => setEditForm({ ...editForm, contatoEmergenciaParentesco: e.target.value })}
                    >
                      <option value="Cônjuge (Esposa/Marido)">Cônjuge (Esposa/Marido)</option>
                      <option value="Pai">Pai</option>
                      <option value="Mãe">Mãe</option>
                      <option value="Filho">Filho</option>
                      <option value="Filha">Filha</option>
                      <option value="Irmão">Irmão</option>
                      <option value="Irmã">Irmã</option>
                      <option value="Tio">Tio</option>
                      <option value="Tia">Tia</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-black uppercase text-zinc-450">Telefone do Responsável</label>
                    <input
                      type="text"
                      placeholder="Ex: (11) 99887-7665"
                      className={`px-4 py-2.5 rounded-xl border font-bold text-sm outline-none transition-colors ${
                        darkMode ? 'bg-[#1b2432] border-[#2e3a4e] focus:border-emerald-500' : 'bg-zinc-50 border-zinc-200 focus:border-emerald-500 focus:bg-white'
                      }`}
                      value={editForm.contatoEmergenciaTelefone}
                      onChange={e => setEditForm({ ...editForm, contatoEmergenciaTelefone: e.target.value })}
                    />
                  </div>
                </div>

                {/* Patient Profile Actions */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-650 dark:text-zinc-300 rounded-xl text-xs font-black uppercase tracking-wider"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleSaveProfile(editForm)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm"
                  >
                    Salvar Dados Pessoais
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Card: Dados Clínicos (Exames, Alergias, Colesterol, Glicemia, Contato) */}
        <div className={`rounded-[2rem] p-6 border transition-all duration-300 shadow-sm ${
          darkMode ? 'bg-[#242b38] border-[#2e3a4e]' : 'bg-white border-zinc-100'
        }`}>
          <div className="flex justify-between items-center mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-2">
              <Activity className="text-emerald-500" size={18} />
              <h3 className="font-extrabold text-sm uppercase tracking-tight text-zinc-700 dark:text-zinc-300">
                Dados Clínicos & Exames
              </h3>
            </div>
            <div className="text-xs text-zinc-400 italic">
              Indicadores cardiovasculares, metabólicos e segurança do paciente
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-[#1b2432]/60 border-[#2e3a4e]' : 'bg-zinc-50 border-zinc-100'}`}>
                  <span className="text-[9px] uppercase font-black text-zinc-400">Glicemia</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-black">{profile.glicemia}</span>
                    <span className="text-[10px] text-zinc-450 font-bold">mg/dL</span>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-[#1b2432]/60 border-[#2e3a4e]' : 'bg-zinc-50 border-zinc-100'}`}>
                  <span className="text-[9px] uppercase font-black text-zinc-400">Colesterol</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-black">{profile.colesterol}</span>
                    <span className="text-[10px] text-zinc-450 font-bold">mg/dL</span>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-[#1b2432]/60 border-[#2e3a4e]' : 'bg-zinc-50 border-zinc-100'}`}>
                  <span className="text-[9px] uppercase font-black text-zinc-400">Pressão Art.</span>
                  <div className="flex items-baseline gap-0.5 mt-1">
                    <span className="text-md font-black">{profile.pressaoSistolica}/{profile.pressaoDiastolica}</span>
                    <span className="text-[9px] text-zinc-400 font-bold ml-1">PA</span>
                  </div>
                </div>
              </div>

              {/* Alergias & Comorbidades Display/Editor */}
              <div className="space-y-3.5 pt-1.5">
                <div className="p-4 bg-rose-500/5 rounded-2xl border border-rose-500/20">
                  <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 mb-1">
                    <AlertTriangle size={15} />
                    <span className="text-[10px] font-black uppercase tracking-wider">Alergias Críticas</span>
                  </div>
                  <p className="text-sm font-extrabold text-zinc-800 dark:text-rose-300">
                    {profile.alergias || 'Nenhuma alergia relatada'}
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-[#1b2432]/60 border-[#2e3a4e]' : 'bg-zinc-50 border-zinc-100'}`}>
                  <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 mb-1">
                    <FileText size={15} />
                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-450">Comorbidades / Condições</span>
                  </div>
                  <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                    {profile.doencas || 'Nenhuma doença crônica relatada'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between space-y-4">
              {/* Blood Type & Direct SOS Contacts */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-[#1b2432]/60 border-[#2e3a4e]' : 'bg-zinc-50 border-zinc-100'}`}>
                  <span className="text-[9px] uppercase font-black text-zinc-400">Tipo Sanguíneo</span>
                  <p className="text-lg font-black text-rose-500 mt-1">{profile.tipoSanguineo}</p>
                </div>
                
                <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-[#1b2432]/60 border-[#2e3a4e]' : 'bg-zinc-50 border-zinc-100'}`}>
                  <span className="text-[9px] uppercase font-black text-zinc-400">Estatuto Geral</span>
                  <p className="text-sm font-black text-emerald-500 uppercase tracking-wide mt-1.5">Estável</p>
                </div>
              </div>

              {/* Emergency Contacts Card */}
              <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-[#1b2432]/60 border-[#2e3a4e]' : 'bg-zinc-50 border-zinc-100'}`}>
                <div className="flex items-center gap-2 text-[10px] uppercase font-black text-zinc-400 mb-2">
                  <UserPlus size={14} className="text-emerald-500" />
                  Responsável / Contato SOS
                </div>
                <p className="text-sm font-black text-zinc-800 dark:text-white leading-tight">
                  {profile.contatoEmergenciaNome}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  <span className="text-[9px] uppercase font-black tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/15 px-2 py-0.5 rounded-full">
                    {profile.contatoEmergenciaParentesco || 'Outro'}
                  </span>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-bold tracking-wide">
                    {profile.contatoEmergenciaTelefone}
                  </p>
                </div>
              </div>

              {/* Print notice / instruction */}
              <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-[10px] text-zinc-400 font-semibold leading-normal">
                Nota para o médico: Este relatório compila os dados históricos alimentados pelo paciente, integrando sinais vitais e diário de adesão farmacológica autogerido.
              </div>
            </div>
          </div>

          {/* Quick Edit Clinical Parameters Inputs Row style form */}
          <div className="print:hidden border-t border-zinc-100 dark:border-zinc-800 pt-5 space-y-4">
            <h4 className="text-[11px] font-black uppercase text-zinc-450 tracking-wider">Mais detalhes / Atualizar Diário Clínico</h4>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] uppercase font-black text-zinc-400">Glicose (mg/dL)</span>
                <input
                  type="text"
                  placeholder="Ex: 110"
                  className={`px-3 py-2 rounded-xl border text-center font-bold text-sm outline-none ${
                    darkMode ? 'bg-[#1b2432] border-[#2e3a4e]' : 'bg-zinc-50 border-zinc-150'
                  }`}
                  value={profile.glicemia}
                  onChange={e => handleSaveProfile({ ...profile, glicemia: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[9px] uppercase font-black text-zinc-400">Colesterol (mg/dL)</span>
                <input
                  type="text"
                  placeholder="Ex: 190"
                  className={`px-3 py-2 rounded-xl border text-center font-bold text-sm outline-none ${
                    darkMode ? 'bg-[#1b2432] border-[#2e3a4e]' : 'bg-zinc-50 border-zinc-150'
                  }`}
                  value={profile.colesterol}
                  onChange={e => handleSaveProfile({ ...profile, colesterol: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[9px] uppercase font-black text-zinc-400">PA Sistólica</span>
                <input
                  type="text"
                  placeholder="Ex: 120"
                  className={`px-3 py-2 rounded-xl border text-center font-bold text-sm outline-none ${
                    darkMode ? 'bg-[#1b2432] border-[#2e3a4e]' : 'bg-zinc-50 border-zinc-150'
                  }`}
                  value={profile.pressaoSistolica}
                  onChange={e => handleSaveProfile({ ...profile, pressaoSistolica: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[9px] uppercase font-black text-zinc-400">PA Diastólica</span>
                <input
                  type="text"
                  placeholder="Ex: 80"
                  className={`px-3 py-2 rounded-xl border text-center font-bold text-sm outline-none ${
                    darkMode ? 'bg-[#1b2432] border-[#2e3a4e]' : 'bg-zinc-50 border-zinc-150'
                  }`}
                  value={profile.pressaoDiastolica}
                  onChange={e => handleSaveProfile({ ...profile, pressaoDiastolica: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1 col-span-2 md:col-span-1">
                <span className="text-[9px] uppercase font-black text-zinc-400">Sangue</span>
                <select
                  className={`px-3 py-2 rounded-xl border font-bold text-sm outline-none cursor-pointer h-[38px] ${
                    darkMode ? 'bg-[#1b2432] border-[#2e3a4e]' : 'bg-zinc-50 border-zinc-150'
                  }`}
                  value={profile.tipoSanguineo}
                  onChange={e => handleSaveProfile({ ...profile, tipoSanguineo: e.target.value })}
                >
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(sang => (
                    <option key={sang} value={sang}>{sang}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] uppercase font-black text-zinc-400">Alergias Alimentares / Medicamentosas</span>
                <input
                  type="text"
                  placeholder="Ex: Penicilina, Corantes"
                  className={`px-4 py-2.5 rounded-xl border font-bold text-xs outline-none ${
                    darkMode ? 'bg-[#1b2432] border-[#2e3a4e]' : 'bg-zinc-50 border-zinc-150'
                  }`}
                  value={profile.alergias}
                  onChange={e => handleSaveProfile({ ...profile, alergias: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[9px] uppercase font-black text-zinc-400">Responsável de Saúde / Contato S.O.S</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Nome do Responsável"
                    className={`px-3 py-2.5 rounded-xl border font-bold text-xs outline-none ${
                      darkMode ? 'bg-[#1b2432] border-[#2e3a4e]' : 'bg-zinc-50 border-zinc-150'
                    }`}
                    value={profile.contatoEmergenciaNome}
                    onChange={e => handleSaveProfile({ ...profile, contatoEmergenciaNome: e.target.value })}
                  />
                  <select
                    className={`px-3 py-2.5 rounded-xl border font-bold text-xs outline-none cursor-pointer h-[38px] ${
                      darkMode ? 'bg-[#1b2432] border-[#2e3a4e]' : 'bg-zinc-50 border-zinc-150'
                    }`}
                    value={profile.contatoEmergenciaParentesco}
                    onChange={e => handleSaveProfile({ ...profile, contatoEmergenciaParentesco: e.target.value })}
                  >
                    <option value="Cônjuge (Esposa/Marido)">Cônjuge (Esposa/Marido)</option>
                    <option value="Pai">Pai</option>
                    <option value="Mãe">Mãe</option>
                    <option value="Filho">Filho</option>
                    <option value="Filha">Filha</option>
                    <option value="Irmão">Irmão</option>
                    <option value="Irmã">Irmã</option>
                    <option value="Tio">Tio</option>
                    <option value="Tia">Tia</option>
                    <option value="Outro">Outro</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Telefone"
                    className={`px-3 py-2.5 rounded-xl border text-center font-bold text-xs outline-none ${
                      darkMode ? 'bg-[#1b2432] border-[#2e3a4e]' : 'bg-zinc-50 border-zinc-150'
                    }`}
                    value={profile.contatoEmergenciaTelefone}
                    onChange={e => handleSaveProfile({ ...profile, contatoEmergenciaTelefone: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card: Gráfico de Adesão ao Tratamento */}
        <div className={`rounded-[2rem] p-6 border transition-all duration-300 shadow-sm ${
          darkMode ? 'bg-[#242b38] border-[#2e3a4e] text-white' : 'bg-white border-zinc-100'
        }`}>
          <div className="flex justify-between items-start mb-1 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div>
              <h3 className="font-extrabold text-sm uppercase tracking-tight text-[#00aa74] flex items-center gap-2">
                <Layers size={17} />
                Gráfico de Adesão ao Tratamento (Últimos 30 dias)
              </h3>
              <p className="text-zinc-400 text-xs mt-1 font-semibold leading-relaxed">
                Percentagem de doses tomadas, puladas e esquecidas conforme registrado no app.
              </p>
            </div>
            
            {/* Inline interactive instructions for clicking the circles */}
            <div className="text-right text-[10px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-xl animate-pulse print:hidden">
              Toque nos círculos para marcar / mudar o dia
            </div>
          </div>

          {/* Adherence Legend */}
          <div className="flex gap-5 items-center py-4 text-xs font-black uppercase tracking-wider text-zinc-400">
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[9px] font-black">
                ✓
              </div>
              <span>Tomou</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 bg-rose-500 rounded-full flex items-center justify-center text-white text-[9px] font-black">
                ✗
              </div>
              <span>Pulou</span>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 bg-zinc-300 dark:bg-zinc-650 rounded-full"></div>
              <span>Esqueceu / Sem cadastro</span>
            </div>
          </div>

          {/* Medications Timelines Stack Rows */}
          <div className="space-y-6 pt-2">
            {medications.length === 0 ? (
              <p className="text-xs italic text-zinc-400 py-6 text-center">Nenhum medicamento registrado para gerar adesão.</p>
            ) : (
              medications.map(med => {
                const rate = calculateAdherenceRate(med);
                let rateColor = 'text-emerald-500';
                if (rate < 60) rateColor = 'text-rose-500';
                else if (rate < 85) rateColor = 'text-amber-500';

                return (
                  <div key={med.id} className="space-y-2 border-b border-zinc-100 dark:border-zinc-800/60 pb-5 last:border-0 last:pb-0">
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-400 text-xs font-black min-w-3 select-none">💊</span>
                        <p className="font-extrabold text-sm text-zinc-850 dark:text-zinc-100">
                          {med.name}
                        </p>
                        <span className="text-[10px] text-zinc-400 font-semibold">
                          - {med.dosage} ({med.frequency})
                        </span>
                      </div>
                      
                      {/* Percent badge */}
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] uppercase font-black text-zinc-400">Adesão:</span>
                        <span className={`text-sm font-black ${rateColor}`}>{rate}%</span>
                      </div>
                    </div>

                    {/* Timeline Tracker Strip (horizontal scroll on small screens) */}
                    <div className="relative pt-1">
                      <div className="overflow-x-auto overflow-y-hidden pb-1 max-w-full flex">
                        <div className="flex items-center justify-between gap-1.5 min-w-[550px] w-full bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-2xl border border-zinc-100/50 dark:border-zinc-800">
                          
                          {/* Last 30 daily circles */}
                          {last30Days.map((date, index) => {
                            const status = getDoseStatusForDay(med, date);
                            const dia = date.getDate();
                            const isToday = date.toDateString() === new Date().toDateString();

                            let circleStyle = 'bg-zinc-200 dark:bg-zinc-700 hover:scale-110 active:scale-95 text-transparent';
                            let icon = '';

                            if (status === 'taken') {
                              circleStyle = 'bg-emerald-500 text-white scale-105 shadow-sm shadow-emerald-500/20';
                              icon = '✓';
                            } else if (status === 'skipped') {
                              circleStyle = 'bg-rose-500 text-white scale-105 shadow-sm shadow-rose-500/20';
                              icon = '✗';
                            }

                            return (
                              <button
                                key={index}
                                onClick={() => {
                                  const year = date.getFullYear();
                                  const month = String(date.getMonth() + 1).padStart(2, '0');
                                  const dayStr = String(date.getDate()).padStart(2, '0');
                                  setSelectedDoseToEdit({
                                    medId: med.id,
                                    dateStr: `${year}-${month}-${dayStr}`,
                                    currentStatus: status === 'none' ? undefined : status
                                  });
                                }}
                                className={`w-7 h-7 rounded-full flex flex-col items-center justify-center text-[10px] font-black cursor-pointer transition-all shrink-0 ${circleStyle} select-none relative`}
                                title={`${date.toLocaleDateString('pt-BR')}: ${status === 'taken' ? 'Tomado' : status === 'skipped' ? 'Pulado' : 'Sem registro'}`}
                              >
                                {icon ? (
                                  <span>{icon}</span>
                                ) : (
                                  <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold">{dia}</span>
                                )}
                                
                                {isToday && (
                                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-sky-500 rounded-full border border-white dark:border-zinc-800"></span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Swipe notice inside grid strip */}
                      <div className="flex justify-between items-center text-[9px] font-semibold text-zinc-400 mt-1 md:hidden">
                        <span>← Passado</span>
                        <span>Deslize para ver todos os dias</span>
                        <span>Hoje →</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Modal/Overlay to selector change custom date click status */}
        <AnimatePresence>
          {selectedDoseToEdit && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-[70] print:hidden">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl border ${
                  darkMode ? 'bg-[#242b38] border-zinc-800 text-white' : 'bg-white border-zinc-100 text-zinc-850'
                }`}
              >
                <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4 select-none">
                  <h4 className="font-extrabold text-sm uppercase tracking-tight">Alterar Registro de Dose</h4>
                  <button onClick={() => setSelectedDoseToEdit(null)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-all cursor-pointer">
                    <X size={16} />
                  </button>
                </div>

                {(() => {
                  const targetMed = medications.find(m => m.id === selectedDoseToEdit.medId);
                  const parsedDate = new Date(selectedDoseToEdit.dateStr + 'T12:00:00'); // center raw date to avoid TZ shift
                  if (!targetMed) return null;

                  return (
                    <div className="space-y-4">
                      <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                        <span className="text-[10px] uppercase font-black text-zinc-400">Medicamento</span>
                        <p className="font-extrabold text-[15px]">{targetMed.name}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">{targetMed.dosage}</p>
                        
                        <div className="border-t border-zinc-100 dark:border-zinc-850/80 mt-3 pt-2.5">
                          <span className="text-[10px] uppercase font-black text-zinc-400">Dia Selecionado</span>
                          <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-0.5">
                            <Calendar size={14} />
                            {parsedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-black uppercase text-zinc-400 px-1 mb-1">Escolha o status desta dose:</span>
                        
                        <button
                          onClick={() => handleToggleDoseStatus(targetMed, parsedDate, 'taken')}
                          className={`flex items-center justify-between p-3.5 rounded-2xl font-bold text-sm transition-all text-left ${
                            selectedDoseToEdit.currentStatus === 'taken'
                              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                              : 'bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          <span className="flex items-center gap-2">✓ Tomou a dose do dia</span>
                          <CheckCircle2 size={16} />
                        </button>

                        <button
                          onClick={() => handleToggleDoseStatus(targetMed, parsedDate, 'skipped')}
                          className={`flex items-center justify-between p-3.5 rounded-2xl font-bold text-sm transition-all text-left ${
                            selectedDoseToEdit.currentStatus === 'skipped'
                              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                              : 'bg-rose-500/5 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          <span className="flex items-center gap-2">✗ Pulou / Não tomou</span>
                          <X size={15} />
                        </button>

                        <button
                          onClick={() => handleToggleDoseStatus(targetMed, parsedDate, undefined)}
                          className={`flex items-center justify-between p-3.5 rounded-2xl font-bold text-sm transition-all text-left ${
                            selectedDoseToEdit.currentStatus === undefined
                              ? 'bg-zinc-500 text-white'
                              : 'bg-zinc-100 hover:bg-zinc-150 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-400 dark:text-zinc-500'
                          }`}
                        >
                          <span>Limpar registro (Esquecido)</span>
                          <span className="w-4 h-4 rounded-full border border-dashed border-zinc-400"></span>
                        </button>
                      </div>

                      <button
                        onClick={() => setSelectedDoseToEdit(null)}
                        className="w-full py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-650 dark:text-zinc-300 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-colors mt-3"
                      >
                        Fechar
                      </button>
                    </div>
                  );
                })()}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Card: Medicaments em Uso */}
        <div className={`rounded-[2rem] p-6 border transition-all duration-300 shadow-sm ${
          darkMode ? 'bg-[#242b38] border-[#2e3a4e] text-white' : 'bg-white border-zinc-100'
        }`}>
          <div className="flex justify-between items-center mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <h3 className="font-extrabold text-sm uppercase tracking-tight text-zinc-700 dark:text-zinc-300">
              Medicamentos em Uso Ativo
            </h3>
            <span className="text-xs bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full font-black uppercase">
              {medications.filter(m => m.active).length} Prescrições
            </span>
          </div>

          <div className="space-y-3">
            {medications.filter(m => m.active).map(med => (
              <div key={med.id} className={`p-4 rounded-2xl border ${darkMode ? 'bg-[#1b2432]/50 border-[#2e3a4e]' : 'bg-[#fafafa] border-zinc-150/40'} flex justify-between items-center`}>
                <div className="space-y-0.5">
                  <p className="font-black text-sm text-zinc-850 dark:text-white">{med.name}</p>
                  <p className="text-xs text-zinc-450 leading-relaxed font-semibold">
                    Tomar {med.dosage} • {med.frequency} • Próxima: {med.time || '08:00'}
                  </p>
                  {med.howToTake && med.howToTake !== 'Selecione' && (
                    <span className="text-[10px] bg-sky-50 dark:bg-sky-950/20 text-sky-650 dark:text-sky-300 px-2.5 py-0.5 rounded-md font-bold mt-1 inline-block">
                      {med.howToTake}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-black text-zinc-400 block">Estoque</span>
                  <span className={`text-sm font-black ${med.stock !== undefined && med.stock <= (med.refillThreshold || 0) ? 'text-rose-500' : 'text-zinc-700 dark:text-zinc-300'}`}>
                    {med.stock !== undefined ? `${med.stock} un` : 'Ilimitado'}
                  </span>
                </div>
              </div>
            ))}
            {medications.filter(m => m.active).length === 0 && (
              <p className="text-xs italic text-zinc-400 py-6 text-center">Nenhum medicamento ativo registrado.</p>
            )}
          </div>
        </div>

        {/* Card: QR Code & Emergência SOS */}
        <div className={`rounded-[2.5rem] p-6 border transition-all duration-300 select-none ${
          darkMode ? 'bg-[#242b38] border-[#2e3a4e]' : 'bg-white border-zinc-100'
        }`}>
          <div className="flex justify-between items-start mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div>
              <h3 className="font-extrabold text-sm uppercase tracking-tight text-rose-500 flex items-center gap-1.5 leading-none">
                <QrCode size={19} className="stroke-[2.5]" />
                Cartão SOS Emergência & QR Code Médico
              </h3>
              <p className="text-zinc-400 text-xs mt-1.5 font-bold">
                Leitura instantânea em caso de resgate ou atendimento de emergência (Samu / Bombeiros)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            
            {/* Visual PVC SOS Card Design with flip representation */}
            <div className="p-6 bg-gradient-to-br from-rose-600 to-red-700 text-white rounded-3xl shadow-xl flex flex-col justify-between h-56 relative overflow-hidden">
              <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-48 h-48 bg-white/5 rounded-full pointer-events-none"></div>
              
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="bg-white text-rose-600 w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl shadow-md">
                    +
                  </div>
                  <div>
                    <h4 className="font-black text-md tracking-tight leading-none">CrossMeds PWA</h4>
                    <p className="text-[9px] uppercase font-bold tracking-wider opacity-90 mt-0.5">Ficha de Emergência</p>
                  </div>
                </div>
                
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full border border-white/10">
                  SOS Médico
                </span>
              </div>

              {/* Patient Core SOS details on card face */}
              <div className="space-y-1">
                <span className="text-[8px] uppercase tracking-wider opacity-75 font-black block">Paciente</span>
                <p className="text-base font-black tracking-tight truncate">{profile.nomeCompleto}</p>
                
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/15">
                  <div>
                    <span className="text-[7px] uppercase tracking-wider opacity-75 font-bold block">Sangue</span>
                    <p className="text-xs font-extrabold">{profile.tipoSanguineo}</p>
                  </div>
                  <div>
                    <span className="text-[7px] uppercase tracking-wider opacity-75 font-bold block">Idade</span>
                    <p className="text-xs font-extrabold">{profile.idade} anos</p>
                  </div>
                  <div>
                    <span className="text-[7px] uppercase tracking-wider opacity-75 font-bold block">Alergia</span>
                    <p className="text-[11px] font-black text-amber-300 truncate">{profile.alergias.split(',')[0]}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center text-[8px] font-extrabold uppercase tracking-wider opacity-90 leading-none">
                <span className="truncate max-w-[65%]">Resp: {profile.contatoEmergenciaNome} ({profile.contatoEmergenciaParentesco || 'Outro'}) - {profile.contatoEmergenciaTelefone}</span>
                <span>ESCANEIE O QR CODE</span>
              </div>
            </div>

            {/* QR Code Container side */}
            <div className="flex flex-col items-center justify-center text-center p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-3xl border border-zinc-100 dark:border-zinc-800">
              <div className="bg-white p-4 rounded-2.5xl w-48 h-48 flex items-center justify-center border border-zinc-150/50 shadow-inner">
                {/* Genuine high quality render QR Server Code */}
                <img 
                  src={qrImageUrl} 
                  alt="SOS Medical QR Code"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="mt-4 max-w-xs space-y-1">
                <p className="text-xs font-black uppercase tracking-wider text-zinc-500">Meu QR Code Médico</p>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-semibold">
                  Mantenha este QR Code impresso na sua carteira, chaveiro ou celular. Socorristas terão leitura instantânea offline de alergias e remédios!
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
