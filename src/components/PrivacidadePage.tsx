import React from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  Shield, 
  CheckCircle, 
  UserCheck, 
  Database, 
  Heart, 
  Lock, 
  Share2, 
  UserX, 
  Clock, 
  Cookie, 
  RefreshCw, 
  Mail, 
  Phone
} from 'lucide-react';

interface Props {
  darkMode: boolean;
  onBack: () => void;
}

export const PrivacidadePage: React.FC<Props> = ({ darkMode, onBack }) => {
  const whatsappNumber = "5517988362599";
  const formattedPhone = "(17) 98836-2599";
  const emailAddress = "wsaconato@gmail.com";

  const handleWhatsAppClick = () => {
    const text = encodeURIComponent("Olá! Estou entrando em contato sobre a Política de Privacidade do CrossMeds.");
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleEmailClick = () => {
    window.location.href = `mailto:${emailAddress}?subject=Privacidade%20CrossMeds&body=Olá,%20gostaria%20de%20esclarecer%20uma%20dúvida%20sobre%20meus%20dados...`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pt-2 pb-14 px-1 select-none" id="privacy-policy-page">
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
              Política de Privacidade
            </h2>
            <p className="text-zinc-100/80 text-xs font-semibold mt-1">
              Saiba como seus dados de saúde e cadastrais são protegidos de forma ética e segura.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Left main content col */}
        <div className="md:col-span-8 space-y-5">
          
          {/* Section 1: Compromisso com a sua Privacidade */}
          <div className={`p-6 md:p-7 rounded-[2rem] border shadow-sm space-y-4 ${
            darkMode ? 'bg-[#242b38] border-[#2e3a4e] text-zinc-300' : 'bg-white border-zinc-100 text-zinc-650'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Shield size={20} className="stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white leading-tight">
                  Compromisso com a sua Privacidade
                </h3>
                <span className="text-[10px] text-zinc-400 font-bold block mt-0.5">
                  Última atualização: 15 de Julho de 2024
                </span>
              </div>
            </div>
            
            <p className="text-xs font-semibold leading-relaxed">
              O CrossMeds respeita a sua privacidade e leva a proteção dos seus dados pessoais a sério. Esta Política explica, de forma direta, como as informações são coletadas, usadas e protegidas.
            </p>
            <p className="text-xs font-semibold leading-relaxed bg-emerald-500/5 dark:bg-emerald-500/10 border-l-2 border-emerald-500 dark:border-emerald-450 p-3 rounded-r-xl">
              Ao utilizar o CrossMeds, você concorda com esta Política.
            </p>
          </div>

          {/* Section 2: Sobre o CrossMeds */}
          <div className={`p-6 md:p-7 rounded-[2rem] border shadow-sm space-y-4 ${
            darkMode ? 'bg-[#242b38] border-[#2e3a4e] text-zinc-300' : 'bg-white border-zinc-100 text-zinc-650'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <UserCheck size={20} className="stroke-[2.5]" />
              </div>
              <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white">
                Sobre o CrossMeds
              </h3>
            </div>
            
            <p className="text-xs font-semibold leading-relaxed">
              O CrossMeds é um sistema de segurança ativa para organização e uso correto de medicamentos, desenvolvido por <strong className="text-zinc-900 dark:text-white font-extrabold">Jeferson Charles Saconato</strong>, farmacêutico registrado sob o <strong className="text-emerald-500">CRF-SP 14.198</strong> com experiência de <strong className="text-zinc-900 dark:text-white font-extrabold">35 anos</strong>, sendo quase uma década no serviço público (SUS), operado pela empresa CrossMeds.
            </p>
            
            <div className="flex flex-wrap gap-2 pt-1">
              <button 
                onClick={handleEmailClick} 
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-3.5 py-2 rounded-xl hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Mail size={12} className="text-emerald-500" /> wsaconato@gmail.com
              </button>
              <button 
                onClick={handleWhatsAppClick}
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-3.5 py-2 rounded-xl hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Phone size={12} className="text-emerald-500" /> (17) 98836-2599
              </button>
            </div>
          </div>

          {/* Section 3: Coleta de Dados */}
          <div className={`p-6 md:p-7 rounded-[2rem] border shadow-sm space-y-4 ${
            darkMode ? 'bg-[#242b38] border-[#2e3a4e] text-zinc-300' : 'bg-white border-zinc-100 text-zinc-650'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Database size={20} className="stroke-[2.5]" />
              </div>
              <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white">
                Coleta de Dados
              </h3>
            </div>
            
            <div className="space-y-3">
              <p className="text-xs font-semibold leading-relaxed">
                O CrossMeds coleta apenas os dados necessários para o funcionamento do sistema, incluindo:
              </p>
              <ul className="space-y-2.5 text-xs font-semibold text-zinc-550 dark:text-zinc-400 pl-4 list-disc marker:text-emerald-500">
                <li>Dados cadastrais básicos (nome, login)</li>
                <li>Informações sobre medicamentos (nome, dosagem, horários, observações)</li>
                <li>Dados clínicos informados voluntariamente pelo usuário (ex: glicemia, pressão arterial, peso)</li>
                <li>Registros de uso do sistema (data e hora de acessos)</li>
              </ul>
              <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-450 pt-1">
                O CrossMeds NÃO coleta dados sem ação direta do usuário.
              </p>
            </div>
          </div>

          {/* Section 4: Dados de Saúde (Sensíveis) */}
          <div className={`p-6 md:p-7 rounded-[2rem] border shadow-sm space-y-4 ${
            darkMode ? 'bg-[#242b38] border-[#2e3a4e] text-zinc-300' : 'bg-white border-zinc-100 text-zinc-650'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 dark:text-red-400">
                <Heart size={20} className="stroke-[2.5]" />
              </div>
              <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white">
                Dados de Saúde
              </h3>
            </div>
            
            <div className="space-y-3">
              <p className="text-xs font-semibold leading-relaxed">
                Os dados relacionados à saúde são considerados dados sensíveis, conforme a Lei Geral de Proteção de Dados (LGPD).
              </p>
              <p className="text-xs font-semibold leading-relaxed">
                Esses dados:
              </p>
              <ul className="space-y-2.5 text-xs font-semibold text-zinc-550 dark:text-zinc-400 pl-4 list-disc marker:text-red-400">
                <li>São inseridos exclusivamente pelo usuário</li>
                <li>São utilizados apenas para organização, alertas e geração de relatórios</li>
                <li>Não são vendidos, compartilhados ou utilizados para fins publicitários</li>
              </ul>
              <div className="p-3.5 bg-red-500/5 dark:bg-red-500/10 border-l-2 border-red-500 dark:border-red-400 rounded-r-xl">
                <p className="text-xs font-black text-red-500 dark:text-red-400 leading-normal">
                  O CrossMeds não realiza diagnóstico médico nem substitui acompanhamento profissional.
                </p>
              </div>
            </div>
          </div>

          {/* Section 5: Armazenamento e Segurança */}
          <div className={`p-6 md:p-7 rounded-[2rem] border shadow-sm space-y-4 ${
            darkMode ? 'bg-[#242b38] border-[#2e3a4e] text-zinc-300' : 'bg-white border-zinc-100 text-zinc-650'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Lock size={20} className="stroke-[2.5]" />
              </div>
              <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white">
                Armazenamento e Segurança
              </h3>
            </div>
            
            <div className="space-y-3 text-xs font-semibold leading-relaxed">
              <p>
                Para garantir a segurança e a disponibilidade dos seus dados, utilizamos a plataforma Firebase da Google para armazenamento em nuvem. Isso significa que suas informações são protegidas com tecnologias de segurança de ponta.
              </p>
              <p>
                Os seus dados são encriptados tanto em trânsito (entre o seu dispositivo e os servidores) como em repouso (nos servidores da Google).
              </p>
              <p className="text-zinc-450 dark:text-zinc-400 italic">
                Apesar de usarmos as melhores práticas, nenhum sistema é 100% imune. O utilizador também é responsável por manter o seu dispositivo e as suas credenciais de acesso seguros.
              </p>
            </div>
          </div>

        </div>

        {/* Right side widgets / shorter cards col */}
        <div className="md:col-span-4 space-y-5">
          
          {/* Block 1: Selo LGPD Accent Widget */}
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-600/10 border border-emerald-500/20 dark:border-emerald-500/30 rounded-[2rem] p-6 space-y-3.5 shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="text-emerald-500 stroke-[3]" size={16} />
              <h4 className="text-[10px] font-black uppercase text-emerald-500 tracking-wider">
                Selo de Conformidade LGPD
              </h4>
            </div>
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-350 leading-relaxed">
              Este aplicativo opera em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018). Seus dados pessoais e de saúde são tratados com a máxima segurança e confidencialidade.
            </p>
          </div>

          {/* Block 2: Compartilhamento de Dados */}
          <div className={`p-5.5 rounded-[2rem] border shadow-sm space-y-3.5 ${
            darkMode ? 'bg-[#242b38] border-[#2e3a4e] text-zinc-300' : 'bg-white border-zinc-100 text-zinc-650'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                <Share2 size={15} />
              </div>
              <h4 className="font-extrabold text-xs text-zinc-900 dark:text-white">
                Compartilhamento
              </h4>
            </div>
            <p className="text-xs font-semibold leading-relaxed">
              O CrossMeds NÃO compartilha dados pessoais ou de saúde com terceiros, exceto:
            </p>
            <ul className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 space-y-1.5 pl-3 list-disc marker:text-emerald-500">
              <li>Quando exigido por lei ou ordem judicial</li>
              <li>Mediante consentimento explícito do usuário</li>
            </ul>
          </div>

          {/* Block 3: Direitos do Usuário */}
          <div className={`p-5.5 rounded-[2rem] border shadow-sm space-y-3.5 ${
            darkMode ? 'bg-[#242b38] border-[#2e3a4e] text-zinc-300' : 'bg-white border-zinc-100 text-zinc-650'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                <UserX size={15} />
              </div>
              <h4 className="font-extrabold text-xs text-zinc-900 dark:text-white">
                Seus Direitos
              </h4>
            </div>
            <p className="text-xs font-semibold leading-relaxed">
              Você tem direito a:
            </p>
            <ul className="text-xs font-bold text-zinc-550 dark:text-zinc-355 space-y-1 pl-3 list-disc marker:text-emerald-500">
              <li>Acessar seus dados</li>
              <li>Corrigir informações</li>
              <li>Solicitar exclusão</li>
              <li>Revogar consentimento</li>
            </ul>
            <p className="text-[10px] text-zinc-450 dark:text-zinc-400 font-medium leading-normal border-t border-zinc-100 dark:border-zinc-800/60 pt-2.5">
              Solicitações podem ser feitas pelo e-mail: <span className="font-bold underline text-emerald-500 pr-1 select-text">wsaconato@gmail.com</span>
            </p>
          </div>

          {/* Block 4: Tempo de Retenção */}
          <div className={`p-5.5 rounded-[2rem] border shadow-sm space-y-2 ${
            darkMode ? 'bg-[#242b38] border-[#2e3a4e] text-zinc-300' : 'bg-white border-zinc-100 text-zinc-650'
          }`}>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-emerald-500" />
              <h4 className="font-extrabold text-xs text-zinc-900 dark:text-white">
                Tempo de Retenção
              </h4>
            </div>
            <p className="text-xs font-semibold leading-relaxed">
              Os dados permanecem armazenados enquanto o usuário utilizar o sistema ou até que solicite sua exclusão.
            </p>
          </div>

          {/* Block 5: Cookies e Tecnologias */}
          <div className={`p-5.5 rounded-[2rem] border shadow-sm space-y-2 ${
            darkMode ? 'bg-[#242b38] border-[#2e3a4e] text-zinc-300' : 'bg-white border-zinc-100 text-zinc-650'
          }`}>
            <div className="flex items-center gap-2">
              <Cookie size={14} className="text-emerald-500" />
              <h4 className="font-extrabold text-xs text-zinc-900 dark:text-white">
                Cookies e Tecnologias
              </h4>
            </div>
            <p className="text-xs font-semibold leading-relaxed">
              O site do CrossMeds pode utilizar cookies estritamente necessários para funcionamento e segurança. Não utilizamos cookies para rastreamento comercial invasivo.
            </p>
          </div>

          {/* Block 6: Alterações */}
          <div className={`p-5.5 rounded-[2rem] border shadow-sm space-y-2 ${
            darkMode ? 'bg-[#242b38] border-[#2e3a4e] text-zinc-300' : 'bg-white border-zinc-100 text-zinc-650'
          }`}>
            <div className="flex items-center gap-2">
              <RefreshCw size={14} className="text-emerald-500 animate-spin animate-duration-10000" />
              <h4 className="font-extrabold text-xs text-zinc-900 dark:text-white">
                Alterações nesta Política
              </h4>
            </div>
            <p className="text-xs font-semibold leading-relaxed text-zinc-500 dark:text-zinc-400">
              Esta Política pode ser atualizada para refletir melhorias no sistema ou exigências legais. A data da última atualização será sempre informada no topo do documento.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
