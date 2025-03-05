import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTheme } from './ThemeContext';
import { DecisionRule } from '@/components/DecisionMaker/DecisionRules';
import {
  Archetype,
  evaluateOptionWithAllArchetypes,
  findMostFavorableArchetype,
  findLeastFavorableArchetype,
  getArchetypesForTimeOfDay
} from '@/utils/ArchetypeAdvisors';

export interface Decision {
  id: string;
  title: string;
  description: string;
  options: DecisionOption[];
  createdAt: Date;
  deadline?: Date;
  completed: boolean;
  selectedOptionId?: string;
}

export interface DecisionOption {
  id: string;
  title: string;
  description: string;
  pros: string[];
  cons: string[];
  impact: 'low' | 'medium' | 'high';
  timeOfDay?: 'dawn' | 'day' | 'night' | 'any';
  gradientFactors?: {
    urgency: number; // 0-10
    importance: number; // 0-10
    confidence: number; // 0-10
    emotionalImpact: number; // 0-10
    longTermValue: number; // 0-10
  };
  categories?: string[];
}

// Tipo para avaliação de arquétipo
export interface ArchetypeEvaluation {
  archetype: Archetype;
  evaluation: {
    score: number;
    reasoning: string;
  };
}

interface DecisionContextProps {
  decisions: Decision[];
  activeDecision: Decision | null;
  addDecision: (decision: Omit<Decision, 'id' | 'createdAt' | 'completed'>) => void;
  updateDecision: (id: string, updates: Partial<Decision>) => void;
  removeDecision: (id: string) => void;
  setActiveDecision: (id: string | null) => void;
  selectOption: (decisionId: string, optionId: string) => void;
  getRecommendedOption: (decisionId: string) => DecisionOption | null;
  getPendingDecisions: () => Decision[];
  getCompletedDecisions: () => Decision[];
  getDecisionsForCurrentTimeOfDay: () => Decision[];
  getActiveRules: () => DecisionRule[];
  getApplicableRules: (categories?: string[]) => DecisionRule[];
  calculateGradientScore: (option: DecisionOption) => number;
  // Métodos para arquétipos de conselheiros
  evaluateOptionWithArchetypes: (option: DecisionOption) => ArchetypeEvaluation[];
  getMostFavorableArchetype: (option: DecisionOption) => ArchetypeEvaluation;
  getLeastFavorableArchetype: (option: DecisionOption) => ArchetypeEvaluation;
  getCurrentTimeArchetypes: () => Archetype[];
}

const DecisionContext = createContext<DecisionContextProps | undefined>(undefined);

export const useDecision = () => {
  const context = useContext(DecisionContext);
  if (!context) {
    throw new Error('useDecision must be used within a DecisionProvider');
  }
  return context;
};

