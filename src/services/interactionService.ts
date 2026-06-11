import { GoogleGenAI, Type } from "@google/genai";
import { Medication, MedicationInteraction } from "../types";
import LOCAL_INTERACTIONS from "../data/interacoes/interacoes.json";
import MEDICAMENTOS_DATABASE from "../data/medicamentos/medicamentos.json";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "DUMMY_KEY" });

const formatMedName = (str: string): string => {
  if (!str) return '';
  return str.toLowerCase().replace(/(?:^|\s|-|\/)\S/g, l => l.toUpperCase());
};

const formatAasAndOthers = (name: string): string => {
  if (!name) return '';
  const trimmed = name.trim();
  const upper = trimmed.toUpperCase();
  
  if (upper === 'ACETILSALICILICO ACIDO' || upper === 'ACETILSALICÍLICO ÁCIDO' || upper === 'ÁCIDO ACETILSALICÍLICO' || upper === 'ACIDO ACETILSALICILICO') {
    return 'AAS (Ácido Acetilsalicílico)';
  }
  
  if (upper.includes('ACETILSALIC')) {
    const formatted = formatMedName(trimmed);
    return `AAS - ${formatted}`;
  }
  
  return formatMedName(trimmed);
};

const normalizeStrForSearch = (str: string): string => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

// Helper to extract a list of strings from the database (supporting string arrays or object arrays)
const getMedicationNamesList = (): string[] => {
  if (!Array.isArray(MEDICAMENTOS_DATABASE)) return [];
  
  const rawList = MEDICAMENTOS_DATABASE.map(item => {
    if (typeof item === 'string') {
      return item;
    }
    if (item && typeof item === 'object') {
      // Find the first key that represents the name
      const keys = ['SUBSTÂNCIA', 'SUBSTANCIA', 'substância', 'substancia', 'nome', 'name', 'medicamento', 'MEDICAMENTO', 'produto', 'PRODUTO', 'descricao', 'DESCRICAO'];
      for (const k of keys) {
        if (k in item && typeof (item as any)[k] === 'string') {
          return (item as any)[k];
        }
      }
      // Fallback: take the first string value we find in the object
      const values = Object.values(item);
      const strVal = values.find(v => typeof v === 'string');
      if (strVal) return strVal as string;
    }
    return '';
  }).filter(name => name.trim().length > 0);

  // Inject standalone "LOSARTANA POTÁSSICA" if it isn't specifically single
  const hasLosartanaPotassica = rawList.some(name => {
    const u = name.toUpperCase();
    return u === 'LOSARTANA POTÁSSICA' || u === 'LOSARTANA POTASSICA' || (u.includes('LOSARTANA') && !u.includes('+') && !u.includes(';'));
  });

  if (!hasLosartanaPotassica) {
    rawList.push('LOSARTANA POTÁSSICA');
  }

  return rawList.map(formatAasAndOthers);
};


export const checkSingleMedicationInteractions = (
  newMedName: string,
  existingMeds: Medication[]
): MedicationInteraction[] => {
  if (!newMedName) return [];
  
  const results: MedicationInteraction[] = [];
  const term1 = normalizeStrForSearch(newMedName);
  
  const flattenedExisting: Medication[] = [];
  existingMeds.forEach(m => {
    if (m.isCompounded && m.components && m.components.length > 0) {
      m.components.forEach((comp, idx) => {
        flattenedExisting.push({
          ...m,
          id: `${m.id}-comp-${idx}`,
          name: comp.name,
          dosage: comp.dosage,
        });
      });
    } else {
      flattenedExisting.push(m);
    }
  });

  for (const med of flattenedExisting) {
    if (!med.active) continue;
    const term2 = normalizeStrForSearch(med.name);
    
    // Find in LOCAL_INTERACTIONS
    const interaction = LOCAL_INTERACTIONS.find(li => {
      const lim1 = normalizeStrForSearch(li.med1);
      const lim2 = normalizeStrForSearch(li.med2);
      
      const isLim1Aas = lim1 === 'aas' || lim1.includes('acetilsalicil');
      const isLim2Aas = lim2 === 'aas' || lim2.includes('acetilsalicil');
      
      const isTerm1Aas = term1.includes('aas') || term1.includes('acetilsalicil');
      const isTerm2Aas = term2.includes('aas') || term2.includes('acetilsalicil');
      
      const match1_1 = isLim1Aas ? isTerm1Aas : (term1.includes(lim1) || lim1.includes(term1));
      const match2_2 = isLim2Aas ? isTerm2Aas : (term2.includes(lim2) || lim2.includes(term2));
      
      const match1_2 = isLim2Aas ? isTerm1Aas : (term1.includes(lim2) || lim2.includes(term1));
      const match2_1 = isLim1Aas ? isTerm2Aas : (term2.includes(lim1) || lim1.includes(term2));
      
      return (match1_1 && match2_2) || (match1_2 && match2_1);
    });
    
    if (interaction) {
      const isAasAndVarfarina = 
        ((term1.includes('aas') || term1.includes('acetilsalicil')) && term2.includes('varfarina')) ||
        ((term2.includes('aas') || term2.includes('acetilsalicil')) && term1.includes('varfarina'));
        
      const description = isAasAndVarfarina 
        ? "Aumento do risco de hemorragia."
        : interaction.symptoms;
        
      const recommendation = isAasAndVarfarina
        ? "Monitorar sinais de sangramento, como hematomas, sangramento gengival ou fezes escuras. O médico pode precisar ajustar a dose."
        : interaction.recommendation;
        
      results.push({
        medicationIds: [med.id],
        medicationNames: [newMedName, med.name],
        severity: interaction.severity as 'high' | 'moderate' | 'low',
        description,
        recommendation
      });
    }
  }
  
  return results;
};

