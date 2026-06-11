import React from 'react';
import { Medication } from '../types';
import { Pill, Clock, Calendar, AlertCircle, Trash2, Edit2, Activity, ShieldAlert, CheckCircle2, Info } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  medication: Medication;
  onEdit: (med: Medication) => void;
  onDelete: (id: string) => void;
  onToggleActive: (med: Medication) => void;
  onMarkTaken: (med: Medication) => void;
  isConflict?: boolean;
  conflictSeverity?: 'high' | 'moderate' | 'low';
}

export const MedicationCard: React.FC<Props> = ({ 
  medication, 
  onEdit, 
  onDelete, 
  onToggleActive, 
  onMarkTaken, 
  isConflict,
  conflictSeverity 
}) => {
  // Determine severity visual cues (border left thick band & background tint)
  let severityBorderClass = 'border-l-0';
  let severityIndicatorBadge = null;
  
  if (isConflict) {
    if (conflictSeverity === 'high') {
      severityBorderClass = 'border-l-[10px] border-l-red-650';
      severityIndicatorBadge = (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-700 animate-pulse border border-red-200">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
          VERMELHO - GRAVE
        </span>
      );
    } else if (conflictSeverity === 'moderate') {
      severityBorderClass = 'border-l-[10px] border-l-orange-500';
      severityIndicatorBadge = (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-700 animate-pulse border border-orange-200">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
          LARANJA - MODERADA
        </span>
      );
    } else {
      // low or undefined defaults to green / em monitoramento
      severityBorderClass = 'border-l-[10px] border-l-emerald-500';
      severityIndicatorBadge = (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 animate-pulse border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
          VERDE - EM MONITORAMENTO
        </span>
      );
    }
  }

  return (
    <div className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden ${severityBorderClass} ${
      medication.active 
        ? 'bg-white border-zinc-200 shadow-sm hover:shadow-md' 
        : 'bg-zinc-50 border-zinc-100 opacity-75'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${medication.active ? 'bg-emerald-100 text-emerald-600' : 'bg-zinc-200 text-zinc-500'}`}>
            <Pill size={20} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
              <h3 className="font-semibold text-zinc-900 leading-tight">{medication.name}</h3>
              {severityIndicatorBadge}
            </div>
            <p className="text-sm text-zinc-500">{medication.dosage} • {medication.type}</p>
            {medication.isCompounded && medication.components && medication.components.length > 0 && (
              <div className="mt-2 text-xs bg-[#eefcf8] dark:bg-zinc-800/40 border border-[#a7f3d0]/30 dark:border-zinc-700/60 rounded-xl p-2.5 text-zinc-700 dark:text-zinc-200">
                <span className="font-extrabold text-[#0fb383] block mb-1 uppercase tracking-wider text-[10px]">🧪 Componentes da Fórmula:</span>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {medication.components.map((comp, idx) => (
                    <span key={idx} className="inline-flex bg-white dark:bg-zinc-800/80 shadow-3xs border border-zinc-150 dark:border-zinc-700/60 rounded-lg px-2 py-0.5 font-bold">
                      {comp.name} <span className="text-zinc-400 dark:text-zinc-500 ml-1">({comp.dosage})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-1 items-center">
          {isConflict && (
            <div className="p-2 text-rose-600 bg-rose-50 rounded-lg animate-pulse" title="Interação Potencial Detectada">
              <ShieldAlert size={16} />
            </div>
          )}
          {medication.active && (
            <button 
              onClick={() => onMarkTaken(medication)}
              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              title="Marcar como Tomado"
            >
              <CheckCircle2 size={16} />
            </button>
          )}
          <button 
            onClick={() => onEdit(medication)}
            className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => onDelete(medication.id)}
            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-2.5 mb-5">
        <div className="flex items-center gap-2 text-sm text-zinc-600">
          <Clock size={14} className="text-zinc-400" />
          <span>{medication.times?.join(', ') || medication.time} • {medication.frequency}</span>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Activity size={12} className="text-zinc-400" />
          <span>Via: {medication.route}</span>
        </div>

        {medication.stock !== undefined && (
          <div className={`flex items-center gap-2 text-xs font-bold px-2 py-1 rounded-lg w-fit ${
            medication.stock <= (medication.refillThreshold || 0) 
              ? 'bg-rose-50 text-rose-600' 
              : 'bg-zinc-100 text-zinc-600'
          }`}>
            <AlertCircle size={12} />
            <span>Estoque: {medication.stock} unidades</span>
          </div>
        )}

        {medication.lastTaken && (
          <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg w-fit">
            <Activity size={12} />
            <span>Última dose: {format(new Date(medication.lastTaken), 'd MMM, HH:mm')}</span>
          </div>
        )}
        {medication.howToTake && medication.howToTake !== 'Selecione' && (
          <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 text-xs font-semibold">
            <Info size={14} className="text-sky-500 shrink-0" />
            <span>Como tomar: {medication.howToTake}</span>
          </div>
        )}
        {medication.instructions && (
          <div className="flex items-start gap-2 text-sm text-zinc-600">
            <AlertCircle size={14} className="text-zinc-400 mt-0.5" />
            <span className="italic">{medication.instructions}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium uppercase tracking-wider">
          <Calendar size={12} />
          <span>Início: {format(new Date(medication.startDate), 'd MMM, yyyy')}</span>
        </div>
        <button
          onClick={() => onToggleActive(medication)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            medication.active 
              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
              : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'
          }`}
        >
          {medication.active ? 'Ativo' : 'Pausado'}
        </button>
      </div>
    </div>
  );
};
