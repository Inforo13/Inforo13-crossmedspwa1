import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Search, 
  AlertTriangle, 
  Droplet, 
  BookOpen, 
  ChevronDown, 
  Leaf, 
  Activity, 
  Info,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

interface Props {
  onBack?: () => void;
  darkMode: boolean;
}

interface FitoterapicoItem {
  name: string;
  howToUse: string;
  indications: string;
  interactions: string;
  hasCriticalInteractions: boolean;
}

export const FitoterapicosPage: React.FC<Props> = ({ onBack, darkMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fitoterapicos: FitoterapicoItem[] = [
    {
      name: "Alho (Allium sativum)",
      howToUse: "bulbo fresco mastigado, extrato seco em cápsulas, óleo oral",
      indications: "coadjuvante no tratamento da hiperlipidemia, auxiliar no controle da hipertensão leve a moderada, prevenção da aterosclerose",
      interactions: "varfarina, inibidores da protease (saquinavir, ritonavir), lisinopril, hipoglicemiantes (ex: clorpropamida), paracetamol, clorzoxazona",
      hasCriticalInteractions: true
    },
    {
      name: "Picão-preto (Bidens pilosa)",
      howToUse: "infusão das folhas, extrato seco em cápsulas, planta inteira em chá",
      indications: "tratamento da icterícia em crianças, auxiliar no controle da hipertensão, hipoglicemiante (coadjuvante no diabetes), hepatoprotetor, anti-inflamatório, cicatrizante, diurético",
      interactions: "nenhuma interação medicamentosa descrita na monografia da Anvisa; porém, uso relatado com antirretrovirais no Zimbabué sem avaliação de segurança",
      hasCriticalInteractions: false
    },
    {
      name: "Calêndula (Calendula officinalis L., Asteraceae)",
      howToUse: "infusão das flores, extrato seco em cápsulas, pomada tópica, compressa com infuso",
      indications: "cicatrizante, anti-inflamatório, auxiliar no tratamento de lesões cutâneas, contusões, queimaduras, gengivite",
      interactions: "nenhuma interação medicamentosa descrita na literatura",
      hasCriticalInteractions: false
    },
    {
      name: "Andiroba (Carapa guianensis)",
      howToUse: "extraído das formas mais citadas na monografia: óleo das sementes (uso mais comum), decocção da casca, infusão de folhas e óleo das flores.",
      indications: "resume as indicações validadas pelo uso popular e respaldadas por estudos não clínicos (ex: efeito anti-inflamatório comprovado em modelos animais com zimosan, atividade repelente contra Aedes aegypti, etc.).",
      interactions: "não encontrado na literatura pesquisada para interações descritas ou potenciais",
      hasCriticalInteractions: false
    },
    {
      name: "Sacaca (Croton benthianus)",
      howToUse: "retirado diretamente dos usos tradicionais mais frequentes descritos na monografia (infusão de folhas, decocção da casca, banho).",
      indications: "sintetiza as indicações validadas pelo uso popular e respaldadas por estudos pré-clínicos (ex: atividade anti-inflamatória, antinociceptiva e antimicrobiana).",
      interactions: "não registra nenhuma interação medicamentosa",
      hasCriticalInteractions: false
    },
    {
      name: "Açafrão-da-terra (Curcuma longa)",
      howToUse: "extraído das formas tradicionais e mencionadas na monografia: decocção/infusão do rizoma, cápsulas de extrato seco, uso do pó.",
      indications: "baseada nas indicações validadas: dispepsia funcional, distúrbios digestivos, atividade anti-inflamatória e hepatoprotetora com respaldo pré-clínico e clínico.",
      interactions: "a monografia menciona interações descritas (por exemplo, com anticoagulantes e antidiabéticos) e potenciais, especialmente por indução ou inibição de enzimas do citocromo P450 (CYP3A4, CYP2C9). A cúrcuma pode aumentar o risco de sangramento com anticoagulantes e potencializar efeitos hipoglicemiantes",
      hasCriticalInteractions: true
    },
    {
      name: "Mulungu (Erythrina mulungu)",
      howToUse: "formas mais citadas na monografia: decocção/infusão da casca do tronco (uso tradicional mais comum), extrato seco (uso em fitoterápicos registrados) e tintura (registrada em normativa da Anvisa).",
      indications: "baseada nas indicações validadas pela RDC/IN da Anvisa e respaldadas por estudos pré-clínicos com atividade sobre o sistema nervoso central (ex: potenciação do GABA, efeito ansiolítico em modelos animais).",
      interactions: "não registra nenhuma interação medicamentosa descrita ou potencial",
      hasCriticalInteractions: false
    },
    {
      name: "Eucalipto (Eucalyptus globulus)",
      howToUse: "retirado diretamente da monografia – infusão de folhas (uso oral tradicional), inalação do óleo essencial (uso mais comum), pomadas/géis com óleo essencial (uso tópico), banhos com folhas (em uso popular).",
      indications: "baseada nas indicações validadas pela Anvisa (RDC/IN) e respaldadas por estudos farmacológicos: ação expectorante, antisséptica, anti-inflamatória (tópica e respiratória), alívio de sintomas gripais e bronquites.",
      interactions: "não registra nenhuma interação medicamentosa descrita ou potencial",
      hasCriticalInteractions: false
    },
    {
      name: "Pitangueira (Eugenia uniflora)",
      howToUse: "formas mais citadas na monografia e no uso popular: infusão de folhas (uso mais frequente), decocção da casca (em algumas regiões), suco do fruto (uso alimentar e medicinal), banho com folhas (uso tópico tradicional).",
      indications: "reúne as indicações validadas pela Anvisa e respaldadas por estudos pré-clínicos: atividade antidiarreica, anti-inflamatória, hipotensora, hipoglicemiante e cicatrizante.",
      interactions: "não há nenhuma interação medicamentosa descrita ou potencial",
      hasCriticalInteractions: false
    },
    {
      name: "Funcho (Foeniculum vulgare)",
      howToUse: "extraído diretamente da monografia e do uso tradicional: infusão/chá das sementes (mais comum), cápsulas com extrato seco (em fitoterápicos registrados), óleo essencial (uso tópico ou por inalação, com cautela).",
      indications: "indicações validadas pela Anvisa e respaldadas por estudos pré-clínicos: ação espasmolítica, carminativa, uso em cólicas infantis, estímulo do apetite e da lactação, e efeito antisséptico respiratório.",
      interactions: "não há nenhuma interação medicamentosa descrita ou potencial",
      hasCriticalInteractions: false
    },
    {
      name: "Garra-do-diabo (Harpagophytum procumbens)",
      howToUse: "formas descritas na monografia e no uso tradicional: infusão/decocção da raiz tuberosa (mais comum), cápsulas com extrato seco (usadas em fitoterápicos registrados), tintura (citada em normativas da Anvisa).",
      indications: "indicações valadas pela Anvisa (RDC/IN) e respaldadas por estudos clínicos e pré-clínicos: ação anti-inflamatória e analgésica, especialmente em doenças osteoarticulares crônicas.",
      interactions: "a garra-do-diabo pode interagir com anticoagulantes, antiplaquetários, hipoglicemiantes, anti-hipertensivos e antiarrítmicos, devido à presença de iridoides (como a harpagosídeo) que podem modular o metabolismo hepático (via CYP450) e potencializar os efeitos dessas classes.",
      hasCriticalInteractions: true
    },
    {
      name: "Alecrim-pimenta (Lippia alba)",
      howToUse: "formas mais citadas na monografia e no uso popular: infusão/decocção das folhas e caule (uso oral), banho (uso tópico), inalação do óleo essencial (uso respiratório).",
      indications: "reúne as indicações validadas pela Anvisa com respaldo em estudos pré-clínicos: atividade no sistema nervoso central (ansiedade, sono), alívio de espasmos digestivos e dor leve, e efeito antisséptico.",
      interactions: "não há nenhuma interação medicamentosa descrita ou potencial",
      hasCriticalInteractions: false
    },
    {
      name: "Malva (Malva silvestris)",
      howToUse: "formas mais citadas na monografia e no uso popular: infusão de folhas e flores (uso mais comum), decocção, gargarejo (uso oral/respiratório) e compressas/emplastros com folhas frescas (uso tópico).",
      indications: "indicações validadas pela Anvisa com respaldo em propriedades mucilaginosas e anti-inflamatórias: ação calmante em irritações da garganta, tosse, constipação leve, e uso tópico em feridas e inflamações cutâneas.",
      interactions: "não há nenhuma interação medicamentosa descrita ou potencial",
      hasCriticalInteractions: false
    },
    {
      name: "Camomila (Matricaria chamomilla)",
      howToUse: "formas mais citadas na monografia e no uso tradicional: infusão das flores (uso mais comum), cápsulas com extrato seco, compressas e uso do óleo essencial por inalação ou tópico (sempre diluído).",
      indications: "indicações validadas pela Anvisa (RDC/IN) e respaldadas por estudos pré-clínicos e clínicos: ação sedativa, espasmolítica, ansiolítica, auxílio no sono e alívio de dores leves (ex: cólicas, dor de cabeça).",
      interactions: "não há nenhuma interação medicamentosa descrita ou potencial",
      hasCriticalInteractions: false
    },
    {
      name: "Hortelã-pimenta (Mentha x piperita)",
      howToUse: "formas mais citadas na monografia e no uso tradicional: infusão de folhas (uso mais comum), cápsulas com extrato seco, óleo essencial por inalação ou tópico (sempre diluído), e banhos com folhas (uso popular).",
      indications: "indicações validadas pela Anvisa com respaldo em estudos pré-clínicos e clínicos: ação espasmolítica, alívio de cólicas, dispepsia, náuseas, dor de cabeça e efeito antisséptico respiratório.",
      interactions: "não há nenhuma interação medicamentosa descrita ou potencial",
      hasCriticalInteractions: false
    },
    {
      name: "Guaco (Mikania glomerata)",
      howToUse: "formas mais citadas na monografia e no uso tradicional: infusão de folhas (uso mais comum), xarope (forma tradicional registrada na RDC/IN da Anvisa), decocção e banho com folhas (uso popular).",
      indications: "indicações validadas pela Anvisa com respaldo em estudos farmacológicos: ação expectorante, broncodilatadora e antisséptica, especialmente em quadros respiratórios obstrutivos e infecciosos.",
      interactions: "não há nenhuma interação medicamentosa descrita ou potencial",
      hasCriticalInteractions: false
    },
    {
      name: "Amoreira (Morus nigra)",
      howToUse: "formas mais citadas na monografia e no uso tradicional: infusão/decocção das folhas ou casca, consumo do fruto (suco/pasta), e uso tópico em banhos.",
      indications: "indicações validadas pela Anvisa e respaldadas por estudos pré-clínicos: ação hipoglicemiante, antidiarreica, anti-inflamatória, antioxidante, efeitos cardiovasculares leves (hipotensão, diurese).",
      interactions: "não há nenhuma interação medicamentosa descrita ou potencial",
      hasCriticalInteractions: false
    },
    {
      name: "Alfavaca / Manjericão (Ocimum basilicum)",
      howToUse: "formas mais citadas na monografia e no uso tradicional: infusão/decocção/chá das folhas (uso oral mais comum), óleo essencial por inalação ou tópico (sempre diluído).",
      indications: "indicações validadas pela Anvisa com respaldo em propriedades espasmolíticas, carminativas, digestivas e respiratórias.",
      interactions: "não há nenhuma interação medicamentosa descrita ou potencial",
      hasCriticalInteractions: false
    },
    {
      name: "Maracujá-doce (Passiflora alata)",
      howToUse: "formas mais citadas na monografia e no uso tradicional: infusão de folhas e flores (uso mais comum), cápsulas com extrato seco, tintura das folhas e banhos com folhas (uso popular).",
      indications: "formas mais citadas na monografia e no uso tradicional: infusão de folhas e flores (uso mais comum), cápsulas com extrato seco, tintura das folhas e banhos com folhas (uso popular).",
      interactions: "não há nenhuma interação medicamentosa descrita ou potencial",
      hasCriticalInteractions: false
    },
    {
      name: "Maracujá-vermelho (Passiflora edulis)",
      howToUse: "formas mais citadas na monografia e no uso tradicional: infusão de folhas e flores (mais comum), cápsulas com extrato seco, tintura e banhos com folhas",
      indications: "indicações validadas pela Anvisa com respaldo em estudos pré-clínicos: efeito ansiolítico, sedativo, auxílio ao sono, alívio de espasmos e dores leves.",
      interactions: "não há nenhuma interação medicamentosa descrita ou potencial",
      hasCriticalInteractions: false
    },
    {
      name: "Tanchagem (Plantago major)",
      howToUse: "formas mais citadas na monografia e no uso tradicional: infusão/decocção das folhas (uso oral), gargarejo (para garganta), compressa com folhas frescas (uso tópico), suco das folhas (uso popular).",
      indications: "indicações validadas pela Anvisa com respaldo em atividades anti-inflamatória, cicatrizante, antisséptica e antidiarreica.",
      interactions: "não há nenhuma interação medicamentosa descrita ou potencial",
      hasCriticalInteractions: false
    },
    {
      name: "Psyllium (Plantago ovata)",
      howToUse: "pó das sementes hidratado em líquido (uso oral mais comum e essencial para segurança) e cápsulas (forma registrada em fitoterápicos).",
      indications: "indicações validadas pela Anvisa com respaldo em estudos clínicos: ação laxativa suave (formação de massa fecal), efeito hipoglicemiante e hipocolesterolêmico por aumento da viscosidade intestinal e modulação da absorção.",
      interactions: "não há nenhuma interação medicamentosa descrita ou potencial",
      hasCriticalInteractions: false
    },
    {
      name: "Erva-bicho (Phytolacca rivinoides)",
      howToUse: "infusão de folhas, decocção de raízes (uso interno, com cautela), banhos e suco de folhas frescas (uso tópico ou popular).",
      indications: "indicações valadas pela tradição e mencionadas na monografia da Anvisa: ação purgativa/laxante forte, vermífuga, anti-inflamatória e cicatrizante.",
      interactions: "não há nenhuma interação medicamentosa descrita ou potencial",
      hasCriticalInteractions: false
    },
    {
      name: "Cáscara-sagrada (Rhamnus purshiana)",
      howToUse: "a monografia destaca que a casca deve ser envelhecida (seca por 1 ano) antes do uso, para reduzir irritação gástrica. As formas aceitas são extrato seco em cápsulas (padronizado) e infusão/decocção da casca envelhecida.",
      indications: "indicação principal validada pela Anvisa é como laxativo de estímulo, para constipação ocasional. A ação se deve aos antraquinonas, que estimulam a motilidade do cólon.",
      interactions: "a monografia afirma claramente que o uso concomitante com medicamentos que causam perda de potássio (diuréticos tiazídicos, corticosteroides) ou com digitálicos, antiarrítmicos e anticoagulantes é perigoso, pois a hipocalemia induzida pelo laxativo pode potencializar arritmias ou hemorragias",
      hasCriticalInteractions: true
    },
    {
      name: "Arruda (Ruta graveolens)",
      howToUse: "infusão de folhas (oral, com cautela), cápsulas com extrato seco (forma registrada), banhos e suco de folhas (uso tópico).",
      indications: "indicações validadas pela tradição e mencionadas na Anvisa: ação espasmolítica, emenagoga, calmante leve, uso tópico em contusões e feridas",
      interactions: "não há nenhuma interação medicamentosa descrita ou potencial",
      hasCriticalInteractions: false
    },
    {
      name: "Salgueiro-branco (Salix alba)",
      howToUse: "infusão ou decocção da casca do caule (parte utilizada), cápsulas com extrato seco (padronizado).",
      indications: "indicações validadas pela Anvisa com respaldo em estudos farmacológicos: efeito analgésico, antipirético e anti-inflamatório, semelhante à aspirina (ácido acetilsalicílico), devido à presença de salicina, que se converte em ácido salicílico no organismo.",
      interactions: "bem descritas na monografia (seção 4.5.9). A salicina pode potencializar os efeitos de: Anticoagulantes e antiplaquetários → ↑ risco de sangramento; AINEs → ↑ risco de irritação gástrica e efeitos adversos renais; Metotrexato → ↑ toxicidade; Inibidores da ECA e diuréticos → risco de disfunção renal.",
      hasCriticalInteractions: true
    },
    {
      name: "Aroeira (Schinus terebinthifolia)",
      howToUse: "infusão/decocção de folhas (uso oral ou para banhos), pomadas com resina ou extrato (uso tópico), suco de folhas frescas (aplicação local).",
      indications: "formas mais citadas na monografia e no uso tradicional: infusão/decocção de folhas (uso oral ou para banhos), pomadas com resina ou extrato (uso tópico), suco de folhas frescas (aplicação local).",
      interactions: "não há nenhuma interação medicamentosa descrita ou potencial",
      hasCriticalInteractions: false
    },
    {
      name: "Jurubeba (Solanum paniculatum)",
      howToUse: "infusão ou decocção das raízes (uso oral mais comum), cápsulas com extrato seco (em fitoterápicos registrados), banho com folhas (uso popular tópico).",
      indications: "indicações validadas pela Anvisa com respaldo em uso tradicional e estudos pré-clínicos: ação hepatoprotetora, digestiva, estimulante do apetite e febrífuga",
      interactions: "não há nenhuma interação medicamentosa descrita ou potencial",
      hasCriticalInteractions: false
    },
    {
      name: "Barbatimão (Stryphnodendron adstringens)",
      howToUse: "decocção/infusão da casca (uso oral tópico ou para gargarejo), pomadas com extrato (uso tópico), banhos (uso popular).",
      indications: "indicações validadas pela Anvisa com respaldo em atividades anti-inflamatória, cicatrizante, antimicrobiana e adstringente — amplamente utilizadas em infecções mucocutâneas, ginecológicas e bucais.",
      interactions: "não há nenhuma interação medicamentosa descrita ou potencial",
      hasCriticalInteractions: false
    },
    {
      name: "Ipê-roxo (Handroanthus impetiginosus)",
      howToUse: "decocção/infusão da casca do tronco (uso oral ou para banhos), cápsulas com extrato seco (em fitoterápicos registrados).",
      indications: "indicações validadas pela tradição e mencionadas pela Anvisa: ação anti-inflamatória, cicatrizante, antimicrobiana, uso em feridas, úlceras, infecções ginecológicas e gastrointestinais, e como febrífugo.",
      interactions: "não há nenhuma interação medicamentosa descrita ou potencial",
      hasCriticalInteractions: false
    },
    {
      name: "Cravo-de-defunto (Tagetes minuta)",
      howToUse: "infusão/decocção de flores e folhas (uso oral ou tópico), banhos com folhas, pomadas com extrato (uso dermatológico).",
      indications: "indicações validadas pela tradição e mencionadas pela Anvisa: ação antimicrobiana, cicatrizante, anti-inflamatória e digestiva leve.",
      interactions: "não há nenhuma interação medicamentosa descrita ou potencial",
      hasCriticalInteractions: false
    },
    {
      name: "Boldo-da-terra (Vernonia condensata)",
      howToUse: "infusão/decocção de folhas (uso mais comum), suco de folhas frescas (uso popular) e banhos com folhas.",
      indications: "indicações validadas pela Anvisa com respaldo em atividades hepatoprotetora e digestiva — especialmente contra distúrbios gastrointestinais leves, como cólicas, flatulência e náuseas.",
      interactions: "não há nenhuma interação medicamentosa descrita ou potencial",
      hasCriticalInteractions: false
    },
    {
      name: "Asa-de-peixe (Justicia pectoralis)",
      howToUse: "infusão/decocção de folhas (uso oral), banhos e suco de folhas frescas (uso tópico ou popular).",
      indications: "indicações validadas pela tradição e mencionadas pela Anvisa: ação analgésica leve, anti-inflamatória, antiespasmódica e uso em quadros respiratórios obstrutivos (asma, bronquite) e traumáticos (contusões, dores articulares).",
      interactions: "não há nenhuma interação medicamentosa descrita ou potencial",
      hasCriticalInteractions: false
    }
  ];

  const handleToggle = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredItems = fitoterapicos.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.indications.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.interactions.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            Fitoterápicos
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold mt-1">
            Lista de fitoterápicos validados pela Anvisa com informações de preparo, uso e interações.
          </p>
        </div>
      </div>

      {/* Primary Educational Box - styled identically to screenshot */}
      <div className="p-5 md:p-6 bg-emerald-50 dark:bg-[#1a2d22] border border-emerald-100 dark:border-emerald-900/30 rounded-3xl space-y-3 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#00aa74] text-white flex items-center justify-center shadow-xs shrink-0">
            <Leaf size={16} />
          </div>
          <h4 className="text-sm font-black text-emerald-950 dark:text-emerald-300">
            O que são Fitoterápicos?
          </h4>
        </div>
        
        <p className="text-xs font-bold text-emerald-900 dark:text-zinc-300 leading-relaxed">
          Medicamentos obtidos a partir de plantas medicinais, com eficácia e segurança comprovadas por estudos.
        </p>
        <p className="text-xs font-semibold text-emerald-800/90 dark:text-zinc-400 leading-relaxed">
          Diferente de chás caseiros, os fitoterápicos são industrializados e passam por um rigoroso controle de qualidade. Eles são uma opção terapêutica validada pela Anvisa para diversas condições de saúde.
        </p>
        <div className="pt-2 border-t border-emerald-200/50 dark:border-emerald-900/30">
          <p className="text-xs font-black text-[#dc2626] dark:text-rose-400 leading-relaxed italic">
            Atenção: Mesmo sendo de origem natural, fitoterápicos podem causar reações adversas e interagir com outros medicamentos. Sempre consulte um profissional de saúde antes de usar.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="mb-6 relative">
        <Search className="absolute left-4 top-3.5 text-zinc-400 dark:text-zinc-500" size={18} />
        <input
          type="text"
          placeholder="Buscar fitoterápico (ex: Alho, Camomila, interações...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white dark:bg-[#242b38] border border-zinc-150/55 dark:border-zinc-850 pl-11 pr-5 py-3.5 rounded-2xl text-xs font-semibold text-zinc-800 dark:text-zinc-200 shadow-xs focus:ring-2 focus:ring-[#00aa74]/20 focus:border-[#00aa74] outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
        />
      </div>

      {/* Accordions Container */}
      <div className="bg-white dark:bg-[#242b38] border border-zinc-150/55 dark:border-zinc-800 rounded-[2rem] p-6 shadow-xs space-y-4">
        
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-2">
          <h3 className="text-sm font-black text-zinc-950 dark:text-white uppercase tracking-tight">
            Lista de Fitoterápicos (Anvisa)
          </h3>
          <span className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">
            {filteredItems.length} plantas correspondentes
          </span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
              Nenhum fitoterápico encontrado para a busca inserida.
            </p>
            <button 
              onClick={() => setSearchTerm('')} 
              className="text-xs font-black text-[#00aa74] hover:underline"
            >
              Limpar filtros de busca
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredItems.map((item, idx) => {
              const isExpanded = expandedId === item.name;
              return (
                <div 
                  key={idx}
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isExpanded 
                      ? (item.hasCriticalInteractions 
                          ? 'border-orange-200 dark:border-orange-950 bg-orange-50/10 dark:bg-orange-950/5'
                          : 'border-emerald-200 dark:border-emerald-950 bg-emerald-50/10 dark:bg-emerald-950/5')
                      : 'border-zinc-100/80 dark:border-zinc-800 bg-white dark:bg-[#1f2632]'
                  }`}
                >
                  {/* Header Button */}
                  <button
                    onClick={() => handleToggle(item.name)}
                    className="w-full flex items-center justify-between p-4.5 text-left outline-none cursor-pointer focus:bg-zinc-50/30 dark:focus:bg-zinc-800/10"
                  >
                    <div className="flex items-center gap-3">
                      {item.hasCriticalInteractions ? (
                        <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/30 text-orange-500 shrink-0">
                          <AlertTriangle size={15} className="animate-pulse" />
                        </div>
                      ) : (
                        <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-[#00aa74] shrink-0">
                          <CheckCircle2 size={15} />
                        </div>
                      )}
                      <span className={`text-xs font-extrabold tracking-tight ${
                        item.hasCriticalInteractions 
                          ? 'text-orange-650 dark:text-orange-400 font-black' 
                          : 'text-zinc-800 dark:text-zinc-200'
                      }`}>
                        {item.name}
                      </span>
                    </div>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-zinc-400 dark:text-zinc-500 shrink-0"
                    >
                      <ChevronDown size={16} className="stroke-[2.5]" />
                    </motion.div>
                  </button>

                  {/* Expanded Body Panel */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-zinc-100/50 dark:border-zinc-800/50"
                      >
                        <div className="p-4.5 space-y-4 bg-zinc-50/40 dark:bg-zinc-900/30 text-xs">
                          {/* Modo de Tomar ou Usar */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase text-zinc-450 dark:text-zinc-500 tracking-wider block">
                              Modo de Tomar ou Usar:
                            </span>
                            <p className="font-semibold text-zinc-700 dark:text-zinc-300 leading-relaxed">
                              {item.howToUse}
                            </p>
                          </div>

                          {/* Indicações */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase text-zinc-450 dark:text-zinc-500 tracking-wider block">
                              Indicações:
                            </span>
                            <p className="font-semibold text-zinc-700 dark:text-zinc-300 leading-relaxed">
                              {item.indications}
                            </p>
                          </div>

                          {/* Interações */}
                          <div className={`p-3 rounded-xl border space-y-1.5 ${
                            item.hasCriticalInteractions 
                              ? 'bg-amber-50/40 dark:bg-amber-950/10 border-amber-100/60 dark:border-amber-900/20' 
                              : 'bg-emerald-50/20 dark:bg-emerald-950/5 border-emerald-100/50 dark:border-emerald-900/10'
                          }`}>
                            <div className="flex items-center gap-1.5">
                              {item.hasCriticalInteractions ? (
                                <AlertTriangle size={13} className="text-amber-600 dark:text-amber-400" />
                              ) : (
                                <ShieldCheck size={13} className="text-emerald-600 dark:text-emerald-400" />
                              )}
                              <span className={`text-[10px] font-black uppercase tracking-wider ${
                                item.hasCriticalInteractions ? 'text-amber-850 dark:text-amber-300' : 'text-emerald-850 dark:text-emerald-300'
                              }`}>
                                Interações Medicamentosas:
                              </span>
                            </div>
                            <p className={`font-semibold leading-relaxed ${
                              item.hasCriticalInteractions ? 'text-amber-900 dark:text-amber-200' : 'text-zinc-600 dark:text-zinc-400'
                            }`}>
                              {item.interactions}
                            </p>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
