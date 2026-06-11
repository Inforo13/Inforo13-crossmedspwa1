import React from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  Star, 
  Check, 
  ShieldCheck, 
  Zap, 
  Lock 
} from 'lucide-react';

interface Props {
  darkMode: boolean;
  user: any;
  onBack: () => void;
}

export const UpgradePage: React.FC<Props> = ({ darkMode, user, onBack }) => {
  // Use the exact Stripe checkout link with user's specific UID as client_reference_id
  const userUid = user?.uid || 'Z5mHYzwN7OPiQRYtLWo727MgZB03';
  const stripeLink = `https://buy.stripe.com/dRm7sLew0gBY7dbcin14406?client_reference_id=${userUid}`;

  const features = [
    "Cadastro ilimitado de medicamentos",
    "Verificação inteligente de interações",
    "Lembretes e alarmes via calendário",
    "Relatórios de saúde completos (PDF)",
    "Análise de tratamento por IA",
    "Chat exclusivo com Inteligência Artificial"
  ];

  const handleUpgradeClick = () => {
    // Open the direct Stripe purchase link in a new tab
    window.open(stripeLink, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pt-2 pb-14 px-1 select-none" id="upgrade-page-container">
      {/* Header and Back Navigation */}
      <div className="flex justify-between items-center bg-transparent gap-4 mb-2">
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
              Acesso Premium
            </h2>
          </div>
        </div>
      </div>

      {/* Main card box with screenshot visual design details */}
      <div className="flex justify-center items-center py-4 px-2">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white text-zinc-800 rounded-[2.5rem] border border-emerald-100 shadow-xl overflow-hidden flex flex-col items-center"
        >
          {/* Top Banner Green Header */}
          <div className="w-full bg-[#15a350] py-3 text-center">
            <span className="text-[10px] font-black text-white tracking-widest uppercase">
              OFERTA ESPECIAL: ACESSO VITALÍCIO
            </span>
          </div>

          <div className="px-6 py-8 flex flex-col items-center w-full text-center">
            {/* Round star circle icon */}
            <div className="w-16 h-16 rounded-full bg-[#e6f4ea] flex items-center justify-center text-[#15a350] mb-5 shadow-xs">
              <Star size={28} className="fill-[#15a350] stroke-[#15a350]" />
            </div>

            {/* Headline and subtitle */}
            <h3 className="text-2xl font-black text-[#15a350] tracking-tight mb-2">
              Desbloqueie Tudo
            </h3>
            <p className="text-zinc-500 font-bold text-xs max-w-xs leading-relaxed mb-6">
              A ferramenta de segurança medicamentosa mais completa do Brasil.
            </p>

            {/* Listed features checkboxes block */}
            <div className="w-full space-y-3.5 mb-7 text-left pl-2">
              {features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#e6f4ea] flex items-center justify-center text-[#15a350] shrink-0">
                    <Check size={12} className="stroke-[3.5]" />
                  </div>
                  <span className="text-xs font-black text-zinc-700 leading-none">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* Central detailed pricing container */}
            <div className="w-full bg-[#f4fbf7] border border-emerald-50 rounded-2xl p-5 mb-5 shadow-inner">
              <span className="text-[9px] font-black text-zinc-400 tracking-wider">
                DE R$ 97,00 POR APENAS
              </span>
              <div className="text-4xl font-extrabold text-[#15a350] my-2 leading-none">
                R$ 47,00
              </div>
              <span className="text-[9px] font-black text-[#15a350] tracking-wider block">
                PAGAMENTO ÚNICO. SEM MENSALIDADES.
              </span>
            </div>

            {/* Small guarantee badges */}
            <div className="w-full flex justify-center items-center gap-6 mb-7">
              <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-black">
                <ShieldCheck size={14} className="text-[#15a350] stroke-[2.5]" />
                7 DIAS DE GARANTIA
              </div>
              <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-black">
                <Zap size={14} className="text-[#15a350] stroke-[2.5]" />
                ATIVAÇÃO IMEDIATA
              </div>
            </div>

            {/* Activation UID text box */}
            <div className="mb-6 bg-zinc-50 px-4 py-2.5 rounded-xl border border-zinc-100 flex flex-col items-center justify-center w-full max-w-[270px]">
              <span className="text-[8px] font-black tracking-widest text-zinc-400">
                ID DE ATIVAÇÃO:
              </span>
              <span className="text-[10px] font-mono font-bold text-zinc-500 mt-0.5 max-w-full truncate">
                {userUid}
              </span>
            </div>

            {/* Main Action pay CTA button */}
            <button
              onClick={handleUpgradeClick}
              className="w-full py-4 px-5 rounded-2xl bg-[#15a350] hover:bg-[#128a43] active:scale-[0.98] transition-all text-white font-black text-sm tracking-wide uppercase flex items-center justify-center gap-2.5 shadow-md shadow-emerald-500/10 cursor-pointer"
            >
              <Check size={16} className="stroke-[3]" />
              GARANTIR ACESSO AGORA
            </button>

            {/* Small Secure badge footer inside card */}
            <span className="text-[9px] font-black text-zinc-400 mt-4 tracking-wider uppercase italic">
              SEGURANÇA GARANTIDA PELO STRIPE
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
