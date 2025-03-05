import React, { useState } from 'react';
import { useDecision } from '@/contexts/DecisionContext';
import { useTheme } from '@/contexts/ThemeContext';
import { AlertCircle, Check, Edit2, PlusCircle, Save, Trash2 } from 'lucide-react';

export interface DecisionRule {
  id: string;
  title: string;
  description: string;
  priority: number; // 1-10, com 10 sendo a mais alta
  timeOfDay: 'dawn' | 'day' | 'night' | 'any';
  category: string;
  active: boolean;
}

const defaultRules: DecisionRule[] = [
  {
    id: 'rule-1',
    title: 'Priorizar Bem-Estar',
    description: 'Decisões que afetam seu bem-estar físico ou mental devem sempre ter prioridade sobre ganhos materiais de curto prazo.',
    priority: 10,
    timeOfDay: 'any',
    category: 'bem-estar',
    active: true
  },
  {
    id: 'rule-2',
    title: 'Decisões Analíticas pela Manhã',
    description: 'Decisões que exigem análise detalhada e pensamento lógico são mais eficazes quando tomadas durante a madrugada ou início da manhã.',
    priority: 8,
    timeOfDay: 'dawn',
    category: 'produtividade',
    active: true
  },
  {
    id: 'rule-3',
    title: 'Decisões Criativas à Noite',
    description: 'Decisões que exigem pensamento criativo e inovação são mais eficazes quando tomadas durante a noite.',
    priority: 8,
    timeOfDay: 'night',
    category: 'criatividade',
    active: true
  }
];

