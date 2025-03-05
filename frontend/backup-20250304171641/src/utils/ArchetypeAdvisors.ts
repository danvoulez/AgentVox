import { DecisionOption } from "@/contexts/DecisionContext";

export interface Archetype {
  id: string;
  name: string;
  description: string;
  icon: string;
  idealTimeOfDay: 'dawn' | 'day' | 'night' | 'any';
  color: string;
  evaluateOption: (option: DecisionOption) => {
    score: number;
    reasoning: string;
  };
}

// Definição dos arquétipos de conselheiros
export const archetypes: Archetype[] = [
  {
    id: "strategist",
    name: "O Estrategista",
    description: "Foca no valor de longo prazo e impacto estratégico das decisões.",
    icon: "📈",
    idealTimeOfDay: "dawn",
    color: "#4B79A1",
    evaluateOption: (option: DecisionOption) => {
      // O estrategista valoriza:
      // 1. Alto valor a longo prazo
      // 2. Alta importância
      // 3. Impacto alto (preferencialmente)
      
      let score = 0;
      const factors = option.gradientFactors || { 
        urgency: 5, importance: 5, confidence: 5, 
        emotionalImpact: 5, longTermValue: 5 
      };
      
      // Valor a longo prazo tem peso maior
      score += (factors.longTermValue * 0.4);
      
      // Importância tem peso significativo
      score += (factors.importance * 0.3);
      
      // Confiança tem peso moderado
      score += (factors.confidence * 0.2);
      
      // Impacto (convertendo string para número)
      const impactScore = 
        option.impact === 'high' ? 10 : 
        option.impact === 'medium' ? 6 : 3;
      score += (impactScore * 0.1);
      
      // Normalizar para escala 0-10
      score = Math.min(10, Math.max(0, score));
      
      // Gerar raciocínio
      let reasoning = "";
      if (factors.longTermValue >= 8) {
        reasoning += "Esta opção tem excelente valor a longo prazo. ";
      } else if (factors.longTermValue <= 3) {
        reasoning += "Esta opção carece de valor estratégico a longo prazo. ";
      }
      
      if (factors.importance >= 7) {
        reasoning += "A alta importância desta decisão justifica atenção estratégica. ";
      }
      
      if (option.impact === 'high') {
        reasoning += "O alto impacto sugere potencial para mudanças significativas. ";
      } else if (option.impact === 'low') {
        reasoning += "O baixo impacto limita o valor estratégico. ";
      }
      
      if (reasoning === "") {
        reasoning = "Esta opção tem um valor estratégico moderado.";
      }
      
      return { score, reasoning };
    }
  },
  {
    id: "intuitive",
    name: "O Intuitivo",
    description: "Valoriza o impacto emocional e alinhamento com valores pessoais.",
    icon: "🧠",
    idealTimeOfDay: "night",
    color: "#9B59B6",
    evaluateOption: (option: DecisionOption) => {
      let score = 0;
      const factors = option.gradientFactors || { 
        urgency: 5, importance: 5, confidence: 5, 
        emotionalImpact: 5, longTermValue: 5 
      };
      
      // O intuitivo valoriza principalmente o impacto emocional
      score += (factors.emotionalImpact * 0.5);
      
      // Também considera o valor a longo prazo (alinhamento com valores)
      score += (factors.longTermValue * 0.3);
      
      // E dá algum peso para a confiança (intuição)
      score += (factors.confidence * 0.2);
      
      // Normalizar para escala 0-10
      score = Math.min(10, Math.max(0, score));
      
      // Gerar raciocínio
      let reasoning = "";
      if (factors.emotionalImpact >= 8) {
        reasoning += "Esta opção ressoa fortemente no nível emocional. ";
      } else if (factors.emotionalImpact <= 3) {
        reasoning += "Esta opção parece não despertar uma resposta emocional significativa. ";
      }
      
      if (factors.longTermValue >= 7) {
        reasoning += "Sinto que esta escolha está alinhada com seus valores mais profundos. ";
      } else if (factors.longTermValue <= 3) {
        reasoning += "Intuitivamente, esta opção não parece alinhada com seus valores fundamentais. ";
      }
      
      // Considerar os prós e contras de forma intuitiva
      if (option.pros.length > option.cons.length + 2) {
        reasoning += "Há uma sensação de positividade marcante nesta opção. ";
      } else if (option.cons.length > option.pros.length + 2) {
        reasoning += "Sinto vários sinais de alerta nesta opção. ";
      }
      
      if (reasoning === "") {
        reasoning = "Minha intuição diz que esta opção é equilibrada, mas não excepcional.";
      }
      
      return { score, reasoning };
    }
  },
  {
    id: "pragmatic",
    name: "O Pragmático",
    description: "Prioriza eficiência, resultados práticos e implementação.",
    icon: "⚙️",
    idealTimeOfDay: "day",
    color: "#F39C12",
    evaluateOption: (option: DecisionOption) => {
      let score = 0;
      const factors = option.gradientFactors || { 
        urgency: 5, importance: 5, confidence: 5, 
        emotionalImpact: 5, longTermValue: 5 
      };
      
      // O pragmático valoriza:
      // 1. Alta confiança (viabilidade)
      // 2. Urgência (resultados rápidos)
      // 3. Balanço de prós e contras (praticidade)
      
      score += (factors.confidence * 0.4);
      score += (factors.urgency * 0.3);
      
      // Prós vs contras (análise prática)
      const prosConsRatio = option.pros.length / Math.max(1, option.cons.length);
      const prosConsScore = Math.min(10, prosConsRatio * 3);
      score += (prosConsScore * 0.3);
      
      // Normalizar para escala 0-10
      score = Math.min(10, Math.max(0, score));
      
      // Gerar raciocínio
      let reasoning = "";
      if (factors.confidence >= 8) {
        reasoning += "Esta opção tem alta viabilidade prática. ";
      } else if (factors.confidence <= 3) {
        reasoning += "A viabilidade desta opção é questionável. ";
      }
      
      if (factors.urgency >= 7) {
        reasoning += "A urgência desta situação favorece ação imediata. ";
      } else if (factors.urgency <= 3) {
        reasoning += "A baixa urgência permite considerar alternativas mais elaboradas. ";
      }
      
      if (prosConsRatio >= 2) {
        reasoning += "O balanço positivo de prós e contras sugere uma opção prática. ";
      } else if (prosConsRatio <= 0.5) {
        reasoning += "Os obstáculos superam significativamente os benefícios práticos. ";
      }
      
      if (reasoning === "") {
        reasoning = "Do ponto de vista prático, esta opção é moderadamente viável.";
      }
      
      return { score, reasoning };
    }
  },
  {
    id: "innovative",
    name: "O Inovador",
    description: "Busca soluções criativas e não convencionais.",
    icon: "💡",
    idealTimeOfDay: "night",
    color: "#1ABC9C",
    evaluateOption: (option: DecisionOption) => {
      // O inovador valoriza originalidade e potencial transformador
      // Como isso é difícil de quantificar diretamente nos dados disponíveis,
      // faremos algumas suposições criativas
      
      let score = 0;
      const factors = option.gradientFactors || { 
        urgency: 5, importance: 5, confidence: 5, 
        emotionalImpact: 5, longTermValue: 5 
      };
      
      // Combinações interessantes são valorizadas
      // Alto impacto emocional + alto valor de longo prazo = potencial disruptivo
      const disruptiveScore = (factors.emotionalImpact * factors.longTermValue) / 10;
      score += (disruptiveScore * 0.4);
      
      // Confiança moderada (nem muito alta, que sugere convencionalidade,
      // nem muito baixa, que sugere inviabilidade)
      const confidenceScore = 10 - Math.abs(factors.confidence - 6) * 2;
      score += (confidenceScore * 0.3);
      
      // Importância alta
      score += (factors.importance * 0.3);
      
      // Normalizar para escala 0-10
      score = Math.min(10, Math.max(0, score));
      
      // Gerar raciocínio
      let reasoning = "";
      if (disruptiveScore >= 7) {
        reasoning += "Esta opção tem potencial para resultados realmente inovadores. ";
      } else if (disruptiveScore <= 3) {
        reasoning += "Esta opção parece seguir caminhos convencionais. ";
      }
      
      if (Math.abs(factors.confidence - 6) <= 2) {
        reasoning += "O equilíbrio entre confiança e incerteza cria espaço para inovação. ";
      } else if (factors.confidence >= 9) {
        reasoning += "A alta previsibilidade limita o potencial para descobertas surpreendentes. ";
      } else if (factors.confidence <= 3) {
        reasoning += "A excessiva incerteza pode comprometer a implementação de ideias inovadoras. ";
      }
      
      if (factors.importance >= 8) {
        reasoning += "Questões importantes merecem soluções originais. ";
      }
      
      if (reasoning === "") {
        reasoning = "Do ponto de vista da inovação, esta opção tem potencial moderado para trazer novas perspectivas.";
      }
      
      return { score, reasoning };
    }
  },
  {
    id: "analytical",
    name: "O Analítico",
    description: "Enfatiza dados, lógica e análise metódica.",
    icon: "🔍",
    idealTimeOfDay: "dawn",
    color: "#3498DB",
    evaluateOption: (option: DecisionOption) => {
      let score = 0;
      const factors = option.gradientFactors || { 
        urgency: 5, importance: 5, confidence: 5, 
        emotionalImpact: 5, longTermValue: 5 
      };
      
      // O analítico valoriza:
      // 1. Alta confiança (dados confiáveis)
      // 2. Importância (vale a pena analisar)
      // 3. Balanço objetivo de prós e contras
      
      score += (factors.confidence * 0.4);
      score += (factors.importance * 0.3);
      
      // Análise quantitativa de prós e contras
      const prosWeight = option.pros.length * 2;
      const consWeight = option.cons.length * 3; // Contras têm peso maior (viés para cautela)
      const prosConsScore = Math.max(0, Math.min(10, (prosWeight - consWeight + 10) / 2));
      score += (prosConsScore * 0.3);
      
      // Normalizar para escala 0-10
      score = Math.min(10, Math.max(0, score));
      
      // Gerar raciocínio
      let reasoning = "";
      if (factors.confidence >= 8) {
        reasoning += "Os dados disponíveis apoiam fortemente esta opção. ";
      } else if (factors.confidence <= 3) {
        reasoning += "Há uma falta significativa de dados confiáveis para esta opção. ";
      }
      
      if (factors.importance >= 7) {
        reasoning += "A importância desta decisão justifica uma análise aprofundada. ";
      }
      
      if (option.pros.length > option.cons.length * 2) {
        reasoning += "A análise objetiva mostra vantagens significativamente superiores às desvantagens. ";
      } else if (option.cons.length > option.pros.length) {
        reasoning += "As desvantagens superam as vantagens em uma análise objetiva. ";
      } else {
        reasoning += "Há um equilíbrio relativamente balanceado entre prós e contras. ";
      }
      
      if (reasoning === "") {
        reasoning = "A análise dos dados disponíveis sugere que esta opção tem mérito moderado.";
      }
      
      return { score, reasoning };
    }
  }
];