export const checkMedicationInteractions = async (medications: Medication[]): Promise<MedicationInteraction[]> => {
  // Flatten medications if any are compounded formulas
  const flattenedMeds: Medication[] = [];
  medications.forEach(m => {
    if (m.isCompounded && m.components && m.components.length > 0) {
      m.components.forEach((comp, idx) => {
        flattenedMeds.push({
          ...m,
          id: `${m.id}-comp-${idx}`,
          name: comp.name,
          dosage: comp.dosage,
        });
      });
    } else {
      flattenedMeds.push(m);
    }
  });

  if (flattenedMeds.length < 2) return [];

  const localInteractions: MedicationInteraction[] = [];
  
  // Check local interactions first
  for (let i = 0; i < flattenedMeds.length; i++) {
    for (let j = i + 1; j < flattenedMeds.length; j++) {
      const med1 = flattenedMeds[i];
      const med2 = flattenedMeds[j];
      
      const term1 = normalizeStrForSearch(med1.name);
      const term2 = normalizeStrForSearch(med2.name);
      
      const interaction = LOCAL_INTERACTIONS.find(li => {
        const lim1 = normalizeStrForSearch(li.med1);
        const lim2 = normalizeStrForSearch(li.med2);
        
        const isLim1Aas = lim1 === 'aas' || lim1.includes('acetilsalicil');
        const isLim2Aas = lim2 === 'aas' || lim2.includes('acetilsalicil');
        
        const isTerm1Aas = term1.includes('aas') || term1.includes('acetilsalicil');
        const isTerm2Aas = term2.includes('aas') || term2.includes('acetilsalicil');
        
        const match1_1 = isLim1Aas ? isTerm1Aas : (term1.includes(lim1) || lim1.includes(term1));
        const match2_2 = isLim2Aas ? isTerm2Aas : (term2.includes(lim2) || lim2.includes(term2));
        
        const match1_2 = isLim2Aas ? isTerm1Aas : (term1.includes(lim2) || lim2.includes(term1));
        const match2_1 = isLim1Aas ? isTerm2Aas : (term2.includes(lim1) || lim1.includes(term2));
        
        return (match1_1 && match2_2) || (match1_2 && match2_1);
      });
      
      if (interaction) {
        const isAasAndVarfarina = 
          ((term1.includes('aas') || term1.includes('acetilsalicil')) && term2.includes('varfarina')) ||
          ((term2.includes('aas') || term2.includes('acetilsalicil')) && term1.includes('varfarina'));
          
        const description = isAasAndVarfarina 
          ? "Aumento do risco de hemorragia."
          : interaction.symptoms;
          
        const recommendation = isAasAndVarfarina
          ? "Monitorar sinais de sangramento, como hematomas, sangramento gengival ou fezes escuras. O médico pode precisar ajustar a dose."
          : interaction.recommendation;

        localInteractions.push({
          medicationIds: [med1.id, med2.id],
          medicationNames: [med1.name, med2.name],
          severity: interaction.severity as 'high' | 'moderate' | 'low',
          description,
          recommendation
        });
      }
    }
  }

  // If we found local interactions, we return them. 
  if (localInteractions.length > 0) {
    return localInteractions;
  }

  if (!process.env.GEMINI_API_KEY) {
    return [];
  }

  const medList = flattenedMeds.map(m => `${m.name} (${m.dosage})`).join(", ");
  
  const prompt = `
    Analise a seguinte lista de medicamentos em busca de potenciais interações medicamentosas:
    ${medList}

    Retorne um array JSON de interações. Cada interação deve incluir:
    - medicationNames: string[] (os nomes dos medicamentos envolvidos)
    - severity: 'high' | 'moderate' | 'low'
    - description: string (breve explicação da interação em português)
    - recommendation: string (o que o usuário deve fazer em português)

    Se nenhuma interação significativa for encontrada, retorne um array vazio.
    Inclua apenas interações entre os medicamentos na lista fornecida.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              medicationNames: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              severity: {
                type: Type.STRING,
                enum: ["high", "moderate", "low"]
              },
              description: { type: Type.STRING },
              recommendation: { type: Type.STRING }
            },
            required: ["medicationNames", "severity", "description", "recommendation"]
          }
        }
      }
    });

    const interactions: MedicationInteraction[] = JSON.parse(response.text || "[]");
    
    // Map medication names back to IDs if possible, or just keep names
    return interactions.map(interaction => ({
      ...interaction,
      medicationIds: medications
        .filter(m => interaction.medicationNames.some(name => m.name.toLowerCase().includes(name.toLowerCase())))
        .map(m => m.id)
    }));
  } catch (error) {
    console.error("Error checking interactions:", error);
    return [];
  }
};

export const getMedicationSuggestions = async (query: string): Promise<string[]> => {
  if (!query || query.length < 2) return [];

  try {
    const term = normalizeStrForSearch(query);
    const allNames = getMedicationNamesList();
    
    // Split into starts-with and contains matches for prioritized ordering
    const startsWithMatches: string[] = [];
    const containingMatches: string[] = [];
    
    for (const name of allNames) {
      const normName = normalizeStrForSearch(name);
      if (normName.startsWith(term)) {
        startsWithMatches.push(name);
      } else if (normName.includes(term)) {
        containingMatches.push(name);
      }
    }
    
    // Combine and limit to 15 suggestions
    const results = [...startsWithMatches, ...containingMatches].filter((value, index, self) => self.indexOf(value) === index).slice(0, 15);
    
    // Dynamic online fallback if no offline match is found and api key is configured
    if (results.length === 0 && process.env.GEMINI_API_KEY) {
      const prompt = `
        Forneça uma lista de até 10 nomes de medicamentos comuns que começam com ou contêm "${query}".
        Retorne APENAS um array JSON de strings.
      `;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      const onlineResults: string[] = JSON.parse(response.text || "[]");
      return onlineResults.map(formatMedName);
    }
    
    return results;
  } catch (error) {
    console.error("Error getting medication suggestions:", error);
    return [];
  }
};

export const getDosageSuggestions = async (medName: string): Promise<string[]> => {
  if (!medName) return [];

  // Default dosage fallbacks for offline support
  const defaultDosages = ["50 mg", "100 mg", "500 mg", "1 g", "5 ml", "10 ml", "20 mg", "5 mcg"];

  const term = medName.toLowerCase().trim();

  // Hardcode Brazilian common/standard single Losartana Potássica doses
  if (term === 'losartana potássica' || term === 'losartana' || term === 'losartana potassica') {
    return ['50 MG', '100 MG'];
  }

  // Normalize mapping back to database name representations for AAS / Acid Acetilsalicilico
  const searchTerms = [term];
  if (term.includes('aas') || term.includes('acetilsalicilico') || term.includes('acetilsalicílico')) {
    searchTerms.push('acetilsalicilico acido');
    searchTerms.push('acetilsalicílico ácido');
    searchTerms.push('ácido acetilsalicílico');
  }

  // 1. Try to find the medication dosage in the offline medicamentos database
  if (Array.isArray(MEDICAMENTOS_DATABASE)) {
    const found = MEDICAMENTOS_DATABASE.find(item => {
      if (item && typeof item === 'object') {
        const keys = ['SUBSTÂNCIA', 'SUBSTANCIA', 'substância', 'substancia', 'nome', 'name', 'medicamento', 'MEDICAMENTO'];
        for (const k of keys) {
          if (k in item && typeof (item as any)[k] === 'string') {
            const val = (item as any)[k].toLowerCase().trim();
            if (searchTerms.some(st => val === st || val.includes(st) || st.includes(val))) {
              return true;
            }
          }
        }
      }
      return false;
    });

    if (found && typeof found === 'object') {
      let dosagemStr = '';
      const dosageKeys = ['DOSAGEM', 'dosagem', 'APRESENTAÇÃO', 'APRESENTACAO', 'apresentação', 'apresentacao'];
      for (const dk of dosageKeys) {
        if (dk in found && typeof (found as any)[dk] === 'string') {
          dosagemStr = (found as any)[dk];
          break;
        }
      }

      if (dosagemStr) {
        // "20 MG\/ML, 300 MG" -> ["20 MG/ML", "300 MG"]
        const separated = dosagemStr
          .split(',')
          .map(d => d.replace(/\\/g, '').trim())
          .filter(d => d.length > 0);
        if (separated.length > 0) {
          // Return matching formatted dosages
          return separated.map(d => d.toLowerCase().replace(/(?:^|\s)\S/g, l => l.toUpperCase()));
        }
      }
    }
  }

  // Fallback for AAS if not found in DB
  if (term.includes('aas') || term.includes('acetilsalicilico') || term.includes('acetilsalicílico')) {
    return ['100 MG', '500 MG', '325 MG'];
  }

  // 2. If not found in offline DB and an API key is available, query Gemini
  if (!process.env.GEMINI_API_KEY) {
    return defaultDosages;
  }

  const prompt = `
    Forneça uma lista de dosagens comuns para o medicamento "${medName}".
    Retorne APENAS um array JSON de strings (ex: ["500mg", "1000mg", "5ml"]).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Error getting dosage suggestions:", error);
    return defaultDosages;
  }
};

