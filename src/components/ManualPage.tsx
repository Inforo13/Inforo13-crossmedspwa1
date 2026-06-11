import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Pill, 
  Bell, 
  AlertTriangle, 
  FileText, 
  MessageSquare, 
  Activity, 
  Stethoscope, 
  FileCheck
} from 'lucide-react';

interface Props {
  darkMode: boolean;
  onBack: () => void;
}

interface ManualSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: string;
}

export const ManualPage: React.FC<Props> = ({ darkMode, onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>('gerenciar');

  const sections: ManualSection[] = [
    {
      id: 'gerenciar',
      title: 'Gerenciar Medicamentos',
      icon: <Pill size={16} className="text-emerald-500 shrink-0" />,
      content: 'Para adicionar um novo medicamento, vá para a tela inicial e toque em "Adicionar Medicamento". Preencha as informações como nome, dosagem e horários. Você pode editar ou remover um medicamento a qualquer momento na lista "Meus Medicamentos" na tela inicial.'
    },
    {
      id: 'lembretes',
      title: 'Configurar Lembretes',
      icon: <Bell size={16} className="text-emerald-500 shrink-0" />,
      content: 'Ao cadastrar ou editar um medicamento, você pode adicionar horários específicos. O aplicativo irá gerar notificações para te lembrar. Para garantir que os lembretes funcionem mesmo com o app fechado, use a função "Exportar para o calendário do celular" na tela inicial.'
    },
    {
      id: 'interacoes',
      title: 'Verificar Interações',
      icon: <AlertTriangle size={16} className="text-emerald-500 shrink-0" />,
      content: 'Na tela inicial, toque no botão "Interações". O aplicativo analisará automaticamente todos os seus medicamentos cadastrados e mostrará possíveis interações perigosas entre eles, classificadas por gravidade.'
    },
    {
      id: 'exames',
      title: 'Analisar Exames com IA',
      icon: <FileText size={16} className="text-emerald-500 shrink-0" />,
      content: 'Acesse "Analisar Exames" na tela inicial. Você pode tirar uma foto do seu laudo ou selecionar um arquivo (PDF/imagem). A Inteligência Artificial irá extrair e explicar os principais resultados de forma simplificada. Lembre-se, isso não substitui a consulta médica.'
    },
    {
      id: 'chat',
      title: 'Chat com a IA',
      icon: <MessageSquare size={16} className="text-emerald-500 shrink-0" />,
      content: 'Tem alguma dúvida sobre saúde, doenças ou medicamentos? Use o "Chat com IA". Faça sua pergunta em linguagem natural e receba uma resposta informativa. Esta funcionalidade é para informação e não para diagnóstico.'
    },
    {
      id: 'sinais',
      title: 'Acompanhamento e Sinais Vitais',
      icon: <Activity size={16} className="text-emerald-500 shrink-0" />,
      content: 'Use as seções "Acompanhamento" e "Sinais Vitais" para registrar medições como pressão arterial, glicemia, temperatura, etc. Manter esses registros ajuda você e seu médico a acompanharem sua saúde de perto.'
    },
    {
      id: 'portal',
      title: 'Portal Médico',
      icon: <Stethoscope size={16} className="text-emerald-500 shrink-0" />,
      content: 'Profissionais de saúde podem usar o "Portal Médico" para criar prescrições. Após preencher os dados do paciente e adicionar os medicamentos, é possível gerar um link compartilhável, QR Code ou imprimir um PDF para entregar ao paciente.'
    },
    {
      id: 'relatorio',
      title: 'Relatório de Saúde',
      icon: <FileCheck size={16} className="text-emerald-500 shrink-0" />,
      content: 'O "Relatório" compila todas as suas informações: dados pessoais, clínicos, medicamentos e registros de acompanhamento em um só lugar. Você pode exportá-lo como PDF, compartilhar via WhatsApp ou gerar um QR Code de emergência.'
    }
  ];

  const toggleSection = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const filteredSections = sections.filter(
    section =>
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pt-2 pb-14 px-1 select-none" id="manual-usuario-page">
      {/* Header and Back Navigation */}
      <div className="flex justify-between items-center bg-transparent gap-4 mb-2">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className={`p-3.5 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-sm ${
              darkMode ? 'bg-[#242b38] hover:bg-[#2c3547] text-zinc-300 border border-zinc-800' : 'bg-white hover:bg-zinc-50 text-zinc-750 border border-zinc-150/50'
            }`}
          >
            <ChevronLeft size={18} className="stroke-[3]" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight leading-none">
              Manual do Usuário
            </h2>
            <p className="text-zinc-100/80 text-xs font-semibold mt-1">
              Guia Completo de Navegação e Recursos
            </p>
          </div>
        </div>
      </div>

      {/* Main Guide card */}
      <div className={`p-6 rounded-[2rem] border shadow-sm space-y-4 ${
        darkMode ? 'bg-[#242b38]/90 border-[#2e3a4e] text-zinc-300' : 'bg-[#e6f4ea] border-emerald-100 text-zinc-650'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <FileText size={20} className="stroke-[2.5]" />
          </div>
          <div>
            <h3 className={`font-extrabold text-sm leading-tight ${darkMode ? 'text-zinc-100' : 'text-[#15a350]'}`}>
              Como usar o CrossMeds
            </h3>
            <span className={`text-[10px] font-bold block mt-0.5 ${darkMode ? 'text-zinc-400' : 'text-emerald-600'}`}>
              Encontre aqui respostas rápidas para as principais funcionalidades do portal.
            </span>
          </div>
        </div>

        {/* Search input mimic from screenshots */}
        <div className="relative mt-2">
          <input
            type="text"
            placeholder="Pesquisar no manual..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full px-11 py-3 text-xs font-semibold rounded-xl border transition-all ${
              darkMode 
                ? 'bg-[#181d26] border-[#2e3a4e] text-zinc-200 placeholder-zinc-500 focus:border-emerald-500' 
                : 'bg-white border-zinc-200 text-zinc-800 placeholder-zinc-400 focus:border-emerald-500'
            }`}
          />
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
        </div>
      </div>

      {/* Accordions */}
      <div className="space-y-2.5">
        {filteredSections.length > 0 ? (
          filteredSections.map((section) => {
            const isExpanded = expandedId === section.id;
            return (
              <div 
                key={section.id}
                className={`border rounded-2xl overflow-hidden transition-all shadow-xs ${
                  darkMode 
                    ? 'border-[#2e3a4e] bg-[#242b38]' 
                    : (isExpanded ? 'border-emerald-150 bg-[#eef7f2]' : 'border-emerald-100/60 bg-[#e6f4ea]')
                }`}
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-4.5 text-left font-black text-xs uppercase tracking-wider text-emerald-950 dark:text-zinc-200 hover:opacity-90 active:scale-[0.99] transition-all"
                >
                  <div className="flex items-center gap-3">
                    {section.icon}
                    <span>{section.title}</span>
                  </div>
                  <div>
                    {isExpanded ? (
                      <ChevronUp size={16} className="text-emerald-600 dark:text-zinc-400 stroke-[2.5]" />
                    ) : (
                      <ChevronDown size={16} className="text-emerald-600 dark:text-zinc-400 stroke-[2.5]" />
                    )}
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className={`px-5 pb-5 pt-1 text-xs font-semibold leading-relaxed ${
                        darkMode ? 'text-zinc-350 border-t border-[#2e3a4e]/50' : 'text-zinc-650 border-t border-emerald-150/40'
                      }`}>
                        {section.content}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10">
            <p className="text-xs text-zinc-400 font-bold">Nenhum resultado encontrado para "{searchQuery}".</p>
          </div>
        )}
      </div>
    </div>
  );
};
