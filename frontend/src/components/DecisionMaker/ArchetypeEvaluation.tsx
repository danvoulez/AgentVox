import React, { useState } from 'react';
import { DecisionOption } from '@/contexts/DecisionContext';
import { 
  getAllArchetypes, 
  getArchetypesForTimeOfDay,
  evaluateOptionWithAllArchetypes,
  findMostFavorableArchetype,
  findLeastFavorableArchetype,
  Archetype
} from '@/utils/ArchetypeAdvisors';
import { useTheme } from '@/contexts/ThemeContext';
import { Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';

interface ArchetypeEvaluationProps {
  option: DecisionOption;
  showAll?: boolean;
}

const ArchetypeEvaluation: React.FC<ArchetypeEvaluationProps> = ({ option, showAll = false }) => {
  const { theme } = useTheme(); 
  const [expanded, setExpanded] = useState(false);
  
  // Obter os arquétipos relevantes para o período atual
  const currentTimeArchetypes = getArchetypesForTimeOfDay(theme as 'dawn' | 'day' | 'night');
  
  // Se showAll for true, mostrar todos os arquétipos, caso contrário, apenas os do período atual
  const archetypesToShow = showAll ? getAllArchetypes() : currentTimeArchetypes;
  
  // Obter as avaliações dos arquétipos para a opção
  const evaluations = archetypesToShow.map((archetype: any) => ({
    archetype,
    evaluation: archetype.evaluateOption(option)
  })).sort((a, b) => b.evaluation.score - a.evaluation.score);
  
  // Encontrar o arquétipo mais favorável e menos favorável
  const mostFavorable = findMostFavorableArchetype(option);
  const leastFavorable = findLeastFavorableArchetype(option);
  
  // Renderizar uma avaliação de arquétipo
  const renderArchetypeEvaluation = (
    archetype: Archetype, 
    score: number, 
    reasoning: string, 
    highlight: boolean = false
  ) => {
    return (
      <div 
        key={archetype.id}
        className={`p-3 rounded-md mb-2 text-sm transition-all ${
          highlight ? 'border border-opacity-50' : ''
        }`}
        style={{ 
          backgroundColor: highlight 
            ? `rgba(${archetype.color.replace('#', '').match(/.{1,2}/g)?.map((c: any) => parseInt(c, 16)).join(', ') || '0, 0, 0'}, 0.1)` 
            : 'rgba(var(--card-bg), 0.7)',
          borderColor: highlight ? archetype.color : 'transparent'
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <span className="text-lg mr-2">{archetype.icon}</span>
            <span className="font-medium">{archetype.name}</span>
          </div>
          <div 
            className="px-2 py-1 rounded-md text-xs font-bold"
            style={{ 
              backgroundColor: archetype.color,
              color: '#FFF',
              opacity: score / 10
            }}
          >
            {score.toFixed(1)}
          </div>
        </div>
        <p className="text-xs opacity-80">{reasoning}</p>
      </div>
    );
  };
  
  return (
    <div className="mt-2">
      <div 
        className="flex items-center justify-between p-2 rounded-md cursor-pointer"
        onClick={() => setExpanded(!expanded)}
        style={{ backgroundColor: 'rgba(var(--highlight-color), 0.05)' }}
      >
        <div className="flex items-center">
          <Lightbulb className="w-4 h-4 mr-2" style={{ color: 'rgba(var(--accent-color), 1)' }} />
          <span className="text-sm font-medium">Avaliação dos Conselheiros</span>
          {!expanded && (
            <span className="ml-2 text-xs opacity-70">
              Favorecido por {mostFavorable.archetype.name} ({mostFavorable.evaluation.score.toFixed(1)})
            </span>
          )}
        </div>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </div>
      
      {expanded && (
        <div className="mt-2 space-y-2 p-2">
          {/* Resumo das avaliações principais */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="p-2 rounded-md" style={{ backgroundColor: 'rgba(var(--success-color), 0.1)' }}>
              <div className="text-xs uppercase opacity-70 mb-1">Maior Afinidade</div>
              <div className="flex items-center">
                <span className="text-lg mr-2">{mostFavorable.archetype.icon}</span>
                <div>
                  <div className="text-sm font-medium">{mostFavorable.archetype.name}</div>
                  <div className="text-xs opacity-70">Pontuação: {mostFavorable.evaluation.score.toFixed(1)}/10</div>
                </div>
              </div>
            </div>
            <div className="p-2 rounded-md" style={{ backgroundColor: 'rgba(var(--error-color), 0.1)' }}>
              <div className="text-xs uppercase opacity-70 mb-1">Menor Afinidade</div>
              <div className="flex items-center">
                <span className="text-lg mr-2">{leastFavorable.archetype.icon}</span>
                <div>
                  <div className="text-sm font-medium">{leastFavorable.archetype.name}</div>
                  <div className="text-xs opacity-70">Pontuação: {leastFavorable.evaluation.score.toFixed(1)}/10</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Lista completa de avaliações */}
          <div className="space-y-2">
            {evaluations.map(({ archetype, evaluation }) => 
              renderArchetypeEvaluation(
                archetype, 
                evaluation.score, 
                evaluation.reasoning,
                archetype.id === mostFavorable.archetype.id || archetype.id === leastFavorable.archetype.id
              )
            )}
          </div>
          
          <div className="text-xs opacity-70 mt-2 p-2 rounded-md" style={{ backgroundColor: 'rgba(var(--highlight-color), 0.05)' }}>
            <p>Os conselheiros avaliam cada opção com base em diferentes perspectivas. {theme === 'dawn' ? 'Na madrugada' : theme === 'day' ? 'Durante o dia' : 'À noite'}, os arquétipos {currentTimeArchetypes.map((a: any) => a.name).join(' e ')} são especialmente relevantes.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchetypeEvaluation;
