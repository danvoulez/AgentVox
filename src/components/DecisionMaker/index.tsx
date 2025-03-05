import React, { useState } from 'react';
import { useDecision } from '@/contexts/DecisionContext';
import { useTheme } from '@/contexts/ThemeContext';
import DecisionList from './DecisionList';
import NewDecisionForm from './NewDecisionForm';
import { PlusCircle, Clock, Calendar, Lightbulb } from 'lucide-react';
import useTimeAwareTheme from '@/hooks/useTimeAwareTheme';

const DecisionMaker: React.FC = () => {
  const { getPendingDecisions, getDecisionsForCurrentTimeOfDay } = useDecision();
  const { theme } = useTheme();
  const { timeOfDay, formattedTime } = useTimeAwareTheme();
  const [showNewDecisionForm, setShowNewDecisionForm] = useState(false);
  
  const pendingDecisions = getPendingDecisions();
  const currentTimeDecisions = getDecisionsForCurrentTimeOfDay();
  
  // Obter a mensagem de recomendação com base no período do dia
  const getTimeBasedMessage = () => {
    switch (timeOfDay) {
      case 'dawn':
        return 'Este é um bom momento para decisões que exigem clareza mental e foco.';
      case 'day':
        return 'Durante o dia, você tende a ter mais energia para decisões importantes.';
      case 'night':
        return 'À noite, você pode estar mais criativo, mas talvez menos analítico.';
      default:
        return 'Considere o momento do dia ao tomar suas decisões.';
    }
  };
  
  return (
    <div className="space-y-6">
      {showNewDecisionForm && (
        <NewDecisionForm onClose={() => setShowNewDecisionForm(false)} />
      )}
      
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Horizonte de Decisões</h2>
        <button
          onClick={() => setShowNewDecisionForm(true)}
          className="px-4 py-2 rounded-md text-sm font-medium flex items-center"
          style={{ backgroundColor: 'rgba(var(--accent-color), 0.2)' }}
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Nova Decisão
        </button>
      </div>
      
      <div 
        className="p-4 rounded-lg"
        style={{ backgroundColor: 'rgba(var(--highlight-color), 0.05)' }}
      >
        <div className="flex items-center mb-3">
          <Lightbulb className="w-5 h-5 mr-2" style={{ color: 'rgba(var(--accent-color), 1)' }} />
          <h3 className="font-medium">Assistente de Decisões</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 rounded-md" style={{ backgroundColor: 'rgba(var(--card-bg), 0.7)' }}>
            <div className="flex items-center text-sm mb-2">
              <Clock className="w-4 h-4 mr-2 opacity-70" />
              <span>Agora: {formattedTime}</span>
            </div>
            <div className="text-xs opacity-70">
              {getTimeBasedMessage()}
            </div>
          </div>
          
          <div className="p-3 rounded-md" style={{ backgroundColor: 'rgba(var(--card-bg), 0.7)' }}>
            <div className="flex items-center text-sm mb-2">
              <Calendar className="w-4 h-4 mr-2 opacity-70" />
              <span>Decisões Pendentes</span>
            </div>
            <div className="text-xs opacity-70">
              {pendingDecisions.length === 0 
                ? 'Nenhuma decisão pendente no momento.' 
                : `Você tem ${pendingDecisions.length} decisão(ões) pendente(s).`}
            </div>
          </div>
          
          <div className="p-3 rounded-md" style={{ backgroundColor: 'rgba(var(--card-bg), 0.7)' }}>
            <div className="flex items-center text-sm mb-2">
              <span className="mr-2 text-lg">
                {timeOfDay === 'dawn' ? '🌅' : timeOfDay === 'day' ? '☀️' : '🌙'}
              </span>
              <span>Recomendação</span>
            </div>
            <div className="text-xs opacity-70">
              {currentTimeDecisions.length === 0 
                ? `Sem decisões específicas para ${timeOfDay === 'dawn' ? 'a madrugada' : timeOfDay === 'day' ? 'o dia' : 'a noite'}.` 
                : `${currentTimeDecisions.length} decisão(ões) ideal(is) para este período.`}
            </div>
          </div>
        </div>
      </div>
      
      <DecisionList />
    </div>
  );
};

export default DecisionMaker;
