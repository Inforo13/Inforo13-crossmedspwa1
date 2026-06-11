import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, Sparkles, Printer, User, Activity, AlertTriangle, 
  Check, FileText, Shield, Bot, Info, RefreshCw, Plus, Trash2
} from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';
import { Medication } from '../types';
import beersData from '../data/beers_criteria_2023.json';

interface Props {
  onBack: () => void;
  medications: Medication[];
  darkMode: boolean;
}

interface TreatmentAnalysis {
  resumo: string;
  interacoes: Array<{
    medicamentos: string;
    gravidade: 'Leve' | 'Moderada' | 'Grave' | 'Crítica';
    sintomas: string;
    recomendacao: string;
  }>;
  alertasBeers: Array<{
    titulo: string;
    descricao: string;
  }>;
  pontosAtencao: string[];
  perguntasMedico: string[];
}

export const TreatmentAnalysisPage: React.FC<Props> = ({ onBack, medications, darkMode }) => {
  // Load patient clinical profile from localStorage
  const [profile, setProfile] = useState({
    nomeCompleto: 'Jeferson Saconato',
    idade: '',
    sexo: 'Masculino' as 'Masculino' | 'Feminino',
    peso: '',
    altura: '',
    pressaoSistolica: '',
    profileDiastolic: '',
    glicemia: '',
    colesterol: '',
    hba1cLab: ''
  });

  const [activeMeds, setActiveMeds] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<TreatmentAnalysis | null>(null);
  const [analysisDate, setAnalysisDate] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Helper to update specific profile fields dynamically and sync them with the primary localStorage record
  const updateProfileField = (fieldName: string, value: string) => {
    const updated = { ...profile, [fieldName]: value };
    setProfile(prev => ({ ...prev, [fieldName]: value }));
    
    // Save to localStorage immediately so that other portals keep synchronized
    const saved = localStorage.getItem('crossmeds_patient_profile');
    let current = {};
    if (saved) {
      try {
        current = JSON.parse(saved);
      } catch (_) {}
    }
    const finalProfile = { ...current, ...updated };
    localStorage.setItem('crossmeds_patient_profile', JSON.stringify(finalProfile));
  };

  // Load patient profile and set default demonstration medicines if actual medications is empty
  useEffect(() => {
    const saved = localStorage.getItem('crossmeds_patient_profile');
    let loadedProfile = {
      nomeCompleto: 'Jeferson Saconato',
      idade: '',
      sexo: 'Masculino' as 'Masculino' | 'Feminino',
      peso: '',
      altura: '',
      pressaoSistolica: '',
      profileDiastolic: '',
      glicemia: '',
      colesterol: '',
      hba1cLab: ''
    };
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.nomeCompleto !== undefined) loadedProfile.nomeCompleto = data.nomeCompleto;
        if (data.idade !== undefined) loadedProfile.idade = data.idade;
        if (data.sexo !== undefined) loadedProfile.sexo = data.sexo;
        if (data.peso !== undefined) loadedProfile.peso = data.peso;
        if (data.altura !== undefined) loadedProfile.altura = data.altura;
        if (data.pressaoSistolica !== undefined) loadedProfile.pressaoSistolica = data.pressaoSistolica;
        if (data.profileDiastolic !== undefined) loadedProfile.profileDiastolic = data.profileDiastolic;
        if (data.glicemia !== undefined) loadedProfile.glicemia = data.glicemia;
        if (data.colesterol !== undefined) loadedProfile.colesterol = data.colesterol;
        if (data.hba1cLab !== undefined) loadedProfile.hba1cLab = data.hba1cLab;
      } catch (e) {
        console.error('Erro ao ler perfil do paciente', e);
      }
    }
    setProfile(loadedProfile);

    // Set active medications. If none are registered, prefill with Jeferson's iconic medications from screenshot for flawless demonstration
    if (medications && medications.length > 0) {
      setActiveMeds(medications);
    } else {
      // Demo Medications from PDF screenshot
      const demoMeds: Medication[] = [
        {
          id: 'demo-1',
          userId: 'demo',
          name: 'LOSARTANA POTÁSSICA',
          dosage: '50mg',
          times: ['08:00'],
          time: '08:00',
          frequency: 'Diário',
          howToTake: 'Com água',
          type: 'REGULADO',
          color: '#3b82f6',
          startDate: '2026-03-31',
          active: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 'demo-2',
          userId: 'demo',
          name: 'AAS ÁCIDO ACETILSALICÍLICO',
          dosage: '100mg',
          times: ['08:00'],
          time: '08:00',
          frequency: 'Diário',
          howToTake: 'Com água',
          type: 'REGULADO',
          color: '#ef4444',
          startDate: '2026-03-31',
          active: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 'demo-3',
          userId: 'demo',
          name: 'AMITRIPTILINA',
          dosage: '25mg',
          times: ['21:00'],
          time: '21:00',
          frequency: 'Diário',
          howToTake: 'Com água',
          type: 'REGULADO',
          color: '#8b5cf6',
          startDate: '2026-03-31',
          active: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 'demo-4',
          userId: 'demo',
          name: 'ESPIRONOLACTONA',
          dosage: '25mg',
          times: ['08:00'],
          time: '08:00',
          frequency: 'Diário',
          howToTake: 'Com água',
          type: 'REGULADO',
          color: '#10b981',
          startDate: '2026-03-31',
          active: true,
          createdAt: new Date().toISOString()
        }
      ];
      setActiveMeds(demoMeds);
    }

    // Load existing analysis if saved in session/localStorage to prevent redundant API calls
    const savedAnalysis = localStorage.getItem('crossmeds_treatment_analysis_cache');
    const savedAnalysisDate = localStorage.getItem('crossmeds_treatment_analysis_date');
    if (savedAnalysis) {
      try {
        setAnalysis(JSON.parse(savedAnalysis));
        if (savedAnalysisDate) setAnalysisDate(savedAnalysisDate);
      } catch (_) {}
    }
  }, [medications]);

  // Handle triggering dynamic demo dataset
  const prefillDemoTreatment = () => {
    const demoMeds: Medication[] = [
      {
        id: 'demo-1',
        userId: 'demo',
        name: 'LOSARTANA POTÁSSICA',
        dosage: '50mg',
        times: ['08:00'],
        time: '08:00',
        frequency: 'Diário',
        howToTake: 'Com água',
        type: 'REGULADO',
        color: '#3b82f6',
        startDate: '2026-03-31',
        active: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo-2',
        userId: 'demo',
        name: 'AAS ÁCIDO ACETILSALICÍLICO',
        dosage: '100mg',
        times: ['08:00'],
        time: '08:00',
        frequency: 'Diário',
        howToTake: 'Com água',
        type: 'REGULADO',
        color: '#ef4444',
        startDate: '2026-03-31',
        active: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo-3',
        userId: 'demo',
        name: 'AMITRIPTILINA',
        dosage: '25mg',
        times: ['21:00'],
        time: '21:00',
        frequency: 'Diário',
        howToTake: 'Com água',
        type: 'REGULADO',
        color: '#8b5cf6',
        startDate: '2026-03-31',
        active: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo-4',
        userId: 'demo',
        name: 'ESPIRONOLACTONA',
        dosage: '25mg',
        times: ['08:00'],
        time: '08:00',
        frequency: 'Diário',
        howToTake: 'Com água',
        type: 'REGULADO',
        color: '#10b981',
        startDate: '2026-03-31',
        active: true,
        createdAt: new Date().toISOString()
      }
    ];
    setActiveMeds(demoMeds);
    
    const demoProfile = {
      nomeCompleto: 'Jeferson Charles Saconato',
      idade: '66',
      sexo: 'Masculino',
      peso: '78',
      altura: '1.75',
      pressaoSistolica: '130',
      profileDiastolic: '79',
      glicemia: '120',
      colesterol: '190',
      hba1cLab: '5.9'
    };
    setProfile(demoProfile);
    localStorage.setItem('crossmeds_patient_profile', JSON.stringify(demoProfile));
  };

  // Helper to find exact matches from Beers criteria database based on patient profile
  const findLocalBeersAlerts = (meds: Medication[], age: number) => {
    if (age < 65) return { evitar: [], usarComCautela: [], interacoes: [] };
    
    const evitarMatches: any[] = [];
    const cautelaMatches: any[] = [];
    const interacaoMatches: any[] = [];
    
    const names = meds.map(m => m.name.toUpperCase());
    
    // Evitar independente de condição
    beersData.evitar_independente_condicao.forEach(item => {
      const substanceUpper = item.substancia.toUpperCase();
      if (names.some(name => name.includes(substanceUpper))) {
        evitarMatches.push(item);
      }
    });

    // Usar com cautela (including classes like ISRS or Diuréticos)
    beersData.usar_com_cautela.forEach(item => {
      const substanceUpper = item.substancia.toUpperCase();
      if (names.some(name => name.includes(substanceUpper))) {
        cautelaMatches.push(item);
      }
      
      // Class checks
      if (item.substancia === 'Aspirina' && names.some(name => name.includes('AAS') || name.includes('ACETILSALICILICO') || name.includes('ASPIRINA'))) {
        cautelaMatches.push(item);
      }
      if (item.substancia === 'Diuréticos' && names.some(name => name.includes('ESPIRONOLACTONA') || name.includes('HIDROCLOROTIAZIDA') || name.includes('FUROSEMIDA') || name.includes('INDAPAMIDA') || name.includes('CLORTALIDONA'))) {
        cautelaMatches.push(item);
      }
      if (item.substancia === 'ISRS' && names.some(name => name.includes('SERTRALINA') || name.includes('FLUOXETINA') || name.includes('ESCITALOPRAM') || name.includes('CITALOPRAM') || name.includes('PAROXETINA') || name.includes('FLUVOXAMINA'))) {
        cautelaMatches.push(item);
      }
    });

    // Interações relevantes
    // 1. IECA ou BRA + Diurético poupador de potássio (ex: Losartana + Espironolactona)
    const hasBRAoIECA = names.some(name => 
      name.includes('LOSARTANA') || name.includes('ENALAPRIL') || name.includes('CAPTOPRIL') || name.includes('RAMIPRIL') || name.includes('VALSARTANA') || name.includes('CANDESARTANA') || name.includes('PERINDOPRIL') || name.includes('BENAZEPRIL')
    );
    const hasPoupadorPotassio = names.some(name => name.includes('ESPIRONOLACTONA') || name.includes('AMILORIDA'));
    if (hasBRAoIECA && hasPoupadorPotassio) {
      const match = beersData.interacoes_relevantes.find(i => i.medicamento_1 === 'IECA ou BRA' && i.medicamento_2 === 'Diurético poupador de potássio');
      if (match) interacaoMatches.push({ ...match, medicamento_1: 'IECA ou BRA (ex: Losartana)', medicamento_2: 'Diurético poupador (ex: Espironolactona)' });
    }

    // 2. Benzodiazepínico + outro depressor SNC (ex: Clonazepam / Diazepam + Amitriptilina)
    const hasBenzo = names.some(name => name.includes('DIAZEPAM') || name.includes('CLONAZEPAM') || name.includes('ALPRAZOLAM') || name.includes('BROMAZEPAM') || name.includes('MIDAZOLAM') || name.includes('LORAZEPAM'));
    const hasTriciclico = names.some(name => name.includes('AMITRIPTILINA') || name.includes('IMIPRAMINA') || name.includes('NORTRIPTILINA') || name.includes('CLOMIPRAMINA'));
    if (hasBenzo && hasTriciclico) {
      const match = beersData.interacoes_relevantes.find(i => i.medicamento_1 === 'Benzodiazepínico' && i.medicamento_2 === 'Outro depressor do SNC');
      if (match) interacaoMatches.push(match);
    }

    // 3. Varfarina + AINE
    const hasVarfarina = names.some(name => name.includes('VARFARINA') || name.includes('MAREVAN') || name.includes('COUMADIN'));
    const hasAINE = names.some(name => name.includes('AAS') || name.includes('ACETILSALICILICO') || name.includes('IBUPROFENO') || name.includes('DICLOFENACO') || name.includes('NIMESULIDA') || name.includes('CETOPROFENO') || name.includes('MELOXICAM') || name.includes('PIROXICAM') || name.includes('NAPROXENO'));
    if (hasVarfarina && hasAINE) {
      const match = beersData.interacoes_relevantes.find(i => i.medicamento_1 === 'Varfarina' && i.medicamento_2 === 'AINE');
      if (match) interacaoMatches.push(match);
    }

    return { evitar: evitarMatches, usarComCautela: cautelaMatches, interacoes: interacaoMatches };
  };

  // Run structured treatment analysis targeting Gemini
  const runTreatmentAnalysis = async () => {
    if (!process.env.GEMINI_API_KEY) {
      setErrorMsg('A chave da API Gemini não está configurada na sua conta. Adicione-a para executar.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const medsString = activeMeds.map(m => {
        let text = `- ${m.name} (${m.dosage})`;
        if (m.frequency) text += ` - Frequência: ${m.frequency}`;
        if (m.times && m.times.length > 0) text += ` - Horários: ${m.times.join(', ')}`;
        if (m.howToTake) text += ` - Obs: ${m.howToTake}`;
        return text;
      }).join('\n');

      const userAgeNum = parseInt(profile.idade) || 66;

      // Extract local matched Beers items to guide the model with 100% accurate textbook criteria database
      const localBeersMatches = findLocalBeersAlerts(activeMeds, userAgeNum);
      const localBeersMatchesStr = JSON.stringify(localBeersMatches, null, 2);

      const prompt = `
        Analise o tratamento completo do paciente de forma profissional.
        
        DADOS DO PACIENTE:
        - Nome: ${profile.nomeCompleto}
        - Idade: ${profile.idade} anos
        - Sexo: ${profile.sexo}
        - Pressão Arterial: ${profile.pressaoSistolica}/${profile.profileDiastolic} mmHg
        - Glicemia de Jejum: ${profile.glicemia} mg/dL
        - Colesterol Total: ${profile.colesterol} mg/dL
        - Hemoglobina Glicada (HbA1c): ${profile.hba1cLab}%
        
        MEDICAMENTOS ATIVOS:
        ${medsString || 'Nenhum medicamento ativo cadastrado'}

        CRITÉRIOS DE BEERS (2023) DETECTADOS LOCALMENTE NESTE TRATAMENTO (NÃO ALUCINE):
        ${localBeersMatchesStr}

        DIRETRIZES DE ANÁLISE CLÍNICA:
        1. Resumo Geral do Tratamento: Faça um resumo consolidando o perfil, finalidade dos medicamentos, estado da pressão arterial (está controlada ou não?) e glicemia, e dê orientações.
        2. Interações Medicamentosas: Identifique as principais interações farmacológicas graves ou moderadas (ex: Losartana + Espironolactona aumenta risco de Hipercalemia).
        3. CRITÉRIOS DE BEERS (ESSENCIAL):
           Se a idade do paciente for 65 ou mais (idade atual: ${userAgeNum} anos), você deve aplicar estritamente os Critérios de Beers (Critérios AGS de 2023 para medicamentos potencialmente inapropriados em idosos).
           Escreva os alertas baseando-se estritamente nas correspondências fornecidas acima (ex: AMITRIPTILINA deve ser evitada por risco anticolinérgico/sedação/queda, ESPIRONOLACTONA + LOSARTANA requer extrema cautela por risco de hipercalemia).
           Se não há correspondências locais acima mas existem outros sedativos ou benzodiazepínicos, alerte devidamente.
        4. Pontos de Atenção: Principais cuidados específicos práticos de dosagem ou sintomas que o paciente deve observar.
        5. Perguntas para levar ao Médico: Três ou quatro perguntas práticas e pertinentes que o paciente pode fazer diretamente ao médico na próxima consulta.

        Você deve obrigatoriamente retornar a resposta em um bloco JSON que siga rigorosamente o seguinte esquema:
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              resumo: { type: Type.STRING, description: 'Resumo geral em formato de texto, unindo profil de exames e medicamentos' },
              interacoes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    medicamentos: { type: Type.STRING, description: 'Ex: LOSARTANA POTÁSSICA + ESPIRONOLACTONA' },
                    gravidade: { type: Type.STRING, description: 'Pode ser Grave, Moderada, Leve ou Crítica' },
                    sintomas: { type: Type.STRING, description: 'Sintomas causados pela interação' },
                    recomendacao: { type: Type.STRING, description: 'Recomendação clínica prática' }
                  },
                  required: ['medicamentos', 'gravidade', 'sintomas', 'recomendacao']
                }
              },
              alertasBeers: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    titulo: { type: Type.STRING, description: 'Ex: Cuidado com Amitriptilina ou Cuidado com Espironolactona em combinação com Losartana' },
                    descricao: { type: Type.STRING, description: 'Explicação detalhada referenciando o risco ou queda/hipercalemia e indicação de evitar no idoso, embasado nos critérios de Beers.' }
                  },
                  required: ['titulo', 'descricao']
                }
              },
              pontosAtencao: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Lista de pontos aos quais o paciente deve ficar atento.'
              },
              perguntasMedico: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Perguntas formuladas para o clínico/geriatra.'
              }
            },
            required: ['resumo', 'interacoes', 'alertasBeers', 'pontosAtencao', 'perguntasMedico']
          }
        }
      });

      const resultText = response.text || '';
      const parsed = JSON.parse(resultText) as TreatmentAnalysis;

      const now = new Date();
      const pad = (num: number) => String(num).padStart(2, '0');
      const formattedDate = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} às ${pad(now.getHours())}:${pad(now.getMinutes())}`;

      setAnalysis(parsed);
      setAnalysisDate(formattedDate);

      // Save to cache
      localStorage.setItem('crossmeds_treatment_analysis_cache', JSON.stringify(parsed));
      localStorage.setItem('crossmeds_treatment_analysis_date', formattedDate);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Erro ao tentar processar a análise com a inteligência artificial. Verifique suas configurações.');
    } finally {
      setIsLoading(false);
    }
  };

  // Print function matching the exact viewport shown in the screen
  const handlePrint = () => {
    window.print();
  };

  const isEldery = parseInt(profile.idade) >= 65;

  return (
    <div className="space-y-6 pt-2 pb-12 max-w-3xl mx-auto selection:bg-emerald-100 print:max-w-full print:p-0 print:m-0">
      
      {/* Non-printing dynamic section controls */}
      <div className="flex justify-between items-center print:hidden">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-3.5 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-sm bg-white dark:bg-[#242b38] hover:bg-zinc-50 dark:hover:bg-[#2c3547] text-zinc-700 dark:text-zinc-300 border border-zinc-150/55 dark:border-zinc-800"
          >
            <ChevronLeft size={18} className="stroke-[3]" />
          </button>
          <div>
            <h2 className="text-2.5xl font-black text-zinc-900 dark:text-white tracking-tight leading-none">
              Análise de Tratamento
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold mt-1">
              Avaliação de interações e revisão de critérios de segurança médica.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {analysis && (
            <button
              onClick={handlePrint}
              className="px-4 py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 rounded-xl font-bold flex items-center gap-2 transition-all text-sm border border-zinc-200/50 dark:border-zinc-700/50 cursor-pointer"
            >
              <Printer size={16} />
              Imprimir
            </button>
          )}

          <button
            onClick={prefillDemoTreatment}
            className="px-4 py-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-100/70 transition-all text-sm border border-emerald-100/30 cursor-pointer"
            title="Preencher com os dados do prontuário do Jeferson (66 anos) para demonstração"
          >
            <RefreshCw size={16} />
            Dados Demo (PDF)
          </button>
        </div>
      </div>

      {/* Hero interactive analysis card */}
      {!analysis && !isLoading && (
        <div className="bg-white dark:bg-[#242b38] border border-zinc-150/55 dark:border-zinc-800 rounded-[2.5rem] p-8 text-center space-y-6 print:hidden">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-[#e2f8f0] text-[#00aa74] rounded-full flex items-center justify-center mb-4 shadow-sm">
              <Sparkles size={28} className="stroke-[2.5]" />
            </div>
            <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight leading-none">
              Análise de Tratamento por IA
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-md mt-3 leading-relaxed">
              Use a IA para obter insights sobre seu tratamento atual, identificar pontos de atenção e preparar-se para sua próxima consulta médica. A data e hora serão registradas junto com o resultado.
            </p>
          </div>

          {/* Quick interactive fields for demographic tweak */}
          <div className="bg-zinc-50 dark:bg-zinc-900/55 p-5 rounded-3xl border border-zinc-100 dark:border-zinc-850 text-left space-y-4">
            <h4 className="text-xs font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Parâmetros Atuais do Paciente</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-450 dark:text-zinc-450 uppercase mb-1">Nome</label>
                <input 
                  type="text" 
                  value={profile.nomeCompleto} 
                  onChange={e => updateProfileField('nomeCompleto', e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-800 dark:text-white font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-450 dark:text-zinc-450 uppercase mb-1">Idade</label>
                <input 
                  type="number" 
                  value={profile.idade} 
                  onChange={e => updateProfileField('idade', e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-800 dark:text-white font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-450 dark:text-zinc-450 uppercase mb-1">Pressão Sistólica</label>
                <input 
                  type="number" 
                  value={profile.pressaoSistolica} 
                  onChange={e => updateProfileField('pressaoSistolica', e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-800 dark:text-white font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-450 dark:text-zinc-450 uppercase mb-1">Glicemia (mg/dL)</label>
                <input 
                  type="number" 
                  value={profile.glicemia} 
                  onChange={e => updateProfileField('glicemia', e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-800 dark:text-white font-semibold"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
              <span className="font-semibold">Fármacos no prontuário: <strong className="text-[#0fb383]">{activeMeds.length} ativos</strong></span>
              {isEldery && (
                <span className="px-2.5 py-0.5 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 font-extrabold rounded-md uppercase tracking-wider text-[9px] border border-amber-100 dark:border-amber-950/30 animate-pulse">
                  Foco: Geriatria (≥ 65)
                </span>
              )}
            </div>
          </div>

          <button
            onClick={runTreatmentAnalysis}
            className="w-full py-4.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-sm uppercase tracking-wider rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/10 cursor-pointer"
          >
            <Sparkles size={18} />
            Analisar Tratamento com IA
          </button>
        </div>
      )}

      {/* Loading analysis state */}
      {isLoading && (
        <div className="bg-white dark:bg-[#242b38] border border-zinc-150/55 dark:border-zinc-800 rounded-[2.5rem] p-12 text-center space-y-6 print:hidden">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/35 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center animate-spin mb-4">
              <RefreshCw size={28} className="stroke-[2.5]" />
            </div>
            <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">Análise em Processamento...</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-sm mt-2 font-medium">
              Consultando base offline, verificando banco de interações cruzadas e aplicando diretivas dos Critérios de Beers...
            </p>
          </div>
        </div>
      )}

      {/* Masterclass High Fidelity Printable Report View */}
      {analysis && !isLoading && (
        <div className="bg-white dark:bg-[#1a2232] rounded-[2.5rem] border border-zinc-150/55 dark:border-zinc-800 shadow-xl overflow-hidden print:shadow-none print:border-none print:rounded-none">
          
          {/* PDF style top margin headers */}
          <div className="p-8 md:p-10 border-b border-zinc-100 dark:border-zinc-800 space-y-6 bg-gradient-to-b from-zinc-50/50 to-white dark:from-zinc-900/20 dark:to-[#1a2232] print:p-0 print:border-b-2 print:border-zinc-300">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-black text-2xl tracking-tighter">Cross<span className="text-zinc-850 dark:text-white">Meds</span></span>
              </div>
              <div className="text-right">
                <h4 className="text-[11px] font-black uppercase text-zinc-400 tracking-wider">Análise de Tratamento por IA</h4>
                <p className="text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-850 dark:text-zinc-400 py-1 px-3.5 rounded-full mt-1.5 font-bold print:bg-transparent print:p-0">
                  {analysisDate || '07/06/2026 às 23:20'}
                </p>
              </div>
            </div>

            {/* Patient Header Block */}
            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                  <User size={22} className="stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white">{profile.nomeCompleto}</h3>
                  <div className="flex items-center gap-2.5 mt-1 text-xs text-zinc-500 font-bold">
                    <span>Idade: <strong>{profile.idade} anos</strong></span>
                    <span>•</span>
                    <span>Sexo: <strong>{profile.sexo}</strong></span>
                    <span>•</span>
                    <span>Peso: <strong>{profile.peso}kg</strong></span>
                  </div>
                </div>
              </div>

              {/* Beers applied tag */}
              {isEldery && (
                <div className="px-5 py-2.5 bg-orange-50 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400 font-black text-[11px] uppercase tracking-wider rounded-2xl border border-orange-100 dark:border-orange-900 flex items-center gap-2 self-start md:self-auto animate-pulse">
                  <AlertTriangle size={15} />
                  Critérios de Beers aplicados (≥ 65 anos)
                </div>
              )}
            </div>
          </div>

          {/* Report Body */}
          <div className="p-8 md:p-10 space-y-8.5 print:p-0 print:pt-6">
            
            {/* Medications Bullet section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-500"></div>
                <h4 className="text-sm font-black uppercase text-zinc-850 dark:text-white tracking-wider">Medicamentos em Uso</h4>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pl-1.5 font-bold text-sm text-zinc-750 dark:text-zinc-300">
                {activeMeds.map((med, idx) => (
                  <li key={idx} className="flex items-center gap-3.5 bg-zinc-50/50 dark:bg-zinc-900/35 p-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-850 shadow-2xs">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: med.color || '#0fb383' }}></div>
                    <span>
                      {med.name.toUpperCase()} - {med.dosage}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* General Description Summary */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
                <div className="w-3.5 h-3.5 rounded-full bg-sky-500"></div>
                <h4 className="text-sm font-black uppercase text-zinc-850 dark:text-white tracking-wider font-extrabold">Resumo Geral do Tratamento</h4>
              </div>
              <p className="text-zinc-700 dark:text-zinc-350 text-sm leading-relaxed font-semibold bg-sky-50/20 dark:bg-sky-950/5 border border-sky-100/30 dark:border-sky-950/20 p-5 rounded-3xl">
                {analysis.resumo}
              </p>
            </div>

            {/* Drug Interactions detected */}
            {analysis.interacoes && analysis.interacoes.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-orange-500"></div>
                  <h4 className="text-sm font-black uppercase text-zinc-850 dark:text-white tracking-wider font-extrabold">Interações Medicamentosaas Detectadas</h4>
                </div>
                <div className="space-y-4">
                  {analysis.interacoes.map((item, idx) => (
                    <div key={idx} className="p-5.5 bg-zinc-50 dark:bg-zinc-900/55 rounded-3xl border border-zinc-100 dark:border-zinc-850 space-y-3">
                      <div className="flex justify-between items-center">
                        <h5 className="font-black text-sm text-zinc-900 dark:text-white tracking-tight uppercase">{item.medicamentos}</h5>
                        <span className={`px-3 py-1 text-[10px] font-black rounded-full border uppercase tracking-wider ${
                          item.gravidade === 'Grave' || item.gravidade === 'Crítica'
                            ? 'bg-red-50 text-red-700 border-red-100'
                            : 'bg-amber-100 text-amber-700 border-amber-200'
                        }`}>
                          {item.gravidade}
                        </span>
                      </div>
                      <div className="text-xs space-y-2 text-zinc-750 dark:text-zinc-350 font-semibold leading-relaxed">
                        <p><strong>Sintomas:</strong> {item.sintomas}</p>
                        <p><strong>Recomendação:</strong> {item.recomendacao}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Beers Criteria Section */}
            {isEldery && analysis.alertasBeers && analysis.alertasBeers.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-pulse"></div>
                  <h4 className="text-sm font-black uppercase text-zinc-850 dark:text-white tracking-wider font-extrabold">Alertas de Segurança (Critérios de Beers)</h4>
                </div>
                <div className="space-y-4">
                  {analysis.alertasBeers.map((alerta, idx) => (
                    <div key={idx} className="p-5 bg-rose-50/50 dark:bg-rose-950/15 border-1.5 border-rose-100 dark:border-rose-950/35 rounded-3xl flex gap-4 items-start">
                      <AlertTriangle className="text-rose-500 dark:text-rose-450 shrink-0 mt-0.5" size={20} />
                      <div className="space-y-1.5 font-semibold leading-relaxed text-xs">
                        <h5 className="font-extrabold text-zinc-900 dark:text-zinc-200 text-sm">{alerta.titulo}</h5>
                        <p className="text-zinc-650 dark:text-zinc-400">{alerta.descricao}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pontos de atenção bullet layout */}
            {analysis.pontosAtencao && analysis.pontosAtencao.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-indigo-500"></div>
                  <h4 className="text-sm font-black uppercase text-zinc-850 dark:text-white tracking-wider font-extrabold">Pontos de Atenção</h4>
                </div>
                <ul className="space-y-3 pl-1.5 font-bold text-sm text-zinc-700 dark:text-zinc-350 leading-relaxed list-inside">
                  {analysis.pontosAtencao.map((ponto, idx) => (
                    <li key={idx} className="flex gap-3.5 items-start">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-2"></span>
                      <span>{ponto}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Perguntas para o médico card */}
            {analysis.perguntasMedico && analysis.perguntasMedico.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-violet-600"></div>
                  <h4 className="text-sm font-black uppercase text-zinc-850 dark:text-white tracking-wider font-extrabold">Perguntas para Levar ao Médico</h4>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {analysis.perguntasMedico.map((perg, idx) => (
                    <div key={idx} className="p-4 bg-violet-50/25 dark:bg-[#1a212d] border border-violet-100/50 dark:border-zinc-800 rounded-2xl flex items-center gap-4 text-xs font-bold text-violet-950 dark:text-indigo-300">
                      <div className="w-7 h-7 bg-violet-100 dark:bg-zinc-800 text-violet-700 dark:text-indigo-400 rounded-lg flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>
                      <p className="leading-relaxed font-extrabold">{perg}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PDF Legal Disclaimer warning Box */}
            <div className="p-5.5 bg-zinc-50 dark:bg-zinc-900/55 rounded-3xl border border-zinc-150/45 dark:border-zinc-850 text-center space-y-2">
              <p className="text-[11px] text-zinc-500 dark:text-zinc-450 leading-relaxed font-semibold">
                ⚕️ Esta análise é gerada por IA e tem fins puramente educacionais e informativos.<br />
                Ela NÃO substitui de forma alguma o diagnóstico, a prescrição ou o acompanhamento de um médico ou farmacêutico.<br />
                <strong>NUNCA altere seu tratamento sem consultar um profissional de saúde qualificado.</strong>
              </p>
              <div className="pt-3 border-t border-zinc-150/55 dark:border-zinc-850 text-[10px] text-zinc-400 dark:text-zinc-500 font-black">
                Gerado pelo CrossMeds · {analysisDate}
              </div>
            </div>

          </div>

          {/* Trigger to restart / delete analysis Cache */}
          <div className="p-8 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/25 flex justify-end gap-3 print:hidden">
            <button
              onClick={() => {
                localStorage.removeItem('crossmeds_treatment_analysis_cache');
                localStorage.removeItem('crossmeds_treatment_analysis_date');
                setAnalysis(null);
                setAnalysisDate('');
              }}
              className="px-5 py-3 rounded-xl border border-zinc-200 dark:border-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-400 font-extrabold text-xs uppercase tracking-wider cursor-pointer transition-colors"
            >
              Nova Análise
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
