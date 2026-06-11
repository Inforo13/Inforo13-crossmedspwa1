import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Droplet, 
  Clock, 
  Activity, 
  ChevronDown, 
  Compass, 
  Sparkles, 
  Flame, 
  Layers, 
  Info,
  Calendar,
  BookOpen
} from 'lucide-react';

interface Props {
  onBack?: () => void;
  darkMode: boolean;
}

interface InsulinDetail {
  name: string;
  brand: string;
  onset: string;
  peak: string;
  duration: string;
}

interface InsulinCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  colorClass: string;
  bgSelectedClass: string;
  explanation: string;
  items: InsulinDetail[];
}

export const InsulinasPage: React.FC<Props> = ({ onBack, darkMode }) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('ultrarrapida');

  const categories: InsulinCategory[] = [
    {
      id: 'ultrarrapida',
      title: 'Ação Ultrarrápida',
      icon: <Flame size={18} className="text-rose-500" />,
      colorClass: 'text-rose-650 dark:text-rose-450 border-rose-200/50 dark:border-rose-950/40',
      bgSelectedClass: 'bg-rose-50/50 dark:bg-rose-950/10',
      explanation: 'Ação quase imediata, ideal para correções e para aplicar junto às refeições principais.',
      items: [
        { name: 'Fasp Asparte', brand: 'Fiasp®', onset: '2-5min', peak: '0.5-1.5h', duration: '3-5h' },
        { name: 'Insulina Lispro', brand: 'Humalog® / Lyumjev®', onset: '10-15min', peak: '30-90min', duration: '3-5h' },
        { name: 'Insulina Asparte', brand: 'NovoRapid®', onset: '10-15min', peak: '1-3h', duration: '3-5h' },
        { name: 'Insulina Glulisina', brand: 'Apidra®', onset: '15-20min', peak: '1-2h', duration: '3-4h' }
      ]
    },
    {
      id: 'rapida',
      title: 'Ação Rápida',
      icon: <Activity size={18} className="text-orange-500" />,
      colorClass: 'text-orange-650 dark:text-orange-450 border-orange-200/50 dark:border-[#38261e]',
      bgSelectedClass: 'bg-orange-50/50 dark:bg-orange-950/10',
      explanation: 'Ação rápida, geralmente administrada em torno de 30 minutos antes de se alimentar.',
      items: [
        { name: 'Insulina Humana Regular', brand: 'Humulin R® / Novolin R®', onset: '30min', peak: '2-3h', duration: '5-8h' }
      ]
    },
    {
      id: 'curta_regular',
      title: 'Ação Curta (Regular)',
      icon: <Clock size={18} className="text-amber-500" />,
      colorClass: 'text-amber-650 dark:text-amber-450 border-amber-200/50 dark:border-amber-950/40',
      bgSelectedClass: 'bg-amber-50/50 dark:bg-amber-950/10',
      explanation: 'Utilizada para o controle prandial ou correção ágil de episódios glicêmicos elevados.',
      items: [
        { name: 'Insulina Regular Genérica', brand: 'Biohulin R® / Insuman R®', onset: '30-40min', peak: '2.5-4h', duration: '6-8h' }
      ]
    },
    {
      id: 'intermediaria',
      title: 'Ação Intermediária',
      icon: <Layers size={18} className="text-emerald-500" />,
      colorClass: 'text-emerald-650 dark:text-emerald-450 border-emerald-250/50 dark:border-emerald-950/40',
      bgSelectedClass: 'bg-emerald-50/50 dark:bg-emerald-950/10',
      explanation: 'Possui ação de duração intermediária, cobrindo as necessidades basais do corpo ao longo de meio período do dia.',
      items: [
        { name: 'Insulina NPH', brand: 'Humulin N® / Novolin N® / Insuman N®', onset: '1-2h', peak: '4-12h', duration: '18-24h' }
      ]
    },
    {
      id: 'longa_ultralonga',
      title: 'Ação Longa e Ultra Longa',
      icon: <Droplet size={18} className="text-blue-500" />,
      colorClass: 'text-blue-650 dark:text-blue-450 border-blue-200/50 dark:border-blue-950/30',
      bgSelectedClass: 'bg-blue-50/50 dark:bg-blue-950/10',
      explanation: 'Ação prolongada sem pico pronunciado, ideal para manter a basal glicêmica estável ao longo das 24 horas do dia.',
      items: [
        { name: 'Insulina Glargina', brand: 'Lantus® / Toujeo® / Basaglar®', onset: '1-2h', peak: 'Sem pico (Estável)', duration: '20-24h (Toujeo até 36h)' },
        { name: 'Insulina Detemir', brand: 'Levemir®', onset: '1-2h', peak: '6-8h (Platô)', duration: '18-24h' },
        { name: 'Insulina Degludeca', brand: 'Tresiba®', onset: '30-90min', peak: 'Sem pico (Altamente Estável)', duration: '> 42h' }
      ]
    },
    {
      id: 'premisturas',
      title: 'Pré-Misturas',
      icon: <Compass size={18} className="text-purple-500" />,
      colorClass: 'text-purple-650 dark:text-purple-450 border-purple-200/50 dark:border-purple-950/40',
      bgSelectedClass: 'bg-purple-50/50 dark:bg-purple-950/10',
      explanation: 'Combinações de insulina de ação rápida/ultrarrápida com ação intermediária para simplificar o número de aplicações diárias.',
      items: [
        { name: 'Humalog Mix 25 / Mix 50', brand: 'Lispro + Lispro Protamina', onset: '10-15min', peak: 'Múltiplos picos', duration: '10-16h' },
        { name: 'NovoMix 30', brand: 'Asparte + Asparte Protamina', onset: '10-20min', peak: '1-4h (Platô)', duration: '14-24h' },
        { name: 'Humulin 70/30 / Novolin 70/30', brand: 'NPH 70% + Regular 30%', onset: '30min', peak: '2-12h', duration: '14-24h' }
      ]
    }
  ];

  const toggleCategory = (id: string) => {
    setExpandedCategory(expandedCategory === id ? null : id);
  };

  return (
    <div className="max-w-4xl mx-auto pt-2 pb-12 px-4 selection:bg-emerald-100/30">
      
      {/* Top Bar Navigation */}
      <div className="flex items-center gap-4 mb-6">
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
            Tipos de Insulina e Inovações
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold mt-1">
            Educação continuada e consulta rápida sobre o perfil terapêutico de cada insulina.
          </p>
        </div>
      </div>

      {/* Primary Educational Box */}
      <div className="p-5 md:p-6 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-3xl flex items-start gap-4 mb-8">
        <div className="w-10 h-10 bg-[#00aa74] rounded-full shrink-0 flex items-center justify-center text-white shadow-xs">
          <BookOpen size={18} className="stroke-[2.5]" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-black uppercase tracking-wider text-emerald-850 dark:text-emerald-300">
            Entendendo as Insulinas
          </h4>
          <p className="text-xs font-bold text-emerald-900 dark:text-zinc-300 leading-relaxed">
            Existem vários tipos de insulina, cada uma com um tempo de ação diferente para controlar o açúcar no sangue. Conheça as principais categorias.
          </p>
        </div>
      </div>

      {/* Accordions Container */}
      <div className="space-y-4">
        {categories.map((cat) => {
          const isExpanded = expandedCategory === cat.id;
          return (
            <div 
              key={cat.id} 
              className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                isExpanded 
                  ? `${cat.colorClass} ${cat.bgSelectedClass} shadow-xs` 
                  : 'bg-white dark:bg-[#242b38] border-zinc-150/55 dark:border-zinc-800'
              }`}
            >
              {/* Header Button */}
              <button
                onClick={() => toggleCategory(cat.id)}
                className="w-full flex items-center justify-between p-5 outline-none cursor-pointer text-left focus:bg-zinc-50/50 dark:focus:bg-zinc-800/20"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-150/45 dark:border-zinc-800/80 shadow-xs flex items-center justify-center`}>
                    {cat.icon}
                  </div>
                  <span className="text-sm font-black tracking-tight text-zinc-900 dark:text-white uppercase">
                    {cat.title}
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-zinc-500 dark:text-zinc-400"
                >
                  <ChevronDown size={18} className="stroke-[2.5]" />
                </motion.div>
              </button>

              {/* Collapsed Body */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="border-t border-zinc-100/50 dark:border-zinc-800/60"
                  >
                    <div className="p-5 pt-4 space-y-4.5 bg-zinc-50/50 dark:bg-zinc-900/30">
                      
                      {/* Explainer string */}
                      <p className="text-xs font-semibold text-zinc-650 dark:text-zinc-300 leading-relaxed max-w-[95%]">
                        {cat.explanation}
                      </p>

                      {/* Medicine detailed cards list */}
                      <div className="space-y-4">
                        {cat.items.map((item, idx) => (
                          <div 
                            key={idx}
                            className="bg-white dark:bg-[#1f2632] border border-zinc-150/55 dark:border-zinc-800 rounded-3xl p-5 shadow-xs relative"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <span className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                                {item.name}
                              </span>
                              <span className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">
                                {item.brand}
                              </span>
                            </div>

                            {/* Standard 3-column parameters grid from screenshot */}
                            <div className="grid grid-cols-3 gap-3">
                              
                              {/* Início Column */}
                              <div className="bg-zinc-50/70 dark:bg-zinc-900 px-3 py-2.5 rounded-2xl flex flex-col items-center text-center">
                                <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                                  Início
                                </span>
                                <span className="text-xs font-black text-zinc-800 dark:text-zinc-200">
                                  {item.onset}
                                </span>
                              </div>

                              {/* Pico Column */}
                              <div className="bg-zinc-50/70 dark:bg-zinc-900 px-3 py-2.5 rounded-2xl flex flex-col items-center text-center">
                                <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                                  Pico
                                </span>
                                <span className="text-xs font-black text-zinc-800 dark:text-zinc-200">
                                  {item.peak}
                                </span>
                              </div>

                              {/* Duração Column */}
                              <div className="bg-zinc-50/70 dark:bg-zinc-900 px-3 py-2.5 rounded-2xl flex flex-col items-center text-center">
                                <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                                  Duração
                                </span>
                                <span className="text-xs font-black text-[#00897b] dark:text-[#26a69a]">
                                  {item.duration}
                                </span>
                              </div>

                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Advanced Research / Innovations Segment */}
      <div className="mt-10 bg-white dark:bg-[#242b38] border border-zinc-150/55 dark:border-zinc-800 rounded-[2rem] p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <Sparkles className="text-purple-500 stroke-[2]" size={20} />
          <h3 className="text-base font-black text-zinc-950 dark:text-white tracking-tight leading-none uppercase">
            Inovações e Avanços Recentes
          </h3>
        </div>

        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Avanços recentes no tratamento do diabetes, com foco em terapias que retardam a progressão da doença e melhoram o controle metabólico de forma inteligente.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="p-4.5 bg-[#f5f3ff] dark:bg-[#201d2d] border border-purple-150/45 dark:border-purple-950/30 rounded-2.5xl space-y-2">
            <h4 className="text-xs font-bold text-purple-950 dark:text-purple-300">
              Diabetes Tipo 1: Teplizumabe (Tzield®)
            </h4>
            <p className="text-[11px] font-medium text-purple-900 dark:text-purple-200 leading-relaxed">
              Primeira imunoterapia aprovada no mundo capaz de retardar o início do Estágio 3 do Diabetes Tipo 1, preservando a função de células beta produtoras de insulina em adultos e crianças a partir de 8 anos.
            </p>
          </div>

          <div className="p-4.5 bg-[#e0f2fe] dark:bg-[#1a2d3e] border border-sky-150/45 dark:border-sky-950/30 rounded-2.5xl space-y-2">
            <h4 className="text-xs font-bold text-sky-950 dark:text-sky-300">
              Diabetes Tipo 2: Coagonistas (GLP-1 + GIP)
            </h4>
            <p className="text-[11px] font-medium text-sky-900 dark:text-sky-200 leading-relaxed">
              Tratamentos inovadores como a Tirzepatida promovem estimulação de receptores duplos de incretinas, otimizando de maneira sem precedentes tanto o controle glicêmico quanto a segurança cardiovascular.
            </p>
          </div>

          <div className="p-4.5 bg-[#f0fdf4] dark:bg-[#1d2d22] border border-emerald-150/45 dark:border-emerald-950/30 rounded-2.5xl space-y-2 md:col-span-2">
            <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-300">
              Vem aí: Insulinas de Uso Semanal (Icodef)
            </h4>
            <p className="text-[11px] font-medium text-emerald-900 dark:text-emerald-200 leading-relaxed">
              Estudos clínicos avançados e aprovações regulatórias globais estão abrindo caminho para que o paciente passe a tomar insulina basal apenas uma vez por semana em vez de injeções diárias, melhorando radicalmente a adesão e a qualidade de vida.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
