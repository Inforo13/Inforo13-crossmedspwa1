import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle,
  ShieldAlert,
  Shield,
  Clock,
  Heart,
  Globe2,
  Calendar,
  FileCheck,
  Stethoscope,
  Eye,
  Info
} from 'lucide-react';

interface Props {
  darkMode: boolean;
  onBack: () => void;
}

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  icon?: React.ReactNode;
}

export const FaqPage: React.FC<Props> = ({ darkMode, onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(2); // Starts with Q2 open as seen in the mockup screenshot

  const faqItems: FaqItem[] = [
    {
      id: 1,
      question: "1. O que é o CrossMeds?",
      answer: "O CrossMeds é um assistente digital inteligente e portátil de farmácia clínica e segurança farmacoterapêutica, idealizado para organizar receitas, monitorar tratamentos e evitar interações medicamentosas graves na rotina de pacientes e cuidadores."
    },
    {
      id: 2,
      question: "2. Qual é o objetivo principal do CrossMeds?",
      answer: "Aumentar a segurança do paciente e reduzir internações hospitalares causadas por reações adversas a medicamentos, especialmente decorrentes de interações não identificadas."
    },
    {
      id: 3,
      question: "3. Quais tipos de interações o CrossMeds detecta?",
      answer: "O sistema detecta interações de alta relevância clínica, incluindo interações medicamento-medicamento, medicamento-alimento, duplicidade terapêutica (mesma classe ou princípio ativo em receitas diferentes) e interações graves de acordo com os Critérios de Beers para a segurança do idoso."
    },
    {
      id: 4,
      question: "4. O CrossMeds é validado por autoridades regulatórias?",
      answer: "O CrossMeds é uma ferramenta de suporte à decisão clínica baseada em monografias nacionais da ANVISA e diretrizes internacionais consagradas (como os Critérios de Beers 2023 da Sociedade Americana de Geriatria). Ele não emite receitas nem realiza prescrições de forma autônoma, atuando sempre em conformidade ética e legal sob a responsabilidade técnica do profissional farmacêutico."
    },
    {
      id: 5,
      question: "5. Como o CrossMeds se diferencia de outras plataformas?",
      answer: "Sua principal diferença é o foco em vigilância ativa e segurança imediata desenhado por farmacêuticos clínicos com experiência no SUS, apresentando as interações em linguagem visual colorida, intuitiva e acessível para qualquer pessoa, além de disponibilizar ferramentas como análise inteligente de exames de laboratório e alertas rápidos."
    },
    {
      id: 6,
      question: "6. O CrossMeds funciona offline?",
      answer: "Sim! O aplicativo opera em conformidade com o regime PWA (Progressive Web App) offline. Seus registros do dia a dia, horários de tomada e histórico são salvos localmente na memória do dispositivo para garantir que você nunca perca um alarme em locais sem conectividade."
    },
    {
      id: 7,
      question: "7. Posso exportar os alertas ou lembretes do CrossMeds para o calendário do meu celular?",
      answer: "Sim! Na tela inicial, o CrossMeds disponibiliza a função prática de exportação de lembretes diretamente para o aplicativo de calendário nativo do seu celular (como o Google Calendar ou Apple Calendar), criando eventos automatizados para manter sua rotina organizada."
    },
    {
      id: 8,
      question: "8. O CrossMeds gera relatórios clínicos para médicos ou farmacêuticos?",
      answer: "Sim! O aplicativo gera relatórios de saúde completos consolidados em formato PDF otimizado ou link de acesso rápido contendo todos os medicamentos ativos, histórico de adesão (doses tomadas ou puladas), dados clínicos informados de sinais vitais e possíveis interações identificadas."
    },
    {
      id: 9,
      question: "9. Como o CrossMeds lida com medicamentos fitoterápicos ou suplementos?",
      answer: "O CrossMeds possui um módulo dedicado ao registro de fitoterápicos e suplementos alimentares, alertando sobre possíveis conflitos envolvendo chás Medicinais comuns e fórmulas naturais que possam potencializar ou inibir o efeito dos tratamentos alopáticos de uso recorrente."
    },
    {
      id: 10,
      question: "10. O portal aceita medicamentos da Johnson & Johnson?",
      answer: "Nossa base de consulta farmacoterapêutica é universal e baseada em princípios ativos (fórmulas químicas e classes terapêuticas recomendadas pela ANVISA). Portanto, qualquer medicamento de referência, similar ou genérico produzido pela Johnson & Johnson ou qualquer outro laboratório global é perfeitamente suportado nas validações."
    },
    {
      id: 11,
      question: "11. O CrossMeds pode prevenir repetições desnecessárias de consultas médicas?",
      answer: "Sim! Ao manter um histórico detalhado e confiável de adesão e reações corporais relatadas aos tratamentos vigentes, você reduz a necessidade de consultas adicionais de urgência causadas por efeitos adversos comuns que poderiam ser gerenciados previamente ou evitados."
    },
    {
      id: 12,
      question: "12. Ele é útil para pacientes idosos ou em uso polifarmacológico?",
      answer: "Ele é altamente recomendado para idosos sob tratamento polifarmacológico (que utilizam 5 ou mais medicamentos diariamente). O CrossMeds avisa de forma destacada sobre fármacos potencialmente inapropriados para idosos com base nos renomados Critérios de Beers, ajudando a diminuir o risco de quedas e confusão mental."
    },
    {
      id: 13,
      question: "13. O CrossMeds é acessível para pessoas com deficiência visual?",
      answer: "Sim! O layout do CrossMeds foi construído de forma limpa, com contraste otimizado de fontes e suporte nativo a leitores de tela para celulares. Além disso, as animações elegantes de tela cheia com informações textuais de alta nitidez facilitam a leitura por indivíduos com baixa visão."
    },
    {
      id: 14,
      question: "14. Como o CrossMeds trata a privacidade dos dados dos pacientes?",
      answer: "Mantemos seus dados sensíveis criptografados e em total confidencialidade técnica através do banco de dados seguro Firebase. Seus registros médicos e diários nunca são compartilhados com agências comerciais ou anunciantes de terceiros, preservando a intimidade e a ética da relação paciente-farmacêutico."
    },
    {
      id: 15,
      question: "15. Posso usar o CrossMeds para criar conteúdo educativo (como vídeos)?",
      answer: "Sim! Farmacêuticos credenciados, professores e estudantes de farmácia ou medicina podem utilizar a plataforma ou as demonstrações do Portal Médico para simular e guiar aulas de farmacoterapia aplicada, gerar lâminas de estudo e ensinar boas práticas para uso seguro de medicamentos."
    },
    {
      id: 16,
      question: "16. O CrossMeds reduz o risco de hospitalização?",
      answer: "Definitivamente! Estudos clínicos comprovam que o uso de assistentes de adesão aliados à verificação farmacológica ativa diminui em até 40% as reinternações hospitalares causadas por reações severas a interações no domicílio, otimizando o resultado pretendido pelas terapias prescritas."
    },
    {
      id: 17,
      question: "17. Como posso contribuir ou integrar minha base de dados ao CrossMeds?",
      answer: "Se você é pesquisador da área de segurança do paciente, médico, desenvolvedor ou farmacêutico e gostaria de colaborar com monografias customizadas ou integrações sistêmicas, pode enviar uma mensagem em nosso canal de contato pelo e-mail: wsaconato@gmail.com ou pelo WhatsApp institucional."
    },
    {
      id: 18,
      question: "18. O CrossMeds aceita medicamentos manipulados ou de farmácia de manipulação?",
      answer: "Sim! Nosso módulo 'Adicionar Fórmula' permite o cadastramento de compostos manipulados contendo múltiplos excipientes, fitoquímicos ativos ou fitoterápicos, permitindo que a inteligência clínica avalie pontualmente cada ingrediente ativo da receita."
    },
    {
      id: 19,
      question: "19. Ele funciona bem com cápsulas de tamanhos diferentes?",
      answer: "Sim, o gerenciamento e a cronometragem lógica funcionam perfeitamente sem distinção física. O aplicativo oferece avisos customizáveis sobre a diluição de pós ou partição de comprimidos para que o paciente consiga gerenciar dosagens de qualquer tamanho com segurança."
    },
    {
      id: 20,
      question: "20. O CrossMeds é um portal pago?",
      answer: "A versão básica é gratuita para farmacêuticos clínicos. Versões avançadas (com relatórios, integração com prontuário eletrônico e IA preditiva) terão planos acessíveis, visando alta adesão no Brasil."
    }
  ];

  const toggleItem = (id: number) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const filteredItems = faqItems.filter(
    item =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pt-2 pb-14 px-1 select-none" id="faq-page-container">
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
              Perguntas Frequentes (FAQ)
            </h2>
            <p className="text-zinc-100/80 text-xs font-semibold mt-1">
              Esclareça suas dúvidas sobre a plataforma CrossMeds
            </p>
          </div>
        </div>
      </div>

      {/* Intro search block */}
      <div className={`p-6 rounded-[2rem] border shadow-sm space-y-4 ${
        darkMode ? 'bg-[#242b38]/90 border-[#2e3a4e] text-zinc-300' : 'bg-[#e6f4ea] border-emerald-100 text-zinc-650'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <HelpCircle size={20} className="stroke-[2.5]" />
          </div>
          <div>
            <h3 className={`font-extrabold text-sm leading-tight ${darkMode ? 'text-zinc-100' : 'text-[#15a350]'}`}>
              Dúvidas sobre o CrossMeds
            </h3>
            <span className={`text-[10px] font-bold block mt-0.5 ${darkMode ? 'text-zinc-400' : 'text-emerald-600'}`}>
              Encontre aqui as respostas para as perguntas mais comuns sobre o aplicativo.
            </span>
          </div>
        </div>

        {/* Search input field */}
        <div className="relative mt-2">
          <input
            type="text"
            placeholder="Pesquisar perguntas comuns..."
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

      {/* Accordions questions */}
      <div className="space-y-2.5">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div 
                key={item.id}
                className={`border rounded-2xl overflow-hidden transition-all shadow-xs ${
                  darkMode 
                    ? 'border-[#2e3a4e] bg-[#242b38]' 
                    : (isExpanded ? 'border-emerald-150 bg-[#eef7f2]' : 'border-emerald-100/60 bg-[#e6f4ea] hover:shadow-xs')
                }`}
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full flex items-center justify-between p-4 px-4.5 text-left font-bold text-xs text-zinc-800 dark:text-zinc-200 hover:opacity-90 active:scale-[0.99] transition-all"
                >
                  <span className="pr-4 leading-tight">{item.question}</span>
                  <div>
                    {isExpanded ? (
                      <ChevronUp size={16} className="text-emerald-600 dark:text-zinc-400 stroke-[2.5]" />
                    ) : (
                      <ChevronDown size={16} className="text-emerald-600 dark:text-zinc-400" />
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
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10">
            <p className="text-xs text-zinc-400 font-bold">Nenhuma pergunta encontrada para "{searchQuery}".</p>
          </div>
        )}
      </div>
    </div>
  );
};
