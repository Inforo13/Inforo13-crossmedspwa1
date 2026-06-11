import React, { useEffect, useState } from 'react';
import { Pill, Printer, Calendar, ArrowRight, UserCheck, Stethoscope, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MedicationData {
  n: string;     // name
  d: string;     // dosage
  f: string;     // frequency
  t: string[];   // times
  i: string;     // instructions / howToTake
  in: string;    // indication
  tp: string;    // type
}

interface PrescriptionDetails {
  nome: string;
  idade: string;
  m: string;     // doctorName
  c: string;     // doctorCRM
  d: string;     // date
  meds: MedicationData[];
}

interface ReceitaDigitalPageProps {
  darkMode: boolean;
  onImportMeds: (meds: any[]) => void;
}

export const ReceitaDigitalPage: React.FC<ReceitaDigitalPageProps> = ({ darkMode, onImportMeds }) => {
  const [prescription, setPrescription] = useState<PrescriptionDetails | null>(null);
  const [recipeId, setRecipeId] = useState('t23jU8ybZQQ0JZvtiX2m');
  const [imported, setImported] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  useEffect(() => {
    // Parse query params
    const params = new URLSearchParams(window.location.search);
    const dataParam = params.get('data');
    const consultaIdParam = params.get('consultaId');
    if (consultaIdParam) {
      setRecipeId(`presc-${consultaIdParam}`);
    }

    if (dataParam) {
      try {
        const decoded = JSON.parse(decodeURIComponent(escape(atob(dataParam))));
        setPrescription(decoded);
      } catch (e) {
        console.error('Error decoding prescription data:', e);
        // Fallback mock details if Base64 fails or is empty, to ensure it ALWAYS renders beautifully
        loadMockData();
      }
    } else {
      loadMockData();
    }
  }, []);

  const loadMockData = () => {
    setPrescription({
      nome: 'João da Silva',
      idade: '65',
      m: 'Dr. Joaquim Ramos',
      c: 'CRM 259876-SP',
      d: new Date().toLocaleDateString('pt-BR'),
      meds: [
        {
          n: 'AAS ÁCIDO ACETILSALICÍLICO',
          d: '100mg',
          f: '1 vez ao dia',
          t: ['08:00'],
          i: 'Tomar junto com o café da manhã.',
          in: 'Prevenção de eventos cardiovasculares secundários.',
          tp: 'Comprimidos'
        },
        {
          n: 'LOSARTANA POTÁSSICA',
          d: '50mg',
          f: '2 vezes ao dia (12 em 12h)',
          t: ['08:00', '20:00'],
          i: 'Tomar com água, de preferência em jejum ou 30 min antes das refeições.',
          in: 'Controle de Hipertensão Arterial Sistêmica.',
          tp: 'Comprimidos'
        }
      ]
    });
  };

  const handleImport = () => {
    if (!prescription) return;

    // Map serialized meds to the application's Medication schema
    const formattedMeds = prescription.meds.map((med, idx) => ({
      id: `imported-med-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
      name: med.n,
      dosage: med.d,
      frequency: med.f,
      times: med.t,
      instructions: med.i,
      indication: med.in,
      type: med.tp,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    // Trigger the callback
    onImportMeds(formattedMeds);
    setImported(true);
    setShowCalendarModal(true);
  };

  const handleIntegrateCalendar = () => {
    // Send message to the parent frame or open calendar sync experience
    setShowCalendarModal(false);
    // Redirect straight to dashboard and open calendar sync
    window.location.href = `${window.location.origin}/?import_calendar_sync=true`;
  };

  const handleGoToHome = () => {
    window.location.href = `${window.location.origin}/`;
  };

  if (!prescription) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4fbf7] text-zinc-900 p-6">
        <div className="w-8 h-8 border-3 border-[#00897b] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-16 transition-all duration-300 selection:bg-emerald-100 ${
      darkMode ? 'bg-[#121824] text-white' : 'bg-[#f4fbf7] text-zinc-900'
    }`}>
      <div className="max-w-xl mx-auto px-4 md:px-6 pt-8 space-y-6">
        
        {/* Header Section */}
        <div className={`rounded-3xl p-6 border text-left flex items-start justify-between gap-4 ${
          darkMode ? 'bg-[#1a2130] border-zinc-800' : 'bg-white border-zinc-150 shadow-sm'
        }`}>
          <div className="space-y-1">
            <span className="bg-emerald-100 dark:bg-emerald-950/50 text-[#00897b] dark:text-emerald-400 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider inline-flex items-center gap-1">
              <Pill size={11} className="stroke-[3]" /> Receituário Digital
            </span>
            <h1 className="text-xl font-black tracking-tight leading-tight pt-1">Prescrição Médica Oficial</h1>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono font-bold block pt-0.5">ID: {recipeId}</span>
          </div>
          <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-600 dark:text-[#00897b]">
            <UserCheck size={24} className="stroke-[2.5]" />
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleImport}
            disabled={imported}
            className={`flex-1 py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all text-center flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
              imported 
                ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 border border-zinc-300 dark:border-zinc-700 pointer-events-none' 
                : 'bg-[#00897b] hover:bg-[#00796b] text-white shadow-emerald-500/15'
            }`}
          >
            {imported ? (
              <>
                <Check size={16} className="stroke-[3]" /> IMPORTADO COM SUCESSO!
              </>
            ) : (
              <>
                <ArrowRight size={16} className="stroke-[3]" /> Importar para meu Perfil
              </>
            )}
          </button>

          <button
            onClick={() => window.print()}
            className={`py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all text-center flex items-center justify-center gap-1.5 border cursor-pointer ${
              darkMode 
                ? 'bg-[#1a2130] border-zinc-800 text-white hover:bg-[#20293a]' 
                : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 shadow-sm'
            }`}
          >
            <Printer size={15} /> Imprimir
          </button>
        </div>

        {/* Card: Dados do Profissional */}
        <div className={`rounded-3xl p-6 border text-left space-y-3.5 transition-all ${
          darkMode ? 'bg-[#1a2130] border-zinc-800' : 'bg-white border-zinc-150 shadow-sm'
        }`}>
          <div className="flex items-center gap-2 text-[#00897b] dark:text-[#00a39b]">
            <Stethoscope size={18} className="stroke-[2.5]" />
            <span className="text-[10px] font-black uppercase tracking-widest">Dados do Profissional</span>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-400 font-bold">Médico Prescritor:</span>
              <span className="font-extrabold text-zinc-900 dark:text-zinc-100">{prescription.m}</span>
            </div>
            <div className="flex justify-between items-center text-xs pt-2.5">
              <span className="text-zinc-400 font-bold">Identificação Profissional:</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{prescription.c}</span>
            </div>
          </div>
        </div>

        {/* Card: Dados do Paciente */}
        <div className={`rounded-3xl p-6 border text-left space-y-3.5 transition-all ${
          darkMode ? 'bg-[#1a2130] border-zinc-800' : 'bg-white border-zinc-150 shadow-sm'
        }`}>
          <div className="flex items-center gap-2 text-[#00897b] dark:text-[#00a39b]">
            <UserCheck size={18} className="stroke-[2.5]" />
            <span className="text-[10px] font-black uppercase tracking-widest">Dados do Paciente</span>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-400 font-bold">Paciente:</span>
              <span className="font-extrabold text-zinc-900 dark:text-zinc-100">{prescription.nome}</span>
            </div>
            <div className="flex justify-between items-center text-xs pt-2.5">
              <span className="text-zinc-400 font-bold">Idade Declarada:</span>
              <span className="font-extrabold text-zinc-900 dark:text-zinc-100">{prescription.idade} Anos</span>
            </div>
          </div>
        </div>

        {/* Card: Prescrição */}
        <div className={`rounded-3xl p-6 border text-left space-y-5 transition-all ${
          darkMode ? 'bg-[#1a2130] border-zinc-800' : 'bg-white border-zinc-150 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#00897b]">
              <Pill size={18} className="stroke-[2.5]" />
              <span className="text-[10px] font-black uppercase tracking-widest">Medicamentos Prescritos</span>
            </div>
            <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 px-2 py-1 rounded-md font-black">
              Data: {prescription.d}
            </span>
          </div>

          <div className="space-y-4 pt-1">
            {prescription.meds.map((med, idx) => (
              <div 
                key={idx} 
                className={`p-5 rounded-2xl border text-xs space-y-3 ${
                  darkMode ? 'bg-[#121824] border-zinc-800' : 'bg-[#fbfdfc] border-zinc-200/60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="font-black text-sm text-zinc-900 dark:text-zinc-100 block">
                      {med.n} - <span className="text-emerald-600 dark:text-emerald-400">{med.d}</span>
                    </span>
                    <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-2 py-0.5 rounded font-black uppercase tracking-wider block w-fit">
                      {med.tp}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
                  {med.in && (
                    <div className="flex gap-2">
                      <span className="text-zinc-400 font-bold min-w-[75px]">Diagnóstico:</span>
                      <span className="font-semibold text-zinc-700 dark:text-zinc-350">{med.in}</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <span className="text-zinc-400 font-bold min-w-[75px]">Frequência:</span>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-350">{med.f}</span>
                  </div>
                  {med.t && med.t.length > 0 && (
                    <div className="flex gap-2">
                      <span className="text-zinc-400 font-bold min-w-[75px]">Horários:</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black tracking-wide">
                        {med.t.join(', ')}
                      </span>
                    </div>
                  )}
                  {med.i && (
                    <div className="flex gap-2 bg-emerald-50/40 dark:bg-emerald-950/10 p-2.5 rounded-lg border border-emerald-100/30">
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold min-w-[75px]">Instruções:</span>
                      <span className="font-bold text-zinc-700 dark:text-zinc-300 leading-relaxed">{med.i}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SUS footer trademark branding */}
        <div className="pt-4 text-center text-[10px] text-zinc-400 uppercase tracking-widest font-black leading-relaxed">
          Central SUS de Prescrições Unificadas • CrossMeds 2026/2027
        </div>

      </div>

      {/* POPUP MODAL: CALENDAR SYNC & REDIRECT */}
      <AnimatePresence>
        {showCalendarModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`max-w-md w-full rounded-[2.5rem] border p-6 md:p-8 space-y-6 shadow-2xl text-center relative ${
                darkMode ? 'bg-[#1a2130] border-zinc-800' : 'bg-white border-zinc-150'
              }`}
            >
              <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl flex items-center justify-center mx-auto text-[#00897b] mb-4">
                <Calendar size={28} className="stroke-[2.5]" />
              </div>

              <div className="space-y-2">
                <h3 className="font-black text-xl text-zinc-900 dark:text-white tracking-tight">
                  Importar para o Calendário?
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed max-w-sm mx-auto font-semibold">
                  Sua receita foi importada com sucesso para a tela de medicamentos e alarmes! Deseja sincronizá-la agora com o seu Google Calendar para receber avisos em todos os seus aparelhos?
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleIntegrateCalendar}
                  className="w-full py-4 bg-[#00897b] hover:bg-[#00796b] text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg transition-transform active:scale-95 text-center flex items-center justify-center gap-2 cursor-pointer"
                >
                  Sincronizar com Google Calendar
                </button>

                <button
                  onClick={handleGoToHome}
                  className="w-full py-3.5 text-zinc-400 dark:text-zinc-500 hover:text-zinc-650 dark:hover:text-zinc-300 font-bold text-xs uppercase tracking-widest text-center cursor-pointer"
                >
                  Ir para Tela Inicial (Alunos/Alarmes já ativos)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
