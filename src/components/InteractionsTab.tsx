import React from 'react';
import { MedicationInteraction } from '../types';
import { ShieldAlert, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  interactions: MedicationInteraction[];
}

export const InteractionsTab: React.FC<Props> = ({ interactions }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-rose-50 border-rose-200 text-rose-700';
      case 'moderate': return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'low': return 'bg-blue-50 border-blue-200 text-blue-700';
      default: return 'bg-zinc-50 border-zinc-200 text-zinc-700';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <ShieldAlert size={20} className="text-rose-600" />;
      case 'moderate': return <AlertTriangle size={20} className="text-amber-600" />;
      case 'low': return <Info size={20} className="text-blue-600" />;
      default: return <Info size={20} className="text-zinc-600" />;
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'high': return 'Alta';
      case 'moderate': return 'Moderada';
      case 'low': return 'Baixa';
      default: return 'Desconhecida';
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Interações Medicamentosas</h1>
        <p className="text-zinc-500 font-medium">Verificação de segurança para potenciais conflitos entre seus medicamentos ativos.</p>
      </header>

      {interactions.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {interactions.map((interaction, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 rounded-3xl border ${getSeverityColor(interaction.severity)} shadow-sm space-y-4`}
            >
              <div className="flex items-center gap-3">
                {getSeverityIcon(interaction.severity)}
                <h3 className="font-bold text-lg uppercase tracking-tight">
                  Interação de Gravidade {getSeverityLabel(interaction.severity)}
                </h3>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-bold opacity-80">Medicamentos envolvidos:</p>
                <div className="flex flex-wrap gap-2">
                  {interaction.medicationNames.map((name, i) => (
                    <span key={i} className="px-3 py-1 bg-white/50 rounded-full text-xs font-bold border border-current/20">
                      {name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <p className="font-bold">Descrição</p>
                <p className="text-sm leading-relaxed opacity-90">{interaction.description}</p>
              </div>

              <div className="p-4 bg-white/40 rounded-2xl border border-current/10">
                <p className="font-bold text-sm mb-1">Recomendação</p>
                <p className="text-sm italic opacity-90">{interaction.recommendation}</p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-zinc-200 p-16 rounded-[3rem] text-center space-y-4">
          <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
          <div className="max-w-xs mx-auto">
            <h3 className="text-xl font-bold text-zinc-900">Tudo Limpo!</h3>
            <p className="text-zinc-500 mt-2">Nenhuma interação significativa foi detectada entre seus medicamentos ativos.</p>
          </div>
        </div>
      )}

      <div className="p-6 bg-zinc-900 rounded-3xl text-white space-y-2">
        <div className="flex items-center gap-2 text-amber-400">
          <AlertTriangle size={18} />
          <p className="font-bold text-sm uppercase tracking-wider">Aviso Médico</p>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Este verificador de interações é alimentado por IA e serve apenas para fins informativos. Não substitui o conselho médico profissional, diagnóstico ou tratamento. Sempre procure o conselho de seu médico ou outro profissional de saúde qualificado com qualquer dúvida que possa ter sobre uma condição médica ou interações medicamentosas.
        </p>
      </div>
    </div>
  );
};
