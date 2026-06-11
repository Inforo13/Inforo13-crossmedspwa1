import React, { useState } from 'react';
import { HealthLog } from '../types';
import { motion } from 'motion/react';
import { Smile, Meh, Frown, Plus, Calendar, Activity, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  logs: HealthLog[];
  onAddLog: (mood: HealthLog['mood'], symptoms: string[], notes: string) => void;
}

export const HealthTab: React.FC<Props> = ({ logs, onAddLog }) => {
  const [isLogging, setIsLogging] = useState(false);
  const [mood, setMood] = useState<HealthLog['mood']>('good');
  const [symptoms, setSymptoms] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddLog(mood, symptoms.split(',').map(s => s.trim()).filter(Boolean), notes);
    setIsLogging(false);
    setMood('good');
    setSymptoms('');
    setNotes('');
  };

  const moodIcons = {
    great: <Smile className="text-emerald-500" size={32} />,
    good: <Smile className="text-emerald-400" size={32} />,
    okay: <Meh className="text-amber-400" size={32} />,
    bad: <Frown className="text-orange-400" size={32} />,
    terrible: <Frown className="text-red-500" size={32} />,
  };

  const moodLabels = {
    great: 'Excelente',
    good: 'Bem',
    okay: 'Ok',
    bad: 'Mal',
    terrible: 'Péssimo',
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Acompanhamento de Saúde</h1>
          <p className="text-zinc-500 font-medium">Registre seu bem-estar diário e acompanhe seus sintomas.</p>
        </div>
        <button
          onClick={() => setIsLogging(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-95"
        >
          <Plus size={20} />
          Registrar Bem-Estar
        </button>
      </header>

      {isLogging && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-xl space-y-6"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-zinc-900">Como você está se sentindo hoje?</h2>
            <button onClick={() => setIsLogging(false)} className="text-zinc-400 hover:text-zinc-600 font-bold">Cancelar</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between gap-2">
              {(Object.keys(moodIcons) as HealthLog['mood'][]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood(m)}
                  className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                    mood === m ? 'border-emerald-500 bg-emerald-50' : 'border-zinc-100 hover:border-zinc-200'
                  }`}
                >
                  {moodIcons[m]}
                  <span className="text-[10px] font-black uppercase tracking-tighter text-zinc-600">{moodLabels[m]}</span>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-800 ml-1">Sintomas (separados por vírgula)</label>
              <input
                type="text"
                placeholder="Ex: Dor de cabeça, Cansaço, Náusea"
                className="w-full px-5 py-4 bg-zinc-50 border-2 border-zinc-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none font-medium"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-800 ml-1">Notas Adicionais</label>
              <textarea
                placeholder="Qualquer outro detalhe sobre o seu dia..."
                className="w-full px-5 py-4 bg-zinc-50 border-2 border-zinc-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none h-32 resize-none font-medium"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-xl shadow-emerald-100 transition-all active:scale-95"
            >
              Salvar Registro de Bem-Estar
            </button>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {logs.length > 0 ? (
          logs.map((log) => (
            <div key={log.id} className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm flex flex-col md:flex-row gap-6">
              <div className="flex items-center gap-4 md:w-48 shrink-0">
                <div className="p-3 bg-zinc-50 rounded-2xl">
                  {moodIcons[log.mood]}
                </div>
                <div>
                  <p className="font-black text-zinc-900 uppercase tracking-tighter">{moodLabels[log.mood]}</p>
                  <p className="text-xs text-zinc-500 font-bold">{format(new Date(log.createdAt), 'd MMM, yyyy')}</p>
                </div>
              </div>

              <div className="flex-1 space-y-3">
                {log.symptoms.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {log.symptoms.map((s, i) => (
                      <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                {log.notes && (
                  <div className="flex gap-2 text-zinc-600">
                    <MessageSquare size={16} className="text-zinc-400 shrink-0 mt-1" />
                    <p className="text-sm italic font-medium">{log.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-zinc-100/50 border-2 border-dashed border-zinc-200 p-16 rounded-[3rem] text-center">
            <Activity size={48} className="text-zinc-300 mx-auto mb-4" />
            <h3 className="text-xl font-black text-zinc-900">Nenhum registro ainda</h3>
            <p className="text-zinc-500 font-medium mt-2">Comece a registrar seu bem-estar para ver tendências ao longo do tempo.</p>
          </div>
        )}
      </div>
    </div>
  );
};