export const DecisionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [activeDecision, setActiveDecisionState] = useState<Decision | null>(null);
  const [rules, setRules] = useState<DecisionRule[]>([]);
  const { theme } = useTheme();
  
  // Carregar decisões e regras do localStorage
  useEffect(() => {
    // Carregar decisões
    const savedDecisions = localStorage.getItem('decisions');
    if (savedDecisions) {
      try {
        const parsedDecisions = JSON.parse(savedDecisions);
        // Converter strings de data para objetos Date
        const formattedDecisions = parsedDecisions.map((decision: any) => ({
          ...decision,
          createdAt: new Date(decision.createdAt),
          deadline: decision.deadline ? new Date(decision.deadline) : undefined
        }));
        setDecisions(formattedDecisions);
      } catch (e) {
        console.error('Erro ao carregar decisões:', e);
      }
    }
    
    // Carregar regras
    const savedRules = localStorage.getItem('decisionRules');
    if (savedRules) {
      try {
        const parsedRules = JSON.parse(savedRules);
        setRules(parsedRules);
      } catch (e) {
        console.error('Erro ao carregar regras de decisão:', e);
      }
    }
  }, []);
  
  // Salvar decisões no localStorage quando houver mudanças
  useEffect(() => {
    if (decisions.length > 0) {
      localStorage.setItem('decisions', JSON.stringify(decisions));
    }
  }, [decisions]);
  
  // Adicionar uma nova decisão
  const addDecision = (decision: Omit<Decision, 'id' | 'createdAt' | 'completed'>) => {
    const newDecision: Decision = {
      ...decision,
      id: Date.now().toString(),
      createdAt: new Date(),
      completed: false
    };
    
    setDecisions(prev => [...prev, newDecision]);
    return newDecision.id;
  };
  
  // Atualizar uma decisão existente
  const updateDecision = (id: string, updates: Partial<Decision>) => {
    setDecisions(prev => 
      prev.map(decision => 
        decision.id === id ? { ...decision, ...updates } : decision
      )
    );
  };
  
  // Remover uma decisão
  const removeDecision = (id: string) => {
    setDecisions(prev => prev.filter(decision => decision.id !== id));
    if (activeDecision?.id === id) {
      setActiveDecisionState(null);
    }
  };
  
  // Definir a decisão ativa
  const setActiveDecision = (id: string | null) => {
    if (id === null) {
      setActiveDecisionState(null);
      return;
    }
    
    const decision = decisions.find(d => d.id === id) || null;
    setActiveDecisionState(decision);
  };
  
  // Selecionar uma opção para uma decisão
  const selectOption = (decisionId: string, optionId: string) => {
    updateDecision(decisionId, { 
      selectedOptionId: optionId,
      completed: true 
    });
  };
  
  // Obter regras ativas
  const getActiveRules = () => {
    return rules.filter(rule => rule.active)
      .sort((a, b) => b.priority - a.priority);
  };
  
  // Obter regras aplicáveis a categorias específicas
  const getApplicableRules = (categories?: string[]) => {
    if (!categories || categories.length === 0) {
      return getActiveRules();
    }
    
    return getActiveRules().filter(rule => 
      categories.includes(rule.category) || rule.category === ''
    );
  };
  
  // Calcular pontuação de gradiente para uma opção
  const calculateGradientScore = (option: DecisionOption): number => {
    if (!option.gradientFactors) return 0;
    
    const { urgency, importance, confidence, emotionalImpact, longTermValue } = option.gradientFactors;
    
    // Pesos para cada fator (podem ser ajustados)
    const weights = {
      urgency: 0.2,
      importance: 0.3,
      confidence: 0.15,
      emotionalImpact: 0.15,
      longTermValue: 0.2
    };
    
    // Calcular pontuação ponderada
    const score = (
      urgency * weights.urgency +
      importance * weights.importance +
      confidence * weights.confidence +
      emotionalImpact * weights.emotionalImpact +
      longTermValue * weights.longTermValue
    ) / Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    
    return parseFloat(score.toFixed(2));
  };
  
  // Obter a opção recomendada para uma decisão com base no tema atual e regras
  const getRecommendedOption = (decisionId: string): DecisionOption | null => {
    const decision = decisions.find(d => d.id === decisionId);
    if (!decision) return null;
    
    // Filtrar opções compatíveis com o período do dia atual
    const compatibleOptions = decision.options.filter(option => 
      option.timeOfDay === 'any' || option.timeOfDay === theme
    );
    
    if (compatibleOptions.length === 0) return null;
    
    // Obter regras aplicáveis
    const applicableRules = getApplicableRules(compatibleOptions.flatMap(o => o.categories || []));
    
    // Verificar regras de alta prioridade primeiro
    const highPriorityRules = applicableRules.filter(rule => rule.priority >= 8);
    
    // Classificar opções
    return compatibleOptions.sort((a, b) => {
      // Primeiro verificar regras de alta prioridade
      if (highPriorityRules.length > 0) {
        // Verificar se alguma opção corresponde a uma regra de alta prioridade para o período atual
        const aMatchesHighPriorityRule = highPriorityRules.some(rule => 
          (rule.timeOfDay === 'any' || rule.timeOfDay === theme) &&
          (a.categories?.includes(rule.category) || !rule.category)
        );
        
        const bMatchesHighPriorityRule = highPriorityRules.some(rule => 
          (rule.timeOfDay === 'any' || rule.timeOfDay === theme) &&
          (b.categories?.includes(rule.category) || !rule.category)
        );
        
        if (aMatchesHighPriorityRule && !bMatchesHighPriorityRule) return -1;
        if (!aMatchesHighPriorityRule && bMatchesHighPriorityRule) return 1;
      }
      
      // Calcular pontuações de gradiente
      const aGradientScore = calculateGradientScore(a);
      const bGradientScore = calculateGradientScore(b);
      
      if (aGradientScore !== bGradientScore) {
        return bGradientScore - aGradientScore;
      }
      
      // Depois por impacto
      const impactScore = (impact: string) => {
        switch (impact) {
          case 'high': return 3;
          case 'medium': return 2;
          case 'low': return 1;
          default: return 0;
        }
      };
      
      const impactDiff = impactScore(b.impact) - impactScore(a.impact);
      if (impactDiff !== 0) return impactDiff;
      
      // Por último, pelo saldo de prós e contras
      const aBalance = a.pros.length - a.cons.length;
      const bBalance = b.pros.length - b.cons.length;
      return bBalance - aBalance;
    })[0];
  };
  
  // Obter decisões pendentes
  const getPendingDecisions = () => {
    return decisions.filter(d => !d.completed);
  };
  
  // Obter decisões concluídas
  const getCompletedDecisions = () => {
    return decisions.filter(d => d.completed);
  };
  
  // Obter decisões adequadas para o período do dia atual
  const getDecisionsForCurrentTimeOfDay = () => {
    return decisions.filter(d => 
      !d.completed && 
      d.options.some(option => 
        option.timeOfDay === 'any' || option.timeOfDay === theme
      )
    );
  };
  
  // Avaliar uma opção com todos os arquétipos disponíveis
  const evaluateOptionWithArchetypes = (option: DecisionOption): ArchetypeEvaluation[] => {
    return evaluateOptionWithAllArchetypes(option);
  };
  
  // Obter o arquétipo que mais favorece uma opção
  const getMostFavorableArchetype = (option: DecisionOption): ArchetypeEvaluation => {
    return findMostFavorableArchetype(option);
  };
  
  // Obter o arquétipo que menos favorece uma opção
  const getLeastFavorableArchetype = (option: DecisionOption): ArchetypeEvaluation => {
    return findLeastFavorableArchetype(option);
  };
  
  // Obter os arquétipos relevantes para o período atual
  const getCurrentTimeArchetypes = (): Archetype[] => {
    return getArchetypesForTimeOfDay(theme as 'dawn' | 'day' | 'night');
  };

  return (
    <DecisionContext.Provider value={{
      decisions,
      activeDecision,
      addDecision,
      updateDecision,
      removeDecision,
      setActiveDecision,
      selectOption,
      getRecommendedOption,
      getPendingDecisions,
      getCompletedDecisions,
      getDecisionsForCurrentTimeOfDay,
      getActiveRules,
      getApplicableRules,
      calculateGradientScore,
      evaluateOptionWithArchetypes,
      getMostFavorableArchetype,
      getLeastFavorableArchetype,
      getCurrentTimeArchetypes
    }}>
      {children}
    </DecisionContext.Provider>
  );
};

export default DecisionContext;
