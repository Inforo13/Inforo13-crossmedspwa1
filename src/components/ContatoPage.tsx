import React from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  MessageSquare, 
  Mail, 
  Phone, 
  ExternalLink, 
  ChevronRight,
  ShieldCheck,
  Send,
  Sparkles
} from 'lucide-react';

interface Props {
  darkMode: boolean;
  onBack: () => void;
}

export const ContatoPage: React.FC<Props> = ({ darkMode, onBack }) => {
  const whatsappNumber = "5517988362599";
  const formattedPhone = "(17) 98836-2599";
  const emailAddress = "wsaconato@gmail.com";
  
  const handleWhatsAppClick = () => {
    const text = encodeURIComponent("Olá! Estou entrando em contato através da Central de Saúde CrossMeds.");
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleEmailClick = () => {
    window.location.href = `mailto:${emailAddress}?subject=Suporte%20CrossMeds&body=Olá,%20gostaria%20de%20falar%20sobre...`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pt-2 pb-14 px-1 select-none" id="contact-us-page">
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
              Fale Conosco
            </h2>
            <p className="text-zinc-100/80 text-xs font-semibold mt-1">
              Fale com nosso suporte técnico ou tire dúvidas sobre a plataforma CrossMeds.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {/* Banner Card */}
        <div className={`rounded-[2.5rem] p-6.5 border transition-all duration-300 relative overflow-hidden shadow-sm ${
          darkMode ? 'bg-[#242b38] border-[#2e3a4e] text-white' : 'bg-white border-emerald-100'
        }`}>
          <div className="absolute right-0 top-0 translate-x-5 -translate-y-5 w-44 h-44 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
          
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
              Canais de Atendimento
            </span>
            <h1 className="text-2.5xl font-black tracking-tight mt-3.5 text-zinc-900 dark:text-white">
              Como podemos ajudar você?
            </h1>
            <p className="text-zinc-450 dark:text-zinc-400 text-xs mt-1.5 font-semibold leading-relaxed max-w-xl">
              Escolha uma das opções seguras abaixo para iniciar uma conversa com nossa equipe técnica de suporte ou tirar suas dúvidas em tempo real.
            </p>
          </div>
        </div>

        {/* Action Channels Container Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Card WhatsApp */}
          <motion.div
            whileHover={{ y: -3 }}
            onClick={handleWhatsAppClick}
            className={`rounded-[2rem] p-6.5 border transition-all duration-300 cursor-pointer text-left flex flex-col justify-between h-44 shadow-sm group ${
              darkMode 
                ? 'bg-[#242b38] border-[#2e3a4e] hover:bg-[#293242] hover:border-emerald-500/40' 
                : 'bg-white border-zinc-100 hover:border-emerald-250/70 hover:shadow-md'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="w-13 h-13 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 flex items-center justify-center text-emerald-500 group-hover:scale-105 transition-transform duration-300">
                <MessageSquare size={24} className="stroke-[2.5]" />
              </div>
              <ChevronRight size={18} className="text-zinc-400 group-hover:translate-x-1 transition-transform" />
            </div>

            <div>
              <p className="text-zinc-400 text-[10px] uppercase font-black tracking-wider">Suporte WhasApp</p>
              <h3 className="text-lg font-black text-zinc-900 dark:text-white leading-tight mt-1">
                WhatsApp
              </h3>
              <p className="text-zinc-455 dark:text-zinc-400 text-xs font-semibold mt-1">
                Clique para iniciar uma conversa em <span className="text-emerald-500 font-extrabold">{formattedPhone}</span>
              </p>
            </div>
          </motion.div>

          {/* Card E-mail */}
          <motion.div
            whileHover={{ y: -3 }}
            onClick={handleEmailClick}
            className={`rounded-[2rem] p-6.5 border transition-all duration-300 cursor-pointer text-left flex flex-col justify-between h-44 shadow-sm group ${
              darkMode 
                ? 'bg-[#242b38] border-[#2e3a4e] hover:bg-[#293242] hover:border-blue-500/40' 
                : 'bg-white border-zinc-100 hover:border-blue-200 hover:shadow-md'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="w-13 h-13 rounded-2xl bg-blue-500/10 dark:bg-blue-500/15 flex items-center justify-center text-blue-500 group-hover:scale-105 transition-transform duration-300">
                <Mail size={24} className="stroke-[2.5]" />
              </div>
              <ChevronRight size={18} className="text-zinc-400 group-hover:translate-x-1 transition-transform" />
            </div>

            <div>
              <p className="text-zinc-400 text-[10px] uppercase font-black tracking-wider">Enviar Mensagem por E-mail</p>
              <h3 className="text-lg font-black text-zinc-900 dark:text-white leading-tight mt-1">
                E-mail
              </h3>
              <p className="text-zinc-455 dark:text-zinc-400 text-xs font-semibold mt-1">
                Clique para nos enviar um e-mail em <span className="text-blue-500 font-extrabold">{emailAddress}</span>
              </p>
            </div>
          </motion.div>

        </div>

        {/* Decorative / Trust Assurance Badge Footer */}
        <div className={`p-5 rounded-[2rem] border transition-all duration-300 text-xs ${
          darkMode ? 'bg-[#212835]/50 border-zinc-800 text-zinc-400' : 'bg-zinc-50 border-zinc-150 text-zinc-500'
        } flex items-start gap-3.5`}>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
            <ShieldCheck size={20} className="stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <p className="font-black text-zinc-800 dark:text-zinc-200">Segurança de Dados Assegurada</p>
            <p className="leading-relaxed font-medium">
              O CrossMeds opera em regime HIPAA PWA offline, nunca transmitindo ou compartilhando seus diários com terceiros não autorizados sem a sua permissão explícita gerada no código QR Code médico.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
