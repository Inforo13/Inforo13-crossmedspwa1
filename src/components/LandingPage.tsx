import React from 'react';
import { 
  Pill, 
  Clock, 
  Users, 
  Activity, 
  FileText, 
  Shield, 
  Check, 
  LogIn, 
  ChevronDown,
  Sparkles,
  ArrowRight,
  BookOpen
} from 'lucide-react';

interface LandingPageProps {
  onSelectAuth: (signUp: boolean) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectAuth }) => {
  return (
    <div className="font-sora selection:bg-[#ddeeff] text-[#0f1923] bg-white min-h-screen antialiased">
      
      {/* ─── NAVIGATION ─── */}
      <nav className="border-b border-[#eaecf0] py-4 sticky top-0 bg-white/95 backdrop-blur-md z-50">
        <div className="max-w-[780px] mx-auto px-6 flex items-center justify-between">
          <div className="font-serif-display text-2xl text-[#0d2e5c] tracking-tight font-normal">
            Cross<span className="text-[#1a5ca8]">Meds</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onSelectAuth(false)} 
              className="text-xs font-bold text-[#5a6a7a] hover:text-[#0d2e5c] transition-colors"
            >
              Já tenho conta (Entrar)
            </button>
            <button 
              onClick={() => onSelectAuth(true)}
              className="hidden sm:inline-block bg-[#1a5ca8] hover:bg-[#0d2e5c] text-white px-5 py-2.5 rounded-full text-xs font-semibold transition-colors shadow-sm"
            >
              Quero por R$47
            </button>
          </div>
        </div>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <header className="py-16 sm:py-20 border-b border-[#eaecf0] bg-gradient-to-b from-[#f0f6ff] to-white">
        <div className="max-w-[780px] mx-auto px-6">
          <div className="inline-block text-[11px] font-semibold tracking-wider uppercase text-[#1a5ca8] bg-[#ddeeff] px-3.5 py-1 rounded-full mb-6">
            App de saúde · R$47 único · Sem mensalidade
          </div>
          
          <h1 className="font-serif-display text-3xl sm:text-4xl text-[#0d2e5c] leading-tight mb-6 max-w-[680px]">
            Seu familiar toma mais de um remédio? Descubra em segundos se há <em className="italic text-[#1a5ca8] font-serif-display">risco de interação perigosa</em> — antes que aconteça.
          </h1>
          
          <p className="text-base sm:text-lg text-[#5a6a7a] max-w-[580px] mb-8 leading-relaxed">
            O CrossMeds analisa sua lista de medicamentos com tecnologia usada por farmacêuticos e avisa se alguma combinação pode causar dano. <strong className="text-[#0f1923] font-semibold">Simples de usar, sem precisar de plano de saúde ou consulta.</strong>
          </p>
          
          <div className="space-y-3">
            <button 
              onClick={() => onSelectAuth(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center bg-[#1a5ca8] hover:bg-[#0d2e5c] text-white text-base font-semibold py-4 px-8 rounded-full shadow-[0_4px_20px_rgba(26,92,168,0.3)] hover:shadow-[0_6px_24px_rgba(26,92,168,0.4)] transition-all transform hover:-translate-y-0.5"
            >
              Sim, quero proteger minha família agora
            </button>
            <p className="text-xs text-[#9ca3af] pl-1">
              Acesso imediato · Sem mensalidade · Garantia de 7 dias
            </p>
          </div>
        </div>
      </header>

      {/* ─── STATS SECTION ─── */}
      <section className="py-16 border-b border-[#eaecf0]">
        <div className="max-w-[780px] mx-auto px-6">
          <span className="inline-block text-[11px] font-semibold tracking-widest uppercase text-[#1a5ca8] mb-4">
            O problema que ninguém fala
          </span>
          <h2 className="font-serif-display text-2xl sm:text-3xl text-[#0d2e5c] mb-6 leading-tight">
            Toda semana, brasileiros são hospitalizados por erro com medicamento. A maioria nem sabia que corria risco.
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
            <div className="bg-[#fff0f0] rounded-xl p-5 text-center border border-[#ffd5d5]">
              <div className="font-serif-display text-4xl text-[#c0392b] mb-2">50%</div>
              <div className="text-xs text-[#7a2020] font-medium leading-relaxed">
                dos pacientes não toma os remédios corretamente, segundo a OMS
              </div>
            </div>
            <div className="bg-[#fff0f0] rounded-xl p-5 text-center border border-[#ffd5d5]">
              <div className="font-serif-display text-4xl text-[#c0392b] mb-2">5+</div>
              <div className="text-xs text-[#7a2020] font-medium leading-relaxed">
                remédios por dia é a média entre idosos — multiplicando o risco
              </div>
            </div>
            <div className="bg-[#f0faf4] rounded-xl p-5 text-center border border-[#bbf0d0]">
              <div className="font-serif-display text-4xl text-[#1e7a45] mb-2">R$0</div>
              <div className="text-xs text-[#14532d] font-medium leading-relaxed">
                é o custo de uma análise no CrossMeds comparado a uma internação
              </div>
            </div>
          </div>
          
          <p className="text-[#5a6a7a] leading-relaxed">
            O problema não é descuido. É que <strong className="text-[#0f1923] font-semibold">ninguém nunca avisou</strong> que certos remédios, combinados, fazem mal. Nem o médico. Nem a farmácia. Até agora.
          </p>
        </div>
      </section>

      {/* ─── TESTIMONIAL ─── */}
      <section className="py-16 border-b border-[#eaecf0]">
        <div className="max-w-[780px] mx-auto px-6">
          <span className="inline-block text-[11px] font-semibold tracking-widest uppercase text-[#1a5ca8] mb-4">
            Quem já usou
          </span>
          <h2 className="font-serif-display text-2xl sm:text-3xl text-[#0d2e5c] mb-6 leading-tight">
            Quem já usou não imaginava que corria esse risco.
          </h2>
          
          <div className="bg-[#f0f6ff] border-l-4 border-[#1a5ca8] rounded-r-xl p-6 my-6">
            <p className="font-serif-display italic text-base sm:text-lg text-[#0d2e5c] leading-relaxed mb-3">
              "Em 3 anos tomando 7 remédios, nunca ninguém me disse que o remédio pra pressão e o anti-inflamatório juntos podiam causar problema nos rins. O CrossMeds me avisou no primeiro dia. Mostrei pro meu médico e ele mudou a prescrição na hora."
            </p>
            <div className="text-xs font-semibold text-[#1a5ca8]">
              — Maria, 68 anos, cuidadora do marido · São Paulo
            </div>
          </div>
          
          <hr className="border-t border-[#eaecf0] my-8" />
          
          <p className="text-[#5a6a7a] leading-relaxed mb-8">
            Validado pelo <strong className="text-[#0f1923]">Dr. Jeferson Saconato</strong>, farmacêutico (CRF-SP 14.192). O CrossMeds usa a mesma base de dados que profissionais de saúde — agora no seu celular.
          </p>
          
          <div className="space-y-2">
            <button 
              onClick={() => onSelectAuth(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center bg-[#1a5ca8] hover:bg-[#0d2e5c] text-white text-base font-semibold py-4 px-8 rounded-full shadow-[0_4px_20px_rgba(26,92,168,0.3)] transition-all"
            >
              Quero analisar meus remédios agora
            </button>
            <p className="text-xs text-[#9ca3af] pl-1">
              R$47 único · Acesso vitalício · Sem surpresas
            </p>
          </div>
        </div>
      </section>

      {/* ─── BEFORE / AFTER ─── */}
      <section className="py-16 border-b border-[#eaecf0]">
        <div className="max-w-[780px] mx-auto px-6">
          <span className="inline-block text-[11px] font-semibold tracking-widest uppercase text-[#1a5ca8] mb-4">
            Por que isso acontece
          </span>
          <h2 className="font-serif-display text-2xl sm:text-3xl text-[#0d2e5c] mb-6 leading-tight">
            Quanto mais remédios, maior o risco. E quase ninguém verifica.
          </h2>
          <p className="text-[#5a6a7a] leading-relaxed mb-6">
            Idosos tomam em média 5 ou mais remédios por dia. Cada remédio novo que entra na lista é uma combinação a mais que ninguém checou. <strong className="text-[#0f1923]">Médicos prescrevem. Farmácias vendem. Mas ninguém analisa a lista completa.</strong>
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
            <div className="bg-[#fff0f0] rounded-xl p-5 border border-[#ffd5d5]">
              <div className="text-[11px] font-black tracking-widest uppercase text-[#c0392b] mb-2">Sem o CrossMeds</div>
              <div className="text-xs sm:text-sm text-[#7a2020] leading-relaxed font-medium">
                Toma os remédios em horários diferentes, torce para não ter problema, só descobre quando passa mal e vai para a emergência.
              </div>
            </div>
            <div className="bg-[#f0faf4] rounded-xl p-5 border border-[#bbf0d0]">
              <div className="text-[11px] font-black tracking-widest uppercase text-[#1e7a45] mb-2">Com o CrossMeds</div>
              <div className="text-xs sm:text-sm text-[#14532d] leading-relaxed font-medium">
                Insere a lista em segundos, recebe o alerta de segurança imediato, gera o relatório para o médico e ajusta a prescrição de forma assertiva.
              </div>
            </div>
          </div>
          
          <p className="text-[#5a6a7a] leading-relaxed">
            É tudo que o CrossMeds precisa para analisar sua lista de medicamentos e avisar se há perigo — <strong className="text-[#0f1923]">antes que aconteça</strong>.
          </p>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="py-16 border-b border-[#eaecf0]">
        <div className="max-w-[780px] mx-auto px-6">
          <span className="inline-block text-[11px] font-semibold tracking-widest uppercase text-[#1a5ca8] mb-4">
            O que você leva por R$47
          </span>
          <h2 className="font-serif-display text-2xl sm:text-3xl text-[#0d2e5c] mb-3 leading-tight">
            7 ferramentas que nenhum app gratuito tem — num único pagamento.
          </h2>
          <p className="text-[#5a6a7a] leading-relaxed mb-6">
            Sem mensalidade. Sem plano. Você paga uma vez e usa para sempre.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8">
            <div className="bg-[#f7f8fa] border border-[#eaecf0] rounded-xl p-5 hover:border-[#1a5ca8] transition-colors">
              <div className="text-2xl mb-2">💊</div>
              <h3 className="font-semibold text-sm mb-1 text-[#0f1923]">Análise de interações</h3>
              <p className="text-xs text-[#5a6a7a] leading-relaxed">
                Detecta cruzamentos de alto risco e reações medicamentosas perigosas na sua prescrição.
              </p>
            </div>
            
            <div className="bg-[#f7f8fa] border border-[#eaecf0] rounded-xl p-5 hover:border-[#1a5ca8] transition-colors">
              <div className="text-2xl mb-2">🔬</div>
              <h3 className="font-semibold text-sm mb-1 text-[#0f1923]">Leitura de exames por IA</h3>
              <p className="text-xs text-[#5a6a7a] leading-relaxed">
                Envie fotos dos exames laboratoriais e entenda os resultados descritos em termos fáceis e acessíveis.
              </p>
            </div>
            
            <div className="bg-[#f7f8fa] border border-[#eaecf0] rounded-xl p-5 hover:border-[#1a5ca8] transition-colors">
              <div className="text-2xl mb-2">📄</div>
              <h3 className="font-semibold text-sm mb-1 text-[#0f1923]">Relatório clínico em PDF</h3>
              <p className="text-xs text-[#5a6a7a] leading-relaxed">
                Gere um dossiê clínico elegante e formatado profissionalmente para entregar ao seu médico de confiança.
              </p>
            </div>
            
            <div className="bg-[#f7f8fa] border border-[#eaecf0] rounded-xl p-5 hover:border-[#1a5ca8] transition-colors">
              <div className="text-2xl mb-2">⏰</div>
              <h3 className="font-semibold text-sm mb-1 text-[#0f1923]">Lembretes de horário</h3>
              <p className="text-xs text-[#5a6a7a] leading-relaxed">
                Configure avisos inteligentes e organize a rotina dos seus remédios diários de forma programada.
              </p>
            </div>
            
            <div className="bg-[#f7f8fa] border border-[#eaecf0] rounded-xl p-5 hover:border-[#1a5ca8] transition-colors">
              <div className="text-2xl mb-2">👨‍👩‍👧</div>
              <h3 className="font-semibold text-sm mb-1 text-[#0f1923]">Perfil do familiar</h3>
              <p className="text-xs text-[#5a6a7a] leading-relaxed">
                Cuidadores organizam com extrema eficiência e monitoram a medicação de quem amam de um único painel.
              </p>
            </div>
            
            <div className="bg-[#f7f8fa] border border-[#eaecf0] rounded-xl p-5 hover:border-[#1a5ca8] transition-colors">
              <div className="text-2xl mb-2">🛡️</div>
              <h3 className="font-semibold text-sm mb-1 text-[#0f1923]">Base farmacêutica de ponta</h3>
              <p className="text-xs text-[#5a6a7a] leading-relaxed">
                Usamos diretrizes e referências técnicas de base científicas estruturadas para garantir acurácia clínica.
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <button 
              onClick={() => onSelectAuth(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center bg-[#1a5ca8] hover:bg-[#0d2e5c] text-white text-base font-semibold py-4 px-8 rounded-full shadow-[0_4px_20px_rgba(26,92,168,0.3)] transition-all"
            >
              Quero acesso completo por R$47
            </button>
            <p className="text-xs text-[#9ca3af] pl-1">
              Pagamento único · Sem renovação automática · Garantia de 7 dias
            </p>
          </div>
        </div>
      </section>

      {/* ─── CREATORS ─── */}
      <section className="py-16 border-b border-[#eaecf0]">
        <div className="max-w-[780px] mx-auto px-6">
          <span className="inline-block text-[11px] font-semibold tracking-widest uppercase text-[#1a5ca8] mb-4">
            Quem está por trás
          </span>
          <h2 className="font-serif-display text-2xl sm:text-3xl text-[#0d2e5c] mb-6 leading-tight">
            Desenvolvido com farmacêutico registrado. Não é um app qualquer.
          </h2>
          
          <div className="bg-[#f0f6ff] border-l-4 border-[#1a5ca8] rounded-r-xl p-6 mb-6">
            <p className="font-serif-display italic text-base text-[#0d2e5c] leading-relaxed mb-3">
              "Como farmacêutico, vejo diariamente pacientes que tomam medicamentos incompatíveis sem saber. O CrossMeds coloca na mão de qualquer pessoa a mesma análise que eu faço no consultório profissional."
            </p>
            <div className="text-xs font-semibold text-[#1a5ca8]">
              — Dr. Jeferson Saconato · Farmacêutico · CRF-SP 14.192
            </div>
          </div>
          
          <hr className="border-t border-[#eaecf0] my-8" />
          
          <p className="font-semibold text-sm text-[#0f1923] mb-4">O que o CrossMeds não é:</p>
          <ul className="space-y-3">
            <li className="flex items-start gap-2.5 text-sm text-[#5a6a7a]">
              <span className="text-[#1e7a45] font-bold text-sm mt-0.5 select-none">✓</span>
              <span>Não substitui seu médico — complementa a consulta com informação que faltava.</span>
            </li>
            <li className="flex items-start gap-2.5 text-sm text-[#5a6a7a]">
              <span className="text-[#1e7a45] font-bold text-sm mt-0.5 select-none">✓</span>
              <span>Não precisa de assinatura recorrente — pagamento único de R$47, para sempre.</span>
            </li>
            <li className="flex items-start gap-2.5 text-sm text-[#5a6a7a]">
              <span className="text-[#1e7a45] font-bold text-sm mt-0.5 select-none">✓</span>
              <span>Não é complicado — qualquer pessoa, idoso ou familiar, usa e entende em minutos.</span>
            </li>
            <li className="flex items-start gap-2.5 text-sm text-[#5a6a7a]">
              <span className="text-[#1e7a45] font-bold text-sm mt-0.5 select-none">✓</span>
              <span>Não tem risco financeiro — 7 dias de garantia integral, devolução imediata se não gostar.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* ─── EXAMS ANALYSIS BY AI ─── */}
      <section className="py-16 border-b border-[#eaecf0]">
        <div className="max-w-[780px] mx-auto px-6">
          <span className="inline-block text-[11px] font-semibold tracking-widest uppercase text-[#1a5ca8] mb-4">
            Leitura de exames por IA
          </span>
          <h2 className="font-serif-display text-2xl sm:text-3xl text-[#0d2e5c] mb-6 leading-tight">
            Recebeu um exame e não entendeu nada? A IA do CrossMeds explica em linguagem simples.
          </h2>
          <p className="text-[#5a6a7a] leading-relaxed mb-8">
            Você não precisa esperar a próxima consulta para saber o que os parâmetros do seu exame no papel significam. <strong className="text-[#0f1923]">Tire uma foto ou faça upload do arquivo</strong> — o CrossMeds traduz tudo em palavras descomplicadas.
          </p>
          
          <div className="space-y-6 my-8">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-[#1a5ca8] text-white flex items-center justify-center font-bold text-sm shrink-0">
                1
              </div>
              <div>
                <h3 className="font-semibold text-sm text-[#0f1923] mb-1">Envie o exame de sangue</h3>
                <p className="text-xs text-[#5a6a7a] leading-relaxed">
                  Tire foto pelo celular ou faça upload de PDF. Funciona para exames de hemograma, tireoide, colesterol, diabetes e vários outros.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-[#1a5ca8] text-white flex items-center justify-center font-bold text-sm shrink-0">
                2
              </div>
              <div>
                <h3 className="font-semibold text-sm text-[#0f1923] mb-1">A IA processa instantaneamente</h3>
                <p className="text-xs text-[#5a6a7a] leading-relaxed">
                  Ela identifica indicadores de foco, valores fora dos limites recomendados e explica o que cada taxa representa.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-[#1a5ca8] text-white flex items-center justify-center font-bold text-sm shrink-0">
                3
              </div>
              <div>
                <h3 className="font-semibold text-sm text-[#0f1923] mb-1">Você entende e discute com o especialista</h3>
                <p className="text-xs text-[#5a6a7a] leading-relaxed">
                  Ganhe autonomia e vá para a consulta sabendo exatamente quais perguntas realizar ao seu médico assistente.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-[#f0f6ff] border-l-4 border-[#1a5ca8] rounded-r-xl p-5 my-6">
            <p className="font-serif-display italic text-sm sm:text-base text-[#0d2e5c] leading-relaxed mb-2">
              "Minha mãe sempre saía do médico confusa sobre os exames dela. Agora ela entra na consulta já ciente do que merece atenção — os diálogos com os médicos melhoraram imensamente."
            </p>
            <div className="text-xs font-semibold text-[#1a5ca8]">
              — Carla M., filha de paciente · 41 anos
            </div>
          </div>
        </div>
      </section>

      {/* ─── PDF REPORTS ─── */}
      <section className="py-16 border-b border-[#eaecf0]">
        <div className="max-w-[780px] mx-auto px-6">
          <span className="inline-block text-[11px] font-semibold tracking-widest uppercase text-[#1a5ca8] mb-4">
            Relatório clínico em PDF
          </span>
          <h2 className="font-serif-display text-2xl sm:text-3xl text-[#0d2e5c] mb-6 leading-tight">
            Leve para o médico um relatório pronto — não um print de celular.
          </h2>
          <p className="text-[#5a6a7a] leading-relaxed mb-8">
            O CrossMeds consolida a lista de todos os remédios, os horários e toda análise de segurança de interações em um lindo PDF clínico. <strong className="text-[#0f1923]">Organizado e pronto para guiar as suas consultas de forma séria.</strong>
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#f7f8fa] border border-[#eaecf0] rounded-xl p-5">
              <div className="text-[#1a5ca8] mb-1.5"><FileText size={20} /></div>
              <h3 className="font-semibold text-xs text-[#0f1923] mb-1">Formato clínico padrão</h3>
              <p className="text-xs text-[#5a6a7a] leading-relaxed">
                Médicos leem as informações estruturadas em minutos, acelerando diagnósticos e evitando perigos de forma ativa.
              </p>
            </div>
            
            <div className="bg-[#f7f8fa] border border-[#eaecf0] rounded-xl p-5">
              <div className="text-[#1a5ca8] mb-1.5"><ArrowRight size={20} /></div>
              <h3 className="font-semibold text-xs text-[#0f1923] mb-1">Compartilhamento ágil</h3>
              <p className="text-xs text-[#5a6a7a] leading-relaxed">
                Envie via WhatsApp em um toque para familiares, outros médicos assistentes ou cuidadores de idosos de forma simples.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-16 border-b border-[#eaecf0]">
        <div className="max-w-[780px] mx-auto px-6">
          <span className="inline-block text-[11px] font-semibold tracking-widest uppercase text-[#1a5ca8] mb-4">
            Dúvidas frequentes
          </span>
          <h2 className="font-serif-display text-2xl sm:text-3xl text-[#0d2e5c] mb-8 leading-tight">
            Ficou alguma dúvida? Provavelmente está aqui.
          </h2>
          
          <div className="space-y-4">
            <details className="group border-b border-[#eaecf0] pb-4">
              <summary className="flex items-center justify-between font-semibold text-sm cursor-pointer list-none text-[#0f1923] hover:text-[#1a5ca8] transition-colors py-2">
                <span>Precisa de conhecimento médico para usar?</span>
                <ChevronDown size={16} className="text-[#1a5ca8] group-open:rotate-180 transition-transform" />
              </summary>
              <p className="text-xs text-[#5a6a7a] mt-2 leading-relaxed pl-1">
                Não. O CrossMeds foi feito para qualquer pessoa — idosos, cuidadores, familiares. Se você sabe usar o WhatsApp, sabe usar o CrossMeds sem complicação alguma.
              </p>
            </details>
            
            <details className="group border-b border-[#eaecf0] pb-4">
              <summary className="flex items-center justify-between font-semibold text-sm cursor-pointer list-none text-[#0f1923] hover:text-[#1a5ca8] transition-colors py-2">
                <span>O app substitui o médico especialista?</span>
                <ChevronDown size={16} className="text-[#1a5ca8] group-open:rotate-180 transition-transform" />
              </summary>
              <p className="text-xs text-[#5a6a7a] mt-2 leading-relaxed pl-1">
                Não, e nunca vai substituir. Ele complementa e auxilia de forma proativa, concedendo dados limpos que médicos muitas vezes não têm o devido tempo disponível de analisar em cada consulta.
              </p>
            </details>
            
            <details className="group border-b border-[#eaecf0] pb-4">
              <summary className="flex items-center justify-between font-semibold text-sm cursor-pointer list-none text-[#0f1923] hover:text-[#1a5ca8] transition-colors py-2">
                <span>É realmente pagamento único? Sem mensalidades?</span>
                <ChevronDown size={16} className="text-[#1a5ca8] group-open:rotate-180 transition-transform" />
              </summary>
              <p className="text-xs text-[#5a6a7a] mt-2 leading-relaxed pl-1">
                Sim. R$47 pago apenas uma única vez. Sem qualquer renovação automática posterior, sem tarifas escondidas ou reajustes. Pague uma vez, use para sempre.
              </p>
            </details>
            
            <details className="group border-b border-[#eaecf0] pb-4">
              <summary className="flex items-center justify-between font-semibold text-sm cursor-pointer list-none text-[#0f1923] hover:text-[#1a5ca8] transition-colors py-2">
                <span>E se eu não me adaptar ou não gostar do app?</span>
                <ChevronDown size={16} className="text-[#1a5ca8] group-open:rotate-180 transition-transform" />
              </summary>
              <p className="text-xs text-[#5a6a7a] mt-2 leading-relaxed pl-1">
                Garantia incondicional de 7 dias de satisfação. Se não gostar, basta solicitar o reembolso que daremos em curto prazo — de forma descomplicada.
              </p>
            </details>
            
            <details className="group border-b border-[#eaecf0] pb-4">
              <summary className="flex items-center justify-between font-semibold text-sm cursor-pointer list-none text-[#0f1923] hover:text-[#1a5ca8] transition-colors py-2">
                <span>Funciona para qualquer medicamento?</span>
                <ChevronDown size={16} className="text-[#1a5ca8] group-open:rotate-180 transition-transform" />
              </summary>
              <p className="text-xs text-[#5a6a7a] mt-2 leading-relaxed pl-1">
                Funciona com a grande maioria dos medicamentos comercializados no território brasileiro. Nossa base de dados é mantida ativa e atualizada de modo constante.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* ─── CALL TO ACTION FINAL ─── */}
      <section className="bg-[#0d2e5c] py-20 text-white border-b-0">
        <div className="max-w-[780px] mx-auto px-6 text-center">
          <h2 className="font-serif-display text-2xl sm:text-3xl text-white mb-4 leading-tight">
            Sua família merece saber se está segura.
          </h2>
          <p className="text-sm text-cyan-100/80 max-w-[520px] mx-auto mb-10 leading-relaxed">
            Análise de interações, leitura inteligente de exames em linguagem clara e relatório consolidado clínico profissional — por apenas R$47 único. Sem restrições de tempo, totalmente seguro.
          </p>
          
          <button 
            onClick={() => onSelectAuth(true)}
            className="inline-flex items-center justify-center bg-white hover:bg-[#ddeeff] text-[#0d2e5c] font-bold text-base py-4 py-4 px-8 rounded-full shadow-lg transition-colors cursor-pointer"
          >
            Sim, quero proteger minha família agora
          </button>
          
          <p className="text-xs text-white/50 mt-3">
            Acesso imediato · Garantia de 7 dias · Pagamento único
          </p>
          
          <div className="mt-12 bg-white/5 border border-white/10 rounded-xl p-5 text-left flex gap-4">
            <span className="text-2xl select-none">🛡️</span>
            <div>
              <p className="text-xs text-white leading-relaxed">
                <strong className="text-white font-semibold">Garantia total de 7 dias úteis.</strong> Se não estiver 100% satisfeito por qualquer motivo, reembolsamos cada centavo pago de forma ágil e amigável.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-12 bg-white border-t border-[#eaecf0]">
        <div className="max-w-[780px] mx-auto px-6 text-center text-xs text-[#9ca3af] space-y-2">
          <p className="font-medium text-[#5a6a7a]">
            CrossMeds · Tecnologia em saúde · Validado pelo Dr. Jeferson Saconato, CRF-SP 14.192
          </p>
          <p>
            Este aplicativo é um instrumento complementar e educativo, não devendo substituir consultas ou orientações médicas qualificadas.
          </p>
        </div>
      </footer>

    </div>
  );
};