const DecisionRules: React.FC = () => {
  const { theme } = useTheme();
  const [rules, setRules] = useState<DecisionRule[]>(() => {
    const savedRules = localStorage.getItem('decisionRules');
    return savedRules ? JSON.parse(savedRules) : defaultRules;
  });
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [newRule, setNewRule] = useState<Omit<DecisionRule, 'id'> | null>(null);
  
  // Salvar regras no localStorage quando houver mudanças
  React.useEffect(() => {
    localStorage.setItem('decisionRules', JSON.stringify(rules));
  }, [rules]);
  
  const handleToggleRule = (id: string) => {
    setRules(prevRules => 
      prevRules.map(rule => 
        rule.id === id ? { ...rule, active: !rule.active } : rule
      )
    );
  };
  
  const handleEditRule = (id: string) => {
    setEditingRuleId(id);
    setNewRule(null);
  };
  
  const handleAddNewRule = () => {
    setNewRule({
      title: '',
      description: '',
      priority: 5,
      timeOfDay: 'any',
      category: '',
      active: true
    });
    setEditingRuleId(null);
  };
  
  const handleSaveRule = (rule: DecisionRule) => {
    setRules(prevRules => 
      prevRules.map(r => 
        r.id === rule.id ? rule : r
      )
    );
    setEditingRuleId(null);
  };
  
  const handleSaveNewRule = (rule: Omit<DecisionRule, 'id'>) => {
    const newRuleWithId: DecisionRule = {
      ...rule,
      id: `rule-${Date.now()}`
    };
    
    setRules(prevRules => [...prevRules, newRuleWithId]);
    setNewRule(null);
  };
  
  const handleDeleteRule = (id: string) => {
    setRules(prevRules => prevRules.filter(rule => rule.id !== id));
    if (editingRuleId === id) {
      setEditingRuleId(null);
    }
  };
  
  const handleCancelEdit = () => {
    setEditingRuleId(null);
    setNewRule(null);
  };
  
  // Obter cor para o período do dia
  const getTimeOfDayColor = (timeOfDay: string) => {
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
  const getTimeOfDayEmoji = (timeOfDay: string) => {
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
  
  // Verificar se uma regra é aplicável ao tema atual
  const isRuleApplicableToCurrentTheme = (rule: DecisionRule) => {
    return rule.timeOfDay === 'any' || rule.timeOfDay === theme;
  };
  
  // Componente de edição de regra
  const RuleEditor: React.FC<{ 
    rule: DecisionRule | Omit<DecisionRule, 'id'>, 
    onSave: (rule: any) => void,
    onCancel: () => void,
    isNew?: boolean
  }> = ({ rule, onSave, onCancel, isNew = false }) => {
    const [editedRule, setEditedRule] = useState(rule);
    
    const handleChange = (field: string, value: any) => {
      setEditedRule(prev => ({ ...prev, [field]: value }));
    };
    
    return (
      <div 
        className="p-4 rounded-lg mb-4"
        style={{ backgroundColor: 'rgba(var(--highlight-color), 0.05)' }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Título da Regra
            </label>
            <input
              type="text"
              value={editedRule.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full p-2 rounded-md border"
              style={{ 
                backgroundColor: 'rgba(var(--bg-color), 0.5)',
                borderColor: 'rgba(var(--border-color), 0.5)'
              }}
              placeholder="Ex: Priorizar Bem-Estar"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Descrição
            </label>
            <textarea
              value={editedRule.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full p-2 rounded-md border"
              style={{ 
                backgroundColor: 'rgba(var(--bg-color), 0.5)',
                borderColor: 'rgba(var(--border-color), 0.5)'
              }}
              rows={3}
              placeholder="Descreva a regra de decisão..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Prioridade (1-10)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={editedRule.priority}
                onChange={(e) => handleChange('priority', parseInt(e.target.value))}
                className="w-full p-2 rounded-md border"
                style={{ 
                  backgroundColor: 'rgba(var(--bg-color), 0.5)',
                  borderColor: 'rgba(var(--border-color), 0.5)'
                }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Período do Dia
              </label>
              <select
                value={editedRule.timeOfDay}
                onChange={(e) => handleChange('timeOfDay', e.target.value)}
                className="w-full p-2 rounded-md border"
                style={{ 
                  backgroundColor: 'rgba(var(--bg-color), 0.5)',
                  borderColor: 'rgba(var(--border-color), 0.5)'
                }}
              >
                <option value="any">Qualquer</option>
                <option value="dawn">Madrugada</option>
                <option value="day">Dia</option>
                <option value="night">Noite</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Categoria
            </label>
            <input
              type="text"
              value={editedRule.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full p-2 rounded-md border"
              style={{ 
                backgroundColor: 'rgba(var(--bg-color), 0.5)',
                borderColor: 'rgba(var(--border-color), 0.5)'
              }}
              placeholder="Ex: bem-estar, produtividade, finanças"
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1 rounded-md text-sm"
              style={{ backgroundColor: 'rgba(var(--highlight-color), 0.1)' }}
            >
              Cancelar
            </button>
            
            <button
              type="button"
              onClick={() => onSave(editedRule)}
              className="px-3 py-1 rounded-md text-sm flex items-center"
              style={{ backgroundColor: 'rgba(var(--accent-color), 0.2)' }}
            >
              <Save className="w-4 h-4 mr-1" />
              Salvar
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Renderizar regra individual
  const RuleItem: React.FC<{ rule: DecisionRule }> = ({ rule }) => {
    if (editingRuleId === rule.id) {
      return (
        <RuleEditor 
          rule={rule} 
          onSave={handleSaveRule} 
          onCancel={handleCancelEdit}
        />
      );
    }
    
    const isApplicable = isRuleApplicableToCurrentTheme(rule);
    
    return (
      <div 
        className={`p-4 rounded-lg mb-4 ${!rule.active ? 'opacity-50' : ''}`}
        style={{ 
          backgroundColor: 'rgba(var(--card-bg), 0.5)',
          borderLeft: `4px solid rgba(var(--accent-color), ${rule.active ? '0.8' : '0.3'})`
        }}
      >
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center">
              <h3 className="font-medium">{rule.title}</h3>
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(var(--highlight-color), 0.1)' }}>
                Prioridade: {rule.priority}
              </span>
              <span className={`ml-2 text-xs ${getTimeOfDayColor(rule.timeOfDay)}`}>
                {getTimeOfDayEmoji(rule.timeOfDay)}
              </span>
            </div>
            <p className="text-sm opacity-70 mt-1">{rule.description}</p>
            
            {rule.category && (
              <div className="mt-2">
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(var(--highlight-color), 0.1)' }}>
                  {rule.category}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handleToggleRule(rule.id)}
              className={`p-1 rounded-full ${rule.active ? 'text-green-500' : 'text-gray-400'}`}
            >
              <Check className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => handleEditRule(rule.id)}
              className="p-1 rounded-full text-blue-400"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => handleDeleteRule(rule.id)}
              className="p-1 rounded-full text-red-400"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {!isApplicable && rule.active && (
          <div className="mt-3 text-xs bg-yellow-500 bg-opacity-10 text-yellow-400 p-2 rounded">
            <AlertCircle className="w-3 h-3 inline mr-1" />
            Esta regra não é ideal para o período atual ({theme === 'dawn' ? 'Madrugada' : theme === 'day' ? 'Dia' : 'Noite'})
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Regras de Decisão</h2>
        <button
          onClick={handleAddNewRule}
          className="px-3 py-1 rounded-md text-sm flex items-center"
          style={{ backgroundColor: 'rgba(var(--accent-color), 0.2)' }}
        >
          <PlusCircle className="w-4 h-4 mr-1" />
          Nova Regra
        </button>
      </div>
      
      <div className="p-4 rounded-lg mb-6" style={{ backgroundColor: 'rgba(var(--highlight-color), 0.05)' }}>
        <p className="text-sm">
          Regras de decisão estabelecem princípios que guiam suas escolhas. Regras com maior prioridade devem prevalecer sobre outras considerações quando houver conflito.
        </p>
      </div>
      
      {newRule && (
        <RuleEditor 
          rule={newRule} 
          onSave={handleSaveNewRule} 
          onCancel={handleCancelEdit}
          isNew={true}
        />
      )}
      
      <div>
        {rules
          .sort((a, b) => b.priority - a.priority)
          .map(rule => (
            <RuleItem key={rule.id} rule={rule} />
          ))
        }
        
        {rules.length === 0 && !newRule && (
          <div className="text-center p-6 opacity-70">
            <p>Nenhuma regra de decisão definida</p>
            <p className="text-sm mt-2">Clique em "Nova Regra" para adicionar</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DecisionRules;
