import React from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  Award, 
  BookOpen, 
  Target, 
  Lightbulb, 
  ShieldCheck, 
  HeartHandshake,
  ExternalLink
} from 'lucide-react';

interface Props {
  darkMode: boolean;
  onBack: () => void;
}

export const QuemSomosPage: React.FC<Props> = ({ darkMode, onBack }) => {
  return (
    <div className="max-w-3xl mx-auto space-y-6 pt-2 pb-14 px-1 select-none" id="quem-somos-page">
      {/* Header and Back Navigation */}
      <div className="flex justify-between items-center bg-transparent gap-4 mb-4">
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
              Quem Somos
            </h2>
            <p className="text-zinc-100/80 text-xs font-semibold mt-1">
              História e Missão do CrossMeds
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Main Grid: Info & Creator Profile Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Left Side: Profile & Stats Cards */}
          <div className="md:col-span-5 space-y-4">
            {/* Dr. Jeferson Saconato Profile Card with Gradient */}
            <div className="bg-gradient-to-br from-emerald-400 to-cyan-500 dark:from-emerald-500 dark:to-teal-600 rounded-[2.5rem] p-6 text-white text-center flex flex-col items-center justify-center relative overflow-hidden shadow-md">
              <div className="absolute top-0 right-0 translate-x-4 -translate-y-4 w-28 h-28 bg-white/10 rounded-full blur-2xl"></div>
              
              {/* Initials Avatar */}
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-3xl font-black mb-4 tracking-tighter">
                JS
              </div>
              
              <h3 className="text-xl font-black tracking-tight leading-tight">
                Dr. Jeferson Saconato
              </h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-50 mt-1">
                CRF-SP 14.198
              </p>
              <p className="text-xs font-semibold text-white/90 mt-2">
                Farmacêutico Clínico
              </p>
            </div>

            {/* Experience Stats Card */}
            <div className={`rounded-3xl p-5 border flex items-center gap-4 shadow-sm ${
              darkMode ? 'bg-[#242b38] border-[#2e3a4e] text-white' : 'bg-white border-zinc-100'
            }`}>
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 shrink-0">
                <Award size={24} className="stroke-[2.5]" />
              </div>
              <div>
                <span className="text-2xl font-black text-emerald-500 block leading-none">
                  35+
                </span>
                <span className="text-[10px] font-black uppercase text-zinc-450 tracking-wider">
                  Anos de Exp.
                </span>
              </div>
            </div>
          </div>

          {/* Right Side: Backstory and Quote */}
          <div className={`md:col-span-7 rounded-[2.5rem] p-6 md:p-7 border flex flex-col justify-between space-y-4 shadow-sm ${
            darkMode ? 'bg-[#242b38] border-[#2e3a4e] text-zinc-300' : 'bg-white border-zinc-100 text-zinc-650'
          }`}>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <HeartHandshake className="text-emerald-500" size={18} />
                <h3 className="text-sm font-black uppercase text-emerald-500 tracking-wider">
                  Por trás do CrossMeds
                </h3>
              </div>
              
              <p className="text-xs font-semibold leading-relaxed">
                O CrossMeds não nasceu em um escritório de tecnologia, mas sim dentro dos consultórios de farmácia clínica do SUS. Ele foi idealizado pelo Dr. Jeferson Saconato (CRF-SP 14.198), farmacêutico com <strong className="text-zinc-900 dark:text-white font-black">35 anos de experiência</strong>, que dedicou quase uma década de sua carreira ao atendimento direto na rede pública de saúde.
              </p>
            </div>

            {/* Testimonial Quote Box */}
            <div className="p-4 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-2xl border-l-4 border-emerald-500 dark:border-emerald-400 space-y-2">
              <p className="text-[11px] font-medium italic leading-relaxed text-zinc-600 dark:text-zinc-350">
                "Durante 8 anos no posto de saúde, vi centenas de pacientes saírem do consultório com uma lista de medicamentos, mas com o olhar perdido. O CrossMeds nasceu para ser a minha voz e o meu cuidado dentro da casa de cada paciente, 24 horas por dia."
              </p>
              <span className="text-[10px] font-black uppercase text-zinc-550 dark:text-zinc-400 tracking-wider block text-right">
                - Dr. Jeferson Saconato
              </span>
            </div>

            <div>
              <p className="text-xs font-semibold leading-relaxed">
                Essa experiência direta com pacientes de todas as realidades sociais permitiu que o CrossMeds fosse desenvolvido com uma compreensão profunda das necessidades reais de quem precisa gerenciar múltiplos medicamentos e acompanhamentos de saúde.
              </p>
              
              {/* Badges list */}
              <div className="flex flex-wrap gap-2 mt-4">
                {['Farmácia Clínica', 'Farmacoterapia', 'Atendimento SUS'].map((badge) => (
                  <span key={badge} className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mission and Vision Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mission Card */}
          <div className={`p-6 rounded-[2rem] border space-y-3.5 shadow-sm ${
            darkMode ? 'bg-[#242b38] border-[#2e3a4e] text-zinc-300' : 'bg-white border-zinc-100 text-zinc-650'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-emerald-500/15 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                <Lightbulb size={18} className="stroke-[2.5]" />
              </div>
              <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white">
                Nossa Missão
              </h3>
            </div>
            <p className="text-xs font-semibold leading-relaxed">
              Empoderar pacientes e profissionais com inteligência clínica. Não somos apenas um lembrete; somos uma barreira de segurança contra interações medicamentosas perigosas, garantindo que a tecnologia sirva à vida.
            </p>
          </div>

          {/* Vision Card */}
          <div className={`p-6 rounded-[2rem] border space-y-3.5 shadow-sm ${
            darkMode ? 'bg-[#242b38] border-[#2e3a4e] text-zinc-300' : 'bg-white border-zinc-100 text-zinc-650'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-emerald-500/15 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                <Target size={18} className="stroke-[2.5]" />
              </div>
              <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white">
                Nossa Visão
              </h3>
            </div>
            <p className="text-xs font-semibold leading-relaxed">
              Ser o padrão de segurança farmacoterapêutica no Brasil, unindo a precisão dos dados da ANVISA à experiência de quem viveu a prática clínica no dia a dia.
            </p>
          </div>
        </div>

        {/* Highlight Card: O Diferencial do Especialista */}
        <div className={`p-6 rounded-[2rem] border space-y-3.5 shadow-sm ${
          darkMode ? 'bg-[#242b38] border-[#2e3a4e] text-zinc-300' : 'bg-white border-zinc-100 text-zinc-650'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-emerald-500/15 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
              <ShieldCheck size={18} className="stroke-[2.5]" />
            </div>
            <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white">
              O Diferencial do Especialista
            </h3>
          </div>
          <p className="text-xs font-semibold leading-relaxed">
            Diferente de outros aplicativos, o CrossMeds foi desenhado por um farmacêutico clínico para farmacêuticos e pacientes. Ele entende que a adesão ao tratamento (que sobe de <strong className="text-emerald-500 font-extrabold">53% para 86%</strong> com o uso do app) é o que separa o sucesso terapêutico de uma internação hospitalar.
          </p>
        </div>
      </div>
    </div>
  );
};