// Função para obter os arquétipos adequados para um determinado período do dia
export const getArchetypesForTimeOfDay = (timeOfDay: 'dawn' | 'day' | 'night'): Archetype[] => {
  return archetypes.filter(
    archetype => archetype.idealTimeOfDay === timeOfDay || archetype.idealTimeOfDay === 'any'
  );
};

// Função para obter todos os arquétipos
export const getAllArchetypes = (): Archetype[] => {
  return archetypes;
};

// Função para obter um arquétipo específico pelo ID
export const getArchetypeById = (id: string): Archetype | undefined => {
  return archetypes.find(archetype => archetype.id === id);
};

// Função para avaliar uma opção de decisão com todos os arquétipos
export const evaluateOptionWithAllArchetypes = (option: DecisionOption) => {
  return archetypes.map(archetype => ({
    archetype,
    evaluation: archetype.evaluateOption(option)
  }));
};

// Função para encontrar o arquétipo que mais favorece uma opção
export const findMostFavorableArchetype = (option: DecisionOption) => {
  const evaluations = evaluateOptionWithAllArchetypes(option);
  evaluations.sort((a, b) => b.evaluation.score - a.evaluation.score);
  return evaluations[0];
};

// Função para encontrar o arquétipo que menos favorece uma opção
export const findLeastFavorableArchetype = (option: DecisionOption) => {
  const evaluations = evaluateOptionWithAllArchetypes(option);
  evaluations.sort((a, b) => a.evaluation.score - b.evaluation.score);
  return evaluations[0];
};
