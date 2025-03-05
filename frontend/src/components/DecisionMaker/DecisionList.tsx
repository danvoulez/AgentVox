import React, { useState } from 'react';
import { useDecision, Decision, DecisionOption } from '@/contexts/DecisionContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Clock, CheckCircle, AlertCircle, PlusCircle, ThumbsUp, ThumbsDown, Calendar } from 'lucide-react';

const DecisionList: React.FC = () => {
  const { 
    decisions, 
    setActiveDecision, 
    getRecommendedOption, 
    selectOption,
    getPendingDecisions,
    getCompletedDecisions
  } = useDecision();
  const { theme } = useTheme();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [showDetails, setShowDetails] = useState<string | null>(null);
  
  // Filtrar decisões com base no estado do filtro
  const filteredDecisions = filter === 'all' 
    ? decisions 
    : filter === 'pending' 
      ? getPendingDecisions() 
      : getCompletedDecisions();
  
  // Formatar data
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Verificar se uma decisão está próxima do prazo
  const isNearDeadline = (deadline?: Date) => {
    if (!deadline) return false;
    
    const now = new Date();
    const diffHours = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours > 0 && diffHours < 24;
  };
  
  // Verificar se uma decisão está atrasada
  const isOverdue = (deadline?: Date) => {
    if (!deadline) return false;
    
    const now = new Date();
    return deadline < now;
  };
  
  // Obter cor de destaque com base no período do dia da opção
  const getTimeOfDayColor = (timeOfDay?: string) => {
    switch (timeOfDay) {
      case 'dawn':
        return 'text-blue-400';
      case 'day':
        return 'text-yellow-400';
      case 'night':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
  };
  
  // Obter emoji para o período do dia
  const getTimeOfDayEmoji = (timeOfDay?: string) => {
    switch (timeOfDay) {
      case 'dawn':
        return '🌅';
      case 'day':
        return '☀️';
      case 'night':
        return '🌙';
      default:
        return '⏱️';
    }
  };
  
  // Obter cor para o impacto
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };
  
  // Verificar se uma opção é recomendada para o tema atual
  const isRecommendedForCurrentTheme = (option: DecisionOption) => {
    return option.timeOfDay === 'any' || option.timeOfDay === theme;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-xs rounded-full ${filter === 'all' ? 'bg-opacity-70' : 'bg-opacity-20'}`}
            style={{ backgroundColor: `rgba(var(--accent-color), ${filter === 'all' ? '0.7' : '0.2'})` }}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 text-xs rounded-full ${filter === 'pending' ? 'bg-opacity-70' : 'bg-opacity-20'}`}
            style={{ backgroundColor: `rgba(var(--accent-color), ${filter === 'pending' ? '0.7' : '0.2'})` }}
          >
            Pendentes
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 text-xs rounded-full ${filter === 'completed' ? 'bg-opacity-70' : 'bg-opacity-20'}`}
            style={{ backgroundColor: `rgba(var(--accent-color), ${filter === 'completed' ? '0.7' : '0.2'})` }}
          >
            Concluídas
          </button>
        </div>
      </div>
      
      {filteredDecisions.length === 0 ? (
        <div 
          className="p-6 rounded-lg text-center"
          style={{ backgroundColor: 'rgba(var(--card-bg), 0.5)' }}
        >
          <p className="text-sm opacity-70">
            {filter === 'all' 
              ? 'Nenhuma decisão encontrada' 
              : filter === 'pending' 
                ? 'Nenhuma decisão pendente' 
                : 'Nenhuma decisão concluída'}
          </p>
          <p className="text-xs mt-2 opacity-50">
            Clique no botão "Nova Decisão" para adicionar uma decisão
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDecisions.map((decision) => (
            <div 
              key={decision.id}
              className="rounded-lg overflow-hidden shadow-sm"
              style={{ backgroundColor: 'rgba(var(--card-bg), 0.5)' }}
            >
              <div 
                className="p-4 cursor-pointer"
                onClick={() => setShowDetails(showDetails === decision.id ? null : decision.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">
                      {decision.title}
                      {decision.completed && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-green-500 bg-opacity-20 text-green-400">
                          Concluída
                        </span>
                      )}
                    </h3>
                    <p className="text-sm opacity-70 mt-1">{decision.description}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {decision.deadline && (
                      <div 
                        className={`text-xs flex items-center ${
                          isOverdue(decision.deadline) 
                            ? 'text-red-500' 
                            : isNearDeadline(decision.deadline) 
                              ? 'text-yellow-500' 
                              : 'opacity-70'
                        }`}
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDate(decision.deadline)}
                      </div>
                    )}
                    
                    <div className="text-xs opacity-70">
                      {decision.options.length} opções
                    </div>
                  </div>
                </div>
                
                {decision.selectedOptionId && (
                  <div className="mt-2 text-xs">
                    <span className="opacity-70">Opção escolhida: </span>
                    <span className="font-medium">
                      {decision.options.find((o: any) => o.id === decision.selectedOptionId)?.title}
                    </span>
                  </div>
                )}
              </div>
              
              {showDetails === decision.id && (
                <div className="p-4 border-t" style={{ borderColor: 'rgba(var(--border-color), 0.3)' }}>
                  <div className="space-y-4">
                    <div className="text-xs opacity-70 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      Criada em {formatDate(decision.createdAt)}
                    </div>
                    
                    <div className="space-y-3">
                      {decision.options.map((option) => {
                        const isRecommended = !decision.completed && 
                          getRecommendedOption(decision.id)?.id === option.id;
                        const isSelected = decision.selectedOptionId === option.id;
                        
                        return (
                          <div 
                            key={option.id}
                            className={`p-3 rounded-md ${
                              isSelected 
                                ? 'ring-2 ring-green-500' 
                                : isRecommended 
                                  ? 'ring-2 ring-blue-500' 
                                  : ''
                            }`}
                            style={{ 
                              backgroundColor: 'rgba(var(--highlight-color), 0.05)',
                              borderColor: 'rgba(var(--border-color), 0.3)'
                            }}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium flex items-center">
                                  {option.title}
                                  {isSelected && (
                                    <CheckCircle className="w-4 h-4 ml-2 text-green-500" />
                                  )}
                                  {isRecommended && (
                                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-500 bg-opacity-20 text-blue-400">
                                      Recomendada
                                    </span>
                                  )}
                                </h4>
                                <p className="text-sm opacity-70 mt-1">{option.description}</p>
                              </div>
                              
                              <div className="flex items-center space-x-3">
                                <span className={`text-xs ${getImpactColor(option.impact)}`}>
                                  {option.impact === 'high' ? 'Alto' : option.impact === 'medium' ? 'Médio' : 'Baixo'}
                                </span>
                                
                                <span className={`text-xs ${getTimeOfDayColor(option.timeOfDay)}`}>
                                  {getTimeOfDayEmoji(option.timeOfDay)}
                                  {option.timeOfDay === 'dawn' 
                                    ? ' Madrugada' 
                                    : option.timeOfDay === 'day' 
                                      ? ' Dia' 
                                      : option.timeOfDay === 'night' 
                                        ? ' Noite' 
                                        : ' Qualquer'}
                                </span>
                                
                                {!decision.completed && (
                                  <button
                                    onClick={() => selectOption(decision.id, option.id)}
                                    className="px-2 py-1 text-xs rounded bg-green-500 bg-opacity-20 text-green-400"
                                  >
                                    Escolher
                                  </button>
                                )}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mt-3">
                              <div>
                                <h5 className="text-xs font-medium flex items-center mb-1">
                                  <ThumbsUp className="w-3 h-3 mr-1 text-green-500" />
                                  Prós
                                </h5>
                                {option.pros.length > 0 ? (
                                  <ul className="text-xs space-y-1">
                                    {option.pros.map((pro, index) => (
                                      <li key={index} className="flex items-start">
                                        <span className="mr-1">•</span>
                                        <span>{pro}</span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-xs opacity-50">Nenhum pró listado</p>
                                )}
                              </div>
                              
                              <div>
                                <h5 className="text-xs font-medium flex items-center mb-1">
                                  <ThumbsDown className="w-3 h-3 mr-1 text-red-500" />
                                  Contras
                                </h5>
                                {option.cons.length > 0 ? (
                                  <ul className="text-xs space-y-1">
                                    {option.cons.map((con, index) => (
                                      <li key={index} className="flex items-start">
                                        <span className="mr-1">•</span>
                                        <span>{con}</span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-xs opacity-50">Nenhum contra listado</p>
                                )}
                              </div>
                            </div>
                            
                            {!isRecommendedForCurrentTheme(option) && !decision.completed && (
                              <div className="mt-3 text-xs bg-yellow-500 bg-opacity-10 text-yellow-400 p-2 rounded">
                                <AlertCircle className="w-3 h-3 inline mr-1" />
                                Esta opção não é ideal para o período atual ({theme === 'dawn' ? 'Madrugada' : theme === 'day' ? 'Dia' : 'Noite'})
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DecisionList;
