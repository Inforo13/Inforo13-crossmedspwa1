import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { VoiceButton } from './VoiceButton';
import { 
  ChevronLeft,
  User, 
  Calendar, 
  Activity, 
  AlertTriangle, 
  Info,
  Stethoscope,
  CheckCircle2,
  Lock,
  Unlock,
  Plus,
  Trash2,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  FileText,
  Check,
  Pill,
  Beaker,
  Bell,
  UserCheck,
  BarChart3,
  Thermometer,
  Droplets,
  Search,
  Share2,
  ExternalLink,
  HelpCircle,
  X,
  Copy,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Printer,
  Send,
  MessageSquare,
  Mail
} from 'lucide-react';
import { Medication, HealthLog } from '../types';
import { GoogleGenAI } from '@google/genai';

interface Props {
  medications: Medication[];
  onUpdateMedications?: (meds: Medication[]) => void;
  onBack?: () => void;
}

interface SavedConsultation {
  id: string;
  date: string;
  patientName: string;
  patientAge: string;
  doctorName: string;
  doctorCRM: string;
  soapSubjetivo: string;
  soapObjetivo: string;
  soapAvaliacao: string;
  soapPlano: string;
  medications: Medication[];
  lastUpdated: string;
}

export const MedicalPortal: React.FC<Props> = ({ medications, onUpdateMedications, onBack }) => {
  // --- Section 1: Reutilizar Receita state ---
  const [patientSearch, setPatientSearch] = useState('');
  const [savedConsultations, setSavedConsultations] = useState<SavedConsultation[]>([]);
  const [matchingConsultations, setMatchingConsultations] = useState<SavedConsultation[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // --- Section 2: Dados do Profissional state ---
  const [docName, setDocName] = useState('Dr. Jeferson Saconato');
  const [docCRM, setDocCRM] = useState('CRM-SP 185420');
  const [consultationDate, setConsultationDate] = useState('08/06/2026');

  // --- Section 3: Dados do Paciente state ---
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [idade, setIdade] = useState('');

  // --- Section 4: Análise de Sintomas (IA) state ---
  const [showAiAnalysis, setShowAiAnalysis] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');

  // --- Section 5: Observações Clínicas (SOAP) state ---
  const [soapSubjetivo, setSoapSubjetivo] = useState('');
  const [soapObjetivo, setSoapObjetivo] = useState('');
  const [soapAvaliacao, setSoapAvaliacao] = useState('');
  const [soapPlano, setSoapPlano] = useState('');

  // --- Section 6: Consulta MPI Brasil state ---
  const [showMpiGuide, setShowMpiGuide] = useState(false);
  const [mpiSearchTerm, setMpiSearchTerm] = useState('');
  
  // --- Section 7: Guia de Apoio Clínico state ---
  const [showCidGuide, setShowCidGuide] = useState(false);
  const [cidSearchTerm, setCidSearchTerm] = useState('');
  const [showInsulinasGuide, setShowInsulinasGuide] = useState(false);
  const [showRevisionQuestions, setShowRevisionQuestions] = useState(false);

  // --- Section 8: Receituário Digital (Form States) ---
  const [localPrescribedMeds, setLocalPrescribedMeds] = useState<Medication[]>([]);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedFreq, setNewMedFreq] = useState('1 vez ao dia');
  const [newMedQty, setNewMedQty] = useState('1');
  const [newMedType, setNewMedType] = useState('Comprimidos');
  const [newMedHowToTake, setNewMedHowToTake] = useState('Selecione');
  const [newMedIndication, setNewMedIndication] = useState('');
  const [newMedDurationType, setNewMedDurationType] = useState('continuo');
  const [newMedEndDate, setNewMedEndDate] = useState('');
  
  // Hours lists
  const [medHours, setMedHours] = useState<string[]>(['08:00']);
  const [newHourInput, setNewHourInput] = useState('');

  // Autocomplete for standard medications
  const [medSuggestions, setMedSuggestions] = useState<string[]>([]);
  const [showMedSuggestions, setShowMedSuggestions] = useState(false);

  // Autocomplete for dosage based on selected drug
  const [dosageSuggestions, setDosageSuggestions] = useState<string[]>([]);

  // Feedback states
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [shareReceiptModal, setShareReceiptModal] = useState(false);
  const [generatedShareUrl, setGeneratedShareUrl] = useState('');

  // Preloaded common elder-care medications database list for autocomplete
  const DRUG_DICTIONARY: Record<string, string[]> = {
    'Losartana Potássica': ['50 mg', '100 mg'],
    'Metformina': ['500 mg', '850 mg', '1000 mg'],
    'Anlodipino Besilato': ['5 mg', '10 mg'],
    'Hidroclorotiazida': ['25 mg', '50 mg'],
    'Atenolol': ['25 mg', '50 mg', '100 mg'],
    'Sinvastatina': ['20 mg', '40 mg'],
    'Carbonato de Cálcio': ['500 mg', '1250 mg'],
    'Omeprazol': ['20 mg', '40 mg'],
    'AAS (Ácido Acetilsalicílico)': ['100 mg'],
    'Gliclazida': ['30 mg', '60 mg'],
    'Medicamento Personalizado': []
  };

  // Preloaded CID-10 database for reference
  const CID10_DATABASE = [
    { code: 'I10', desc: 'Hipertensão Essencial (Primária)' },
    { code: 'E11', desc: 'Diabetes Mellitus Não-Insulinodependente (Tipo 2)' },
    { code: 'F03', desc: 'Demência Não Especificada' },
    { code: 'I25', desc: 'Doença Isquêmica Crônica do Coração' },
    { code: 'E78', desc: 'Distúrbios do Metabolismo de Lipoproteínas (Dislipidemia)' },
    { code: 'M81', desc: 'Osteoporose Sem Fratura Patológica' },
    { code: 'K21', desc: 'Refluxo Gastroesofágico' },
    { code: 'M19', desc: 'Outras Artroses' }
  ];

  // Beers Criteria / Potentially Inappropriate Medications (MPI) for Elders in Brazil
  const MPI_DATABASE = [
    { name: 'Amitriptilina', risk: 'Anticolinérgico potente. Alto risco de sedação, tontura, confusão mental, boca seca e quedas.', recomendacao: 'Trocar por ISRS como Sertralina se indicado para depressão.' },
    { name: 'Diazepam', risk: 'Benzodiazepínico de meia-vida longa. Risco severo de quedas, fraturas, sonolência diurna e declínio cognitivo.', recomendacao: 'Reduzir gradualmente e suspender se possível. Considerar terapia não farmacológica para insônia.' },
    { name: 'Clonazepam', risk: 'Sedação acumulativa, distúrbios de marcha e coordenação, alto risco de quedas em idosos.', recomendacao: 'Uso restrito ao menor tempo e menor dose possível.' },
    { name: 'Ibuprofeno', risk: 'AINEs não seletivos. Alto risco de hemorragia gastrointestinal, nefrotoxicidade aguda e piora da hipertensão arterial.', recomendacao: 'Evitar uso crônico. Utilizar Paracetamol ou Dipirona para controle de dor analgésica leve a moderada.' },
    { name: 'Diclofenaco', risk: 'Elevado perigo de injúria renal, sangramento gástrico silencioso e retenção de fluidos/edema.', recomendacao: 'Evitar completamente na população geriátrica.' },
    { name: 'Nimesulida', risk: 'Risco de hepatotoxicidade e sangramento gástrico substancial.', recomendacao: 'Não indicado para dores crônicas ou uso contínuo em idosos.' },
    { name: 'Clonidina', risk: 'Alto risco de hipotensão ortostática acentuada, bradicardia sinusal e depressão do SNC.', recomendacao: 'Usar outros anti-hipertensivos de primeira linha (IECA, BRA, Diuréticos de alça).' },
    { name: 'Digoxina', risk: 'Estreita faixa terapêutica no idoso. Risco de toxicidade digital (arritmias, náuseas, anorexia, alucinações).', recomendacao: 'Evitar como primeira linha para insuficiência cardíaca ou Fibrilação Atrial.' },
    { name: 'Metoclopramida', risk: 'Risco de efeitos extrapiramidais graves (disfunções motoras, Parkinsonismo induzido por drogas, discinesia tardia).', recomendacao: 'Substituir por Domperidona ou Ondansetrona se necessário.' }
  ];

  // Load saved consultations and professional details from localStorage on mount
  useEffect(() => {
    const savedConsultsRaw = localStorage.getItem('crossmeds_saved_clinical_consultations');
    if (savedConsultsRaw) {
      try {
        setSavedConsultations(JSON.parse(savedConsultsRaw));
      } catch (_) {}
    }

    const savedDocRaw = localStorage.getItem('crossmeds_logged_professional');
    if (savedDocRaw) {
      try {
        const doc = JSON.parse(savedDocRaw);
        if (doc.name) setDocName(doc.name);
        if (doc.crm) setDocCRM(doc.crm);
      } catch (_) {}
    }

    // Set today's date automatically in card 2
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    setConsultationDate(`${day}/${month}/${year}`);
  }, []);

  // Sync active doctor name/CRM changes to default persistent professional
  useEffect(() => {
    localStorage.setItem('crossmeds_logged_professional', JSON.stringify({ name: docName, crm: docCRM }));
  }, [docName, docCRM]);

  // --- CENTRAL AUTOMATIC STORAGE CORE ---
  // Keeps EVERYTHING synchronized dynamically on modification under that patient name to live up to:
  // "Tudo o que ele fizer aqui vai ficar guardado e ele vai procurar no reutilizar receita pelo nome do paciente"
  useEffect(() => {
    if (nomeCompleto.trim().length > 2) {
      const cleanName = nomeCompleto.trim();
      const existingIndex = savedConsultations.findIndex(c => c.patientName.toLowerCase() === cleanName.toLowerCase());

      const activeRecord: SavedConsultation = {
        id: existingIndex >= 0 ? savedConsultations[existingIndex].id : 'consult-' + Math.random().toString(36).substr(2, 9),
        date: consultationDate,
        patientName: cleanName,
        patientAge: idade,
        doctorName: docName,
        doctorCRM: docCRM,
        soapSubjetivo,
        soapObjetivo,
        soapAvaliacao,
        soapPlano,
        medications: localPrescribedMeds,
        lastUpdated: new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };

      const updatedList = [...savedConsultations];
      if (existingIndex >= 0) {
        updatedList[existingIndex] = activeRecord;
      } else {
        updatedList.push(activeRecord);
      }

      setSavedConsultations(updatedList);
      localStorage.setItem('crossmeds_saved_clinical_consultations', JSON.stringify(updatedList));
    }
  }, [nomeCompleto, idade, docName, docCRM, soapSubjetivo, soapObjetivo, soapAvaliacao, soapPlano, localPrescribedMeds, consultationDate]);

  // Handle Search for patient ("Reutilizar Receita")
  const handlePatientSearchQueryChange = (val: string) => {
    setPatientSearch(val);
    if (!val.trim()) {
      setMatchingConsultations([]);
      setShowSearchDropdown(false);
      return;
    }

    const matches = savedConsultations.filter(c => 
      c.patientName.toLowerCase().includes(val.toLowerCase())
    );
    setMatchingConsultations(matches);
    setShowSearchDropdown(true);
  };

  // Select a previous consultation to reuse all values perfectly
  const handleSelectRecipeToReuse = (record: SavedConsultation) => {
    setNomeCompleto(record.patientName);
    setIdade(record.patientAge || '');
    setDocName(record.doctorName || docName);
    setDocCRM(record.doctorCRM || docCRM);
    setSoapSubjetivo(record.soapSubjetivo || '');
    setSoapObjetivo(record.soapObjetivo || '');
    setSoapAvaliacao(record.soapAvaliacao || '');
    setSoapPlano(record.soapPlano || '');

    setLocalPrescribedMeds(record.medications || []);

    setPatientSearch(record.patientName);
    setShowSearchDropdown(false);
    triggerSuccessToast('Receita e Prontuário preenchidos com os dados de ' + record.patientName);
  };

  // Helper to show custom micro-toasts
  const triggerSuccessToast = (msg: string) => {
    setToastMessage(msg);
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 4000);
  };

  // Handle running AI system triagem
  const handleExecuteAITriagem = () => {
    if (soapSubjetivo.trim()) {
      window.history.pushState({}, '', `/diagnostico-sintomas?sintomas=${encodeURIComponent(soapSubjetivo)}`);
    } else {
      window.history.pushState({}, '', '/diagnostico-sintomas');
    }
  };

  // Section 8: Prescription Additions logic
  const handleMedNameInput = (val: string) => {
    setNewMedName(val);
    if (!val.trim()) {
      setMedSuggestions([]);
      setShowMedSuggestions(false);
      return;
    }

    const matches = Object.keys(DRUG_DICTIONARY).filter(drug => 
      drug.toLowerCase().includes(val.toLowerCase())
    );
    setMedSuggestions(matches);
    setShowMedSuggestions(true);
  };

  const handleSelectMedFromList = (med: string) => {
    setNewMedName(med);
    setShowMedSuggestions(false);
    
    // Auto populate dosage choices
    const dosages = DRUG_DICTIONARY[med] || [];
    setDosageSuggestions(dosages);
    if (dosages.length > 0) {
      setNewMedDosage(dosages[0]);
    } else {
      setNewMedDosage('');
    }
  };

  // Manage Hours
  const handleAddHour = () => {
    if (!newHourInput) return;
    if (medHours.includes(newHourInput)) {
      alert('Este horário já está listado!');
      return;
    }
    setMedHours([...medHours, newHourInput].sort());
    setNewHourInput('');
  };

  const handleRemoveHour = (hr: string) => {
    if (medHours.length > 1) {
      setMedHours(medHours.filter(h => h !== hr));
    } else {
      alert('É necessário ter ao menos um horário para a prescrição!');
    }
  };

  const handlePrescribeMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim()) {
      alert('Escreva o nome do medicamento antes de prosseguir.');
      return;
    }
    if (!newMedDosage.trim()) {
      alert('Escreva a dosagem apropriada.');
      return;
    }

    const newId = 'presc-' + Math.random().toString(36).substr(2, 9);
    const newMed: Medication = {
      id: newId,
      userId: 'anonymous-trial',
      name: newMedName.trim(),
      dosage: newMedDosage.trim(),
      frequency: newMedFreq,
      time: medHours[0] || '08:00',
      times: medHours,
      startDate: new Date().toISOString().split('T')[0],
      endDate: newMedDurationType === 'terminar' && newMedEndDate ? newMedEndDate : undefined,
      instructions: newMedHowToTake !== 'Selecione' ? newMedHowToTake : undefined,
      indication: newMedIndication.trim() || undefined,
      active: true,
      lastTaken: undefined,
      createdAt: new Date().toISOString(),
      type: newMedType,
      route: 'Oral'
    };

    const updatedMeds = [...localPrescribedMeds, newMed];
    setLocalPrescribedMeds(updatedMeds);

    // Reset Form fields
    setNewMedName('');
    setNewMedDosage('');
    setNewMedIndication('');
    setNewMedHowToTake('Selecione');
    setNewMedFreq('1 vez ao dia');
    setMedHours(['08:00']);
    setNewHourInput('');

    triggerSuccessToast(`Medicamento "${newMed.name}" inserido na receita!`);
  };

  const handleRemoveMedication = (id: string, name: string) => {
    const updated = localPrescribedMeds.filter(m => m.id !== id);
    setLocalPrescribedMeds(updated);
    triggerSuccessToast(`Medicamento "${name}" removido da receita.`);
  };

  // Verify if any prescribed medicine is classified as Potentially Inappropriate (MPI)
  const getPrescriptionMpiAlerts = () => {
    const alerts: { medName: string; risk: string; recommendation: string }[] = [];
    localPrescribedMeds.forEach(med => {
      const match = MPI_DATABASE.find(mpi => 
        med.name.toLowerCase().includes(mpi.name.toLowerCase()) || 
        mpi.name.toLowerCase().includes(med.name.toLowerCase())
      );
      if (match) {
        alerts.push({
          medName: med.name,
          risk: match.risk,
          recommendation: match.recomendacao
        });
      }
    });
    return alerts;
  };

  const mpiAlerts = getPrescriptionMpiAlerts();

  const serializePrescription = () => {
    const data = {
      nome: nomeCompleto,
      idade: idade,
      m: docName,
      c: docCRM,
      d: consultationDate,
      meds: localPrescribedMeds.map(med => ({
        n: med.name,
        d: med.dosage,
        f: med.frequency,
        t: med.times || (med.time ? [med.time] : []),
        i: med.instructions || '',
        in: med.indication || '',
        tp: med.type || 'Comprimidos'
      }))
    };
    try {
      return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
    } catch (e) {
      return '';
    }
  };

  // Generate shareable link
  const handleGenerateShareableLink = () => {
    if (!nomeCompleto.trim()) {
      alert('Insira o nome do paciente no card "3. Dados do Paciente" antes de gerar o link compartilhado da receita digital.');
      return;
    }
    if (localPrescribedMeds.length === 0) {
      alert('Prescreva ao menos um medicamento no card "8. Receituário Digital" para ser listado na receita.');
      return;
    }

    // Generate a beautiful preview URL pointing to the patient's portal with full prescription data serialized
    const patientSlug = encodeURIComponent(nomeCompleto.trim().toLowerCase().replace(/\s+/g, '-'));
    const dataString = serializePrescription();
    const generatedUrl = `${window.location.origin}/receita-digital?paciente=${patientSlug}&consultaId=${Math.floor(1000 + Math.random() * 9000)}&data=${encodeURIComponent(dataString)}`;
    setGeneratedShareUrl(generatedUrl);
    setShareReceiptModal(true);
  };

  const copyToClipboard = () => {
    if (!generatedShareUrl) return;
    navigator.clipboard.writeText(generatedShareUrl);
    alert('Link copiado com sucesso! Pode colar agora no WhatsApp ou SMS para enviar ao paciente.');
  };

  return (
    <div className="space-y-6 pt-2 pb-16 max-w-4xl mx-auto selection:bg-[#cbf4e1] text-zinc-950 dark:text-zinc-50">
      
      {/* Toast Alert Banner */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div 
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 dark:bg-emerald-500 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2 border border-emerald-500/30 text-xs font-black tracking-tight"
          >
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <button
            onClick={onBack}
            className="p-3 rounded-2xl bg-white dark:bg-[#1a2333] hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 shadow-sm transition-transform active:scale-95 cursor-pointer"
          >
            <ChevronLeft size={18} className="stroke-[3]" />
          </button>
          <div className="text-left">
            <h2 className="text-2xl font-black text-zinc-905 dark:text-white tracking-tight flex items-center gap-2">
              <Stethoscope className="text-[#00897b]" size={24} /> Prontuário & Receituário Integrado
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-[11px] font-semibold mt-1">
              Registro clínico em via única para suporte preventivo à prescrição geriátrica.
            </p>
          </div>
        </div>
        
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400 rounded-full border border-sky-200/50 dark:border-sky-800/40 text-[10px] font-black uppercase tracking-wider">
          <Activity size={11} className="animate-pulse" /> Atendimento Ativo
        </div>
      </div>

      {/* SECTION 1: REUTILIZAR RECEITA */}
      <div className="bg-white dark:bg-[#1e2736] border border-zinc-150 dark:border-zinc-800 rounded-[2rem] p-6 shadow-sm space-y-4 relative">
        <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400">
          <RefreshCw size={22} className="stroke-[2.5]" />
          <h3 className="text-md font-black tracking-tight">1. Reutilizar Receita</h3>
        </div>

        <div className="relative">
          <div className="flex gap-2.5">
            <input
              type="text"
              value={patientSearch}
              onChange={(e) => handlePatientSearchQueryChange(e.target.value)}
              onFocus={() => { if (matchingConsultations.length > 0) setShowSearchDropdown(true); }}
              placeholder="Nome do paciente..."
              className="flex-1 px-5 py-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl text-xs font-semibold focus:outline-hidden focus:border-blue-500 focus:bg-white focus:dark:bg-zinc-900"
            />
            <button 
              type="button"
              className="p-4 bg-[#00897b] hover:bg-[#00796b] text-white rounded-2xl transition-transform active:scale-95 shadow-xs shrink-0 flex items-center justify-center cursor-pointer"
            >
              <Search size={18} />
            </button>
          </div>

          {/* Autocomplete dropdown suggestion results */}
          {showSearchDropdown && matchingConsultations.length > 0 && (
            <div className="absolute left-0 right-0 top-[102%] bg-white dark:bg-[#202938] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl z-20 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-850">
              <div className="p-2.5 bg-zinc-50 dark:bg-zinc-900 text-[10px] font-black uppercase text-zinc-400 tracking-wider text-left">
                Gabaritos e Históricos de Receitas Encontrados
              </div>
              {matchingConsultations.map((record) => (
                <button
                  key={record.id}
                  onClick={() => handleSelectRecipeToReuse(record)}
                  className="w-full p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 text-left transition-colors flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-black block text-zinc-800 dark:text-zinc-100">{record.patientName}</span>
                    <span className="text-[10px] text-zinc-400 font-bold tracking-tight block mt-0.5">
                      Idade: {record.patientAge || 'NP'} anos • Médico: {record.doctorName} ({record.doctorCRM})
                    </span>
                  </div>
                  <span className="text-[9px] bg-blue-100 dark:bg-blue-955 text-blue-700 dark:text-blue-400 py-1 px-2.5 rounded-lg font-black uppercase">
                    Reutilizar
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: DADOS DO PROFISSIONAL */}
      <div className="bg-white dark:bg-[#1e2736] border border-zinc-150 dark:border-zinc-800 rounded-[2rem] p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400">
          <UserCheck size={22} className="stroke-[2.5]" />
          <h3 className="text-md font-black tracking-tight">2. Dados do Profissional</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 text-left">
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-black tracking-widest text-[#00897b]">Nome do Profissional</span>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                placeholder="Ex: Dr. Jeferson Saconato"
                className="flex-1 px-5 py-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500 focus:bg-white focus:dark:bg-zinc-900"
              />
              <VoiceButton 
                onResult={(text) => setDocName(text)}
                placeholder="Diga o nome do médico..."
                className="h-[50px] w-[50px] rounded-2xl shrink-0"
                size={18}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-black tracking-widest text-[#00897b]">CRM / Registro</span>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={docCRM}
                  onChange={(e) => setDocCRM(e.target.value)}
                  placeholder="Ex: CRM-SP 185420"
                  className="flex-1 px-5 py-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500 focus:bg-white focus:dark:bg-zinc-900"
                />
                <VoiceButton 
                  onResult={(text) => setDocCRM(text)}
                  placeholder="Diga o CRM..."
                  className="h-[50px] w-[50px] rounded-2xl shrink-0"
                  size={18}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-black tracking-widest text-[#00897b]">Data da Consulta</span>
              <input
                type="text"
                value={consultationDate}
                onChange={(e) => setConsultationDate(e.target.value)}
                placeholder="DD/MM/AAAA"
                className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500 focus:bg-white focus:dark:bg-zinc-900"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: DADOS DO PACIENTE */}
      <div className="bg-white dark:bg-[#1e2736] border border-zinc-150 dark:border-zinc-800 rounded-[2rem] p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400">
          <User size={22} className="stroke-[2.5]" />
          <h3 className="text-md font-black tracking-tight">3. Dados do Paciente</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          <div className="md:col-span-2 space-y-1.5">
            <span className="text-[10px] uppercase font-black tracking-widest text-[#00897b]">Nome Completo</span>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={nomeCompleto}
                onChange={(e) => setNomeCompleto(e.target.value)}
                placeholder="Nome social ou completo de registro"
                className="flex-1 px-5 py-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500 focus:bg-white focus:dark:bg-zinc-900"
              />
              <VoiceButton 
                onResult={(text) => setNomeCompleto(text)}
                placeholder="Diga o nome do paciente..."
                className="h-[50px] w-[50px] rounded-2xl shrink-0"
                size={18}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-black tracking-widest text-[#00897b]">Idade</span>
            <input
              type="number"
              value={idade}
              onChange={(e) => setIdade(e.target.value)}
              placeholder="Idade do paciente"
              className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500 focus:bg-white focus:dark:bg-zinc-900"
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: ANÁLISE DE SINTOMAS (IA) */}
      <div className="bg-blue-600 dark:bg-blue-700 hover:bg-blue-555 rounded-[1.8rem] text-white p-5 shadow-md flex items-center justify-between gap-4 cursor-pointer transition-transform hover:scale-[1.01] overflow-hidden relative"
        onClick={() => setShowAiAnalysis(!showAiAnalysis)}
      >
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        <div className="flex items-center gap-4.5">
          <div className="w-13 h-13 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
            <Stethoscope size={24} className="stroke-[2.5]" />
          </div>
          <div className="text-left">
            <h3 className="text-md sm:text-lg font-black tracking-tight leading-none">4. Análise de Sintomas (IA)</h3>
            <p className="text-[10px] sm:text-xs text-blue-100 font-bold mt-1.5 opacity-90">Triagem inteligente para apoio ao diagnóstico</p>
          </div>
        </div>
        {showAiAnalysis ? <ChevronUp size={22} className="stroke-[3]" /> : <ChevronDown size={22} className="stroke-[3]" />}
      </div>

      {/* AI Expansion diagnostics */}
      {showAiAnalysis && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="p-6 bg-white dark:bg-[#1a2230] border border-blue-100 dark:border-zinc-800 rounded-[2rem] space-y-5 text-left"
        >
          <div className="flex items-start gap-3 bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-2xl border border-blue-100/55 dark:border-zinc-800">
            <Sparkles size={18} className="text-blue-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-semibold leading-relaxed">
              O assistente integrado analisa as anotações do prontuário (SOAP), idade do idoso, e remédios prescritos ativos para rastrear condições prioritárias no idoso em segundos.
            </p>
          </div>

          {aiLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="animate-spin text-blue-600" size={24} />
              <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">Processando Triagem Geronto-Fármaco por IA...</span>
            </div>
          ) : aiResponse ? (
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase text-blue-600 tracking-wider">Parecer Clínico da Triagem Inteligente:</h4>
              <div className="p-5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2.5xl text-xs font-semibold leading-relaxed text-zinc-700 dark:text-zinc-300 dark:border-zinc-800 h-80 overflow-y-auto whitespace-pre-wrap">
                {aiResponse}
              </div>
              <button 
                onClick={() => setAiResponse('')}
                className="px-4 py-2 bg-zinc-150 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 rounded-xl text-[10px] uppercase tracking-wider font-extrabold"
              >
                Refazer análise
              </button>
            </div>
          ) : (
            <div className="text-center py-6">
              <button
                onClick={handleExecuteAITriagem}
                className="py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-transform active:scale-95 shadow-md flex items-center justify-center gap-1.5 mx-auto"
              >
                <Sparkles size={14} /> Solicitar Parecer de Triagem por IA
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* SECTION 5: OBSERVAÇÕES CLÍNICAS (SOAP) */}
      <div className="bg-white dark:bg-[#1e2736] border border-zinc-150 dark:border-zinc-800 rounded-[2rem] p-6 shadow-sm space-y-5 text-left">
        <div className="flex items-center gap-2.5 text-[#00897b]">
          <FileText size={22} className="stroke-[2.5]" />
          <h3 className="text-md font-black tracking-tight">5. Observações Clínicas (SOAP)</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-black tracking-wider text-blue-600 dark:text-blue-400">S: SUBJETIVO</span>
            <div className="flex gap-2 items-start">
              <textarea
                value={soapSubjetivo}
                onChange={(e) => setSoapSubjetivo(e.target.value)}
                placeholder="Queixas, sintomas e histórico relatado..."
                rows={3}
                className="flex-1 p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl text-xs font-semibold focus:outline-hidden focus:border-teal-500 focus:bg-white"
              />
              <VoiceButton 
                onResult={(text) => setSoapSubjetivo(prev => prev ? prev + ' ' + text : text)}
                placeholder="Dite sintomas e queixas do paciente..."
                className="h-[80px] w-[50px] rounded-2xl shrink-0"
                size={18}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-black tracking-wider text-blue-600 dark:text-blue-400">O: OBJETIVO</span>
            <textarea
              value={soapObjetivo}
              onChange={(e) => setSoapObjetivo(e.target.value)}
              placeholder="Exame físico, sinais vitais, resultados de exames..."
              rows={3}
              className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl text-xs font-semibold focus:outline-hidden focus:border-teal-500 focus:bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-black tracking-wider text-blue-600 dark:text-blue-400">A: AVALIAÇÃO</span>
            <textarea
              value={soapAvaliacao}
              onChange={(e) => setSoapAvaliacao(e.target.value)}
              placeholder="Diagnóstico ou hipóteses diagnósticas..."
              rows={3}
              className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl text-xs font-semibold focus:outline-hidden focus:border-teal-500 focus:bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-black tracking-wider text-blue-600 dark:text-blue-400">P: PLANO</span>
            <textarea
              value={soapPlano}
              onChange={(e) => setSoapPlano(e.target.value)}
              placeholder="Conduta, exames solicitados, orientações..."
              rows={3}
              className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl text-xs font-semibold focus:outline-hidden focus:border-teal-500 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* SECTION 6: CONSULTA MPI BRASIL */}
      <div className="bg-amber-550 dark:bg-amber-655 hover:bg-amber-600 rounded-[1.8rem] text-white p-5 shadow-md flex items-center justify-between gap-4 cursor-pointer transition-transform hover:scale-[1.01] overflow-hidden relative"
        onClick={() => setShowMpiGuide(!showMpiGuide)}
      >
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        <div className="flex items-center gap-4.5">
          <div className="w-13 h-13 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
            <ShieldAlert size={24} className="stroke-[2.5]" />
          </div>
          <div className="text-left">
            <h3 className="text-md sm:text-lg font-black tracking-tight leading-none text-left">6. Consulta MPI Brasil</h3>
            <p className="text-[10px] sm:text-xs text-amber-50 font-bold mt-1.5 opacity-90 text-left">Guia de Medicamentos Inapropriados para Idosos</p>
          </div>
        </div>
        {showMpiGuide ? <ChevronUp size={22} className="stroke-[3]" /> : <ChevronDown size={22} className="stroke-[3]" />}
      </div>

      {/* MPI Dictionary content block */}
      {showMpiGuide && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1a2230] border border-amber-200 dark:border-zinc-800 p-6 rounded-[2rem] space-y-5 text-left"
        >
          {/* Active MPI Warnings in Recipe */}
          {mpiAlerts.length > 0 && (
            <div className="p-4 bg-red-500/5 dark:bg-red-950/20 border border-red-500/20 rounded-2.5xl text-left space-y-2.5">
              <span className="text-[10px] font-black uppercase text-red-500 flex items-center gap-1.5">
                <AlertTriangle size={14} /> ALERTA DE SEGURANÇA: MPI prescrito na receita ativa!
              </span>
              <div className="space-y-2">
                {mpiAlerts.map((alt, i) => (
                  <div key={i} className="text-xs bg-white dark:bg-zinc-900 border border-red-100 p-3.5 rounded-xl space-y-1 dark:border-zinc-800">
                    <span className="font-black text-zinc-800 dark:text-zinc-100 block">Fármaco: {alt.medName}</span>
                    <span className="text-zinc-500 dark:text-zinc-400 font-semibold leading-normal block">Risco: {alt.risk}</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-black block mt-1">Recomendação Geriátrica: {alt.recommendation}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Search size={14} className="text-zinc-400" />
              <input 
                type="text"
                value={mpiSearchTerm}
                onChange={(e) => setMpiSearchTerm(e.target.value)}
                placeholder="Pesquisar fármaco proibido..."
                className="w-full px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900 text-xs font-semibold focus:outline-hidden"
              />
            </div>

            <div className="h-64 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-150 rounded-2xl p-2.5 bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800">
              {MPI_DATABASE.filter(m => m.name.toLowerCase().includes(mpiSearchTerm.toLowerCase())).map((m, idx) => (
                <div key={idx} className="py-3.5 space-y-1 text-xs">
                  <span className="font-black text-zinc-900 dark:text-zinc-150 block">{m.name}</span>
                  <span className="text-zinc-500 dark:text-zinc-450 leading-relaxed block"><strong className="text-red-500">Risco:</strong> {m.risk}</span>
                  <span className="text-zinc-800 dark:text-zinc-350 block leading-relaxed"><strong className="text-emerald-600 dark:text-emerald-400">Alternativa recomendada:</strong> {m.recomendacao}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* SECTION 7: GUIA DE APOIO CLÍNICO */}
      <div className="bg-white dark:bg-[#1e2736] border border-zinc-150 dark:border-zinc-800 rounded-[2rem] p-6 shadow-sm space-y-4 text-left">
        <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400">
          <BookOpen size={22} className="stroke-[2.5]" />
          <h3 className="text-md font-black tracking-tight">7. Guia de Apoio Clínico</h3>
        </div>

        {/* Action button Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <button 
            type="button"
            onClick={() => { setShowCidGuide(!showCidGuide); setShowInsulinasGuide(false); setShowRevisionQuestions(false); }}
            className="p-4 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-850 rounded-2xl text-xs font-black tracking-tight text-zinc-800 dark:text-zinc-300 text-center flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Search size={14} className="stroke-[2.5]" /> CONSULTA CID-10
          </button>
          
          <button 
            type="button"
            onClick={() => { setShowInsulinasGuide(!showInsulinasGuide); setShowCidGuide(false); setShowRevisionQuestions(false); }}
            className="p-4 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-850 rounded-2xl text-xs font-black tracking-tight text-zinc-800 dark:text-zinc-300 text-center flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Droplets size={14} className="stroke-[2.5] text-sky-500" /> TABELA INSULINAS
          </button>

          <button 
            type="button"
            onClick={() => { setShowRevisionQuestions(!showRevisionQuestions); setShowCidGuide(false); setShowInsulinasGuide(false); }}
            className="sm:col-span-2 p-4 bg-blue-50/50 hover:bg-blue-105/50 border border-blue-100 dark:bg-blue-955/20 dark:hover:bg-blue-900/10 dark:border-zinc-800 rounded-2xl text-xs font-black tracking-tight text-blue-700 dark:text-blue-400 text-center flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <HelpCircle size={14} /> 5 Perguntas para Revisão de Tratamento
          </button>
        </div>

        {/* Expanded CID-10 lookup */}
        {showCidGuide && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2l border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-150 dark:border-zinc-800 pb-2">
              <span className="text-[10px] font-black uppercase text-zinc-400 block tracking-wider">Busca de Referências CID-10 Comuns em Geriatria</span>
              <a 
                href="https://cremesp.org.br/?siteAcao=cid10"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] font-black text-blue-600 dark:text-blue-450 hover:underline hover:text-blue-700 uppercase tracking-wider self-start sm:self-auto"
              >
                <ExternalLink size={10} /> Consultar Base Completa CREMESP
              </a>
            </div>
            <input 
              type="text"
              placeholder="Digite código ou diagnóstico (ex: Hipertensão)..."
              value={cidSearchTerm}
              onChange={(e) => setCidSearchTerm(e.target.value)}
              className="w-full px-3.5 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold focus:outline-hidden"
            />
            <div className="max-h-40 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
              {CID10_DATABASE.filter(c => c.code.toLowerCase().includes(cidSearchTerm.toLowerCase()) || c.desc.toLowerCase().includes(cidSearchTerm.toLowerCase())).map((c, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between">
                  <span className="font-extrabold text-blue-600">{c.code}</span>
                  <span className="text-zinc-605 text-right font-medium">{c.desc}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Expanded Insulinas specifications table */}
        {showInsulinasGuide && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2l border border-zinc-200 dark:border-[#202938] space-y-3 overflow-x-auto">
            <span className="text-[10px] font-black uppercase text-sky-500 block">Tipos de Insulina - Ação e Prescrição Geriátrica</span>
            <table className="w-full text-left text-xs divide-y divide-zinc-200 dark:divide-zinc-850">
              <thead>
                <tr className="text-[9px] text-zinc-400 font-extrabold uppercase uppercase">
                  <th className="py-1">Insulina</th>
                  <th className="py-1">Ação</th>
                  <th className="py-1">Início</th>
                  <th className="py-1">Uso / Prescrição</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850 font-semibold">
                <tr>
                  <td className="py-2 text-zinc-800 dark:text-zinc-105 font-bold">Rápida (Regular)</td>
                  <td className="py-2">Curta</td>
                  <td className="py-2">30 min</td>
                  <td className="py-2 text-zinc-500">Focado em picos glicêmicos pré-alimentares.</td>
                </tr>
                <tr>
                  <td className="py-2 text-zinc-800 dark:text-zinc-105 font-bold">NPH (Subcutânea)</td>
                  <td className="py-2">Intermediária</td>
                  <td className="py-2">1 - 2 horas</td>
                  <td className="py-2 text-zinc-500">Cuidado com picos noturnos em idosos (Risco hipoglicemia).</td>
                </tr>
                <tr>
                  <td className="py-2 text-zinc-800 dark:text-zinc-105 font-bold">Glargina</td>
                  <td className="py-2">Longa</td>
                  <td className="py-2">1 - 2 horas</td>
                  <td className="py-2 text-zinc-500">Excelente perfil sem picos (Alta segurança para idoso).</td>
                </tr>
              </tbody>
            </table>
          </motion.div>
        )}

        {/* Expanded Beers Revision Questions */}
        {showRevisionQuestions && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4.5 bg-blue-50/40 dark:bg-blue-955/20 border border-blue-100 dark:border-zinc-800 rounded-2xl text-xs space-y-3">
            <span className="font-extrabold text-blue-700 dark:text-blue-400 block uppercase tracking-wide text-xs">Exame Preventivo de Polifarmácia no Idoso:</span>
            <ol className="list-decimal list-inside space-y-2 text-zinc-650 dark:text-zinc-355 font-bold select-none leading-relaxed">
              <li>O medicamento prescrito possui real e evidente necessidade clínica?</li>
              <li>Existe duplicação terapêutica desnecessária decorrente de múltiplos especialistas?</li>
              <li>O remédio apresenta perigo de induzir quedas, tontura ou depressão gástrica?</li>
              <li>A dosagem se encontra devidamente ajustada para o perfil renal e idade biológica do paciente?</li>
              <li>O cuidador ou paciente idoso demonstrou plena compreensão de como utilizá-lo com segurança?</li>
            </ol>
          </motion.div>
        )}
      </div>

      {/* SECTION 8: RECEITUÁRIO DIGITAL */}
      <div className="bg-white dark:bg-[#1e2736] border border-zinc-150 dark:border-zinc-800 rounded-[2rem] p-6 shadow-sm space-y-5 text-left">
        <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400">
          <Plus size={22} className="stroke-[3]" />
          <h3 className="text-md font-black tracking-tight">8. Receituário Digital</h3>
        </div>

        <form onSubmit={handlePrescribeMedication} className="space-y-4 text-left">
          
          {/* Nome do Medicamento query input */}
          <div className="space-y-1.5 relative">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#00897b] ml-1">Nome do Medicamento</label>
            <input
              type="text"
              required
              value={newMedName}
              onChange={(e) => handleMedNameInput(e.target.value)}
              placeholder="Pesquise ou digite o fármaco..."
              className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
            />
            
            {/* Medication suggestions autocomplete list */}
            {showMedSuggestions && medSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-[102%] bg-white dark:bg-[#202938] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-10 max-h-48 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-850">
                {medSuggestions.map((med, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectMedFromList(med)}
                    className="w-full px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-801 text-left text-xs font-bold text-zinc-700 dark:text-zinc-200"
                  >
                    {med}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dosagem / Posologia row with form controls */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#00897b] ml-1">Dosagem / Posologia</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              
              {/* Type dose text input */}
              <input
                type="text"
                required
                value={newMedDosage}
                onChange={(e) => setNewMedDosage(e.target.value)}
                placeholder="Ex: 50mg"
                className="px-5 py-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
              />

              {/* Quantity select */}
              <select
                value={newMedQty}
                onChange={(e) => setNewMedQty(e.target.value)}
                className="px-5 py-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl text-xs font-semibold focus:outline-hidden cursor-pointer"
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>

              {/* Presentation select */}
              <select
                value={newMedType}
                onChange={(e) => setNewMedType(e.target.value)}
                className="px-5 py-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl text-xs font-semibold focus:outline-hidden cursor-pointer"
              >
                <option value="Comprimidos">Comprimidos</option>
                <option value="Gotas">Gotas</option>
                <option value="ml">ml</option>
                <option value="Cápsulas">Cápsulas</option>
                <option value="Saches">Sachês</option>
                <option value="Frasco">Frasco</option>
              </select>
            </div>
          </div>

          {/* Frequency select */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#00897b] ml-1">Frequência</label>
            <select
              value={newMedFreq}
              onChange={(e) => setNewMedFreq(e.target.value)}
              className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl text-xs font-semibold focus:outline-hidden cursor-pointer"
            >
              <option value="1 vez ao dia">1 vez ao dia</option>
              <option value="2 vezes ao dia (12 em 12h)">2 vezes ao dia (12 em 12h)</option>
              <option value="3 vezes ao dia (8 em 8h)">3 vezes ao dia (8 em 8h)</option>
              <option value="4 vezes ao dia (6 em 6h)">4 vezes ao dia (6 em 6h)</option>
              <option value="Dia sim, dia não">Dia sim, dia não</option>
              <option value="Apenas em jejum">Apenas em jejum</option>
              <option value="Uso necessário esporádico">Uso necessário esporádico (SOS)</option>
            </select>
          </div>

          {/* Hours allocation */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#00897b] ml-1">Horários de Ingestão</label>
            <div className="flex flex-wrap gap-2 items-center p-3.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl">
              {medHours.map((hr) => (
                <span key={hr} className="bg-emerald-50 dark:bg-emerald-950/40 text-[#00897b] text-[11px] font-black px-3 py-1.5 rounded-lg border border-emerald-100 flex items-center gap-1">
                  {hr}
                  <button type="button" onClick={() => handleRemoveHour(hr)} className="text-zinc-400 hover:text-red-500 hover:bg-zinc-100 rounded-sm">
                    <X size={12} className="stroke-[3]" />
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-1.5 ml-auto">
                <input
                  type="time"
                  value={newHourInput}
                  onChange={(e) => setNewHourInput(e.target.value)}
                  className="px-2.5 py-1 text-xs border border-zinc-200 rounded-lg font-bold bg-white dark:bg-zinc-900"
                />
                <button
                  type="button"
                  onClick={handleAddHour}
                  className="p-1 px-2.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 rounded-lg text-xs font-black transition-transform active:scale-95 cursor-pointer"
                >
                  + Add
                </button>
              </div>
            </div>
          </div>

          {/* Modo de jantar option */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#00897b] ml-1">Modo de Tomar / Orientações</label>
            <select
              value={newMedHowToTake}
              onChange={(e) => setNewMedHowToTake(e.target.value)}
              className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl text-xs font-semibold focus:outline-hidden cursor-pointer"
            >
              <option value="Selecione">Selecione</option>
              <option value="Junto com alimentos">Junto com alimentos</option>
              <option value="Em Jejum Completo">Em Jejum Completo</option>
              <option value="30 minutos antes do almoço">30 minutos antes do almoço</option>
              <option value="Antes de deitar">Ao deitar (à noite)</option>
              <option value="Após o café da manhã">Após o café da manhã</option>
            </select>
          </div>

          {/* Indicação clinical code */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#00897b] ml-1">Indicação (Opcional)</label>
            <input
              type="text"
              value={newMedIndication}
              onChange={(e) => setNewMedIndication(e.target.value)}
              placeholder="Ex: Controle da pressão"
              className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          {/* Duração do tratamento */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#00897b] ml-1 block font-bold">Duração do tratamento</label>
            <div className="flex flex-col sm:flex-row gap-5.5 pl-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  name="duration"
                  value="continuo"
                  checked={newMedDurationType === 'continuo'}
                  onChange={() => setNewMedDurationType('continuo')}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-zinc-300"
                />
                <span className="text-xs text-zinc-600 dark:text-zinc-300 font-bold">Uso contínuo</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  name="duration"
                  value="terminar"
                  checked={newMedDurationType === 'terminar'}
                  onChange={() => setNewMedDurationType('terminar')}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-zinc-300"
                />
                <span className="text-xs text-zinc-600 dark:text-zinc-300 font-bold">Definir data de término</span>
              </label>
            </div>

            {newMedDurationType === 'terminar' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-2">
                <input
                  type="date"
                  value={newMedEndDate}
                  onChange={(e) => setNewMedEndDate(e.target.value)}
                  className="px-4 py-3 border border-zinc-200 dark:border-zinc-850 rounded-2xl bg-zinc-50 dark:bg-zinc-900 text-xs font-semibold"
                />
              </motion.div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-md transition-transform active:scale-95 text-center flex items-center justify-center gap-1.5 cursor-pointer mt-4"
          >
            + ADICIONAR À LISTA
          </button>
        </form>

        {/* ACTIVE RECIPE LIST */}
        <div className="pt-6 border-t border-zinc-150 dark:border-zinc-800 space-y-4">
          <h4 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Medicamentos Adicionados à Receita Ativa:</h4>
          
          {localPrescribedMeds.length === 0 ? (
            <div className="text-center py-8 bg-zinc-50 dark:bg-[#1a2230] rounded-2.5xl text-zinc-400 text-xs font-bold leading-normal">
              Nenhum medicamento prescrito nesta consulta.
            </div>
          ) : (
            <div className="space-y-3">
              {localPrescribedMeds.map((med) => (
                <div key={med.id} className="p-4 bg-zinc-50 dark:bg-[#1a2230] border border-zinc-150 dark:border-zinc-800 rounded-2.5xl flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <Pill size={14} className="text-[#00897b]" /> {med.name} - {med.dosage}
                    </span>
                    <span className="text-zinc-500 dark:text-zinc-450 block font-semibold">
                      Frequência: {med.frequency} • Horários: {med.times?.join(', ') || med.time}
                    </span>
                    {med.instructions && (
                      <span className="text-emerald-700 dark:text-emerald-400 block font-bold">
                        Como tomar: {med.instructions}
                      </span>
                    )}
                    {med.indication && (
                      <span className="text-zinc-400 block font-semibold">
                        Indicação: {med.indication}
                      </span>
                    )}
                    <span className="text-[10px] bg-zinc-200 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-350 px-2 py-0.5 rounded-md font-black uppercase tracking-wider block w-fit">
                      {med.endDate ? `Término em: ${med.endDate}` : 'Uso contínuo'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveMedication(med.id, med.name)}
                    className="p-2 text-zinc-400 hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* GENERATE RECEPT BUTTON ACTION */}
          <div className="pt-4">
            <button
              onClick={handleGenerateShareableLink}
              className="w-full py-4 bg-[#00897b] hover:bg-[#00796b] text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg transition-transform active:scale-95 text-center flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Share2 size={14} /> GERAR E ENVIAR RECEITA COMPARTILHADA
            </button>
            <span className="text-[10px] text-zinc-400 font-bold block text-center uppercase tracking-wider mt-2">
              Salva o prontuário e gera o link final do paciente para ser enviado via SMS ou WhatsApp.
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 9: FECHAMENTO E COMPARTILHAMENTO */}
      <AnimatePresence>
        {generatedShareUrl && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="bg-[#0d1625] text-white border border-zinc-800 rounded-[2rem] p-6 md:p-8 shadow-2xl space-y-6 text-left mt-6"
          >
            <div className="flex items-center gap-2.5 text-emerald-400">
              <Share2 size={22} className="stroke-[3]" />
              <h3 className="text-md font-black tracking-tight uppercase">9. Fechamento e Compartilhamento</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block font-bold">LINK DA RECEITA:</span>
                <div className="p-4 bg-zinc-900 border border-zinc-805 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 font-mono">
                  <span className="text-xs text-zinc-100 break-all select-all pr-2 truncate">
                    {`https://crossmeds.com.br/share/prescription/${generatedShareUrl.split('consultaId=')[1] || 't23jU8ybZQQ0JZvtiX2m'}`}
                  </span>
                  <button
                    onClick={copyToClipboard}
                    className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Copy size={12} /> COPIAR
                  </button>
                </div>
              </div>

              {/* QR Code Container and label */}
              <div className="flex flex-col items-center justify-center py-4 bg-zinc-900 border border-zinc-805 rounded-[2rem] max-w-sm mx-auto space-y-3.5">
                <div className="bg-white p-3.5 rounded-2xl shadow-inner border border-zinc-150">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(generatedShareUrl)}`}
                    alt="QR Code Receituário"
                    className="w-40 h-40 object-contain select-none"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 font-bold block text-center">QR CODE DE ACESSO</span>
              </div>

              {/* Share Channels */}
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Aqui está o link do seu Receituário Digital do CrossMeds: ${generatedShareUrl}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-3.5 px-5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-black text-xs uppercase tracking-widest rounded-2xl text-center flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer font-bold"
                >
                  <MessageSquare size={14} className="stroke-[3]" /> WHATSAPP
                </a>

                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(generatedShareUrl)}&text=${encodeURIComponent('Seu Receituário Digital do CrossMeds')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-3.5 px-5 bg-[#1d90f4] hover:bg-[#1281e2] text-white font-black text-xs uppercase tracking-widest rounded-2xl text-center flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer font-bold"
                >
                  <Send size={14} className="stroke-[3]" /> TELEGRAM
                </a>

                <a
                  href={`mailto:?subject=${encodeURIComponent('Seu Receituário Digital - CrossMeds')}&body=${encodeURIComponent(`Olá,\nAqui está o link para acessar o seu Receituário Digital CrossMeds:\n\n${generatedShareUrl}\n\nAtenciosamente,\nDr(a). ${docName}`)}`}
                  className="py-3.5 px-5 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-black text-xs uppercase tracking-widest rounded-2xl text-center flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer font-bold"
                >
                  <Mail size={14} /> E-MAIL
                </a>

                <button
                  onClick={() => {
                    const printWindow = window.open(generatedShareUrl, '_blank');
                    if (printWindow) {
                      setTimeout(() => {
                        printWindow.print();
                      }, 1000);
                    }
                  }}
                  className="py-3.5 px-5 bg-[#ef4444] hover:bg-[#dc2626] text-white font-black text-xs uppercase tracking-widest rounded-2xl text-center flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer font-bold"
                >
                  <FileText size={14} /> PDF
                </button>
              </div>

              {/* Imprimir Receita big button */}
              <button
                onClick={() => {
                  const printWindow = window.open(generatedShareUrl, '_blank');
                  if (printWindow) {
                    setTimeout(() => {
                      printWindow.print();
                    }, 1000);
                  }
                }}
                className="w-full py-4 bg-[#212e3e] hover:bg-[#1a2635] border border-zinc-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-md transition-transform active:scale-95 text-center flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer size={15} /> IMPRIMIR RECEITA
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RECEPT SHARE MODAL */}
      <AnimatePresence>
        {shareReceiptModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-left">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#1a2230] rounded-[2.5rem] border border-zinc-150 dark:border-zinc-800 p-6 md:p-8 max-w-lg w-full space-y-6 shadow-2xl relative"
            >
              <button 
                onClick={() => setShareReceiptModal(false)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="space-y-2 text-center sm:text-left">
                <span className="p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl inline-block">
                  <Check size={26} className="stroke-[3]" />
                </span>
                <h3 className="text-lg font-black tracking-tight leading-none mt-2">Receita Digital Gerada com Sucesso!</h3>
                <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
                  Os dados do prontuário do paciente {nomeCompleto} foram salvos com segurança. Envie o link abaixo para o paciente visualizar em seu celular.
                </p>
              </div>

              {/* Shared Link container input */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase text-[#00897b] tracking-wider ml-1">Link de Acesso do Cidadão</span>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl flex items-center justify-between gap-2.5">
                  <span className="text-[11px] font-semibold text-zinc-500 truncate">{generatedShareUrl}</span>
                  <button 
                    onClick={copyToClipboard}
                    className="p-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Copy size={11} /> Copiar
                  </button>
                </div>
              </div>

              {/* PDF mockup style receipt summary preview */}
              <div className="p-5 border border-zinc-150 rounded-3xl bg-zinc-50/50 dark:bg-zinc-900 space-y-3.5 text-xs">
                <div className="flex justify-between items-start border-b border-zinc-200/55 pb-2.5">
                  <div>
                    <span className="font-extrabold text-zinc-909 block">{docName}</span>
                    <span className="text-[9px] text-[#00897b] font-black uppercase tracking-wider block">{docCRM}</span>
                  </div>
                  <span className="text-xs text-zinc-400 font-bold">{consultationDate}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest block">Paciente</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-100">{nomeCompleto} ({idade} anos)</span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest block">Prescrições</span>
                  <div className="space-y-1">
                    {localPrescribedMeds.map((m, i) => (
                      <div key={i} className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                        • <strong>{m.name} ({m.dosage})</strong> - {m.frequency} às {m.times?.join(', ') || m.time}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FOOTER SUS CLÍNICO */}
      <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-400 dark:text-zinc-500 text-center uppercase tracking-widest font-black leading-relaxed max-w-xl mx-auto">
        Prontuário SUS Integrado • Prescrições Digitais Seguras • CrossMeds 2026/2027
      </div>
    </div>
  );
};