export const chatWithIA = async (messages: { role: 'user' | 'model'; text: string }[], medications: Medication[]): Promise<string> => {
  if (!process.env.GEMINI_API_KEY) {
    return "A chave da API Gemini não está configurada na sua conta. Configure-a para iniciar discussões.";
  }

  const medList = medications.map(m => `${m.name} (${m.dosage})`).join(", ");
  const systemInstruction = `
    Você é o CrossMeds IA, um assistente virtual especialista em saúde e farmacologia que ajuda a organizar medicamentos e prevenir erros.
    O usuário possui os seguintes medicamentos cadastrados atualmente: [${medList || 'Nenhum medicamento ativo'}].
    Importante:
    1. Responda com foco científico, mas linguagem acessível e acolhedora em português.
    2. Explique os horários ideais, possíveis efeitos colaterais comuns e riscos de interações com base nas informações médicas.
    3. Sempre finalize suas respostas com um aviso de aviso médico claro: "Nota: Sou um assistente de IA. Sempre consulte seu médico ou farmacêutico para orientações clínicas definitivas."
    Mantenha os parágrafos curtos, formate palavras importantes em negrito, e faça listas em tópicos se ajudar na leitura rápida.
  `;

  try {
    const formattedContents = [
      { role: "user" as const, parts: [{ text: systemInstruction }] },
      ...messages.map(msg => ({
        role: msg.role === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: msg.text }]
      }))
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: formattedContents,
    });

    return response.text || "Desculpe, não consegui formular uma resposta no momento.";
  } catch (error) {
    console.error("Error in chatWithIA:", error);
    return "Tive um problema ao me conectar com a inteligência artificial. Por favor, tente novamente em alguns instantes.";
  }
};

export const analyzeMedicationImage = async (
  base64Image: string,
  mimeType: string
): Promise<{ name: string; activeIngredient?: string; confidence: number }> => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("A chave da API Gemini não está configurada no seu ambiente.");
  }

  const prompt = `
    Analise esta imagem da embalagem de um medicamento.
    Identifique o nome comercial do medicamento e o seu princípio ativo (substância ativa) em português do Brasil.
    Retorne a resposta EXATAMENTE no formato JSON com os seguintes campos:
    {
      "name": "Nome Comercial do Medicamento (ou Substância se não houver comercial)",
      "activeIngredient": "Princípio Ativo",
      "confidence": 0.95
    }
    Importante:
    - Retorne APENAS o JSON válido. Não inclua blocos markdown de código ou textos explicativos adicionais.
    - Se a imagem não for um medicamento ou não for possível identificar, retorne {"name": "", "activeIngredient": "", "confidence": 0}.
  `;

  try {
    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const imagePart = {
      inlineData: {
        mimeType,
        data: cleanBase64,
      },
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          parts: [
            imagePart,
            { text: prompt }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            activeIngredient: { type: Type.STRING },
            confidence: { type: Type.NUMBER }
          },
          required: ["name", "activeIngredient", "confidence"]
        }
      }
    });

    const text = response.text || "{}";
    const result = JSON.parse(text);
    return result;
  } catch (error) {
    console.error("Error identifying medication from image:", error);
    throw error;
  }
};

