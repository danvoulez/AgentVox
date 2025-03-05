import React, { useState, useEffect } from 'react';
import { useDecision, DecisionOption } from '@/contexts/DecisionContext';
import { PlusCircle, Trash2, Clock, Check, Sliders, Tag, Users } from 'lucide-react';
import ArchetypeEvaluation from './ArchetypeEvaluation';

const NewDecisionForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addDecision } = useDecision();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [options, setOptions] = useState<Omit<DecisionOption, 'id'>[]>([
    {
      title: '',
      description: '',
      pros: [''],
      cons: [''],
      impact: 'medium',
      timeOfDay: 'any',
      gradientFactors: {
        urgency: 5,
        importance: 5,
        confidence: 5,
        emotionalImpact: 5,
        longTermValue: 5
      },
      categories: []
    }
  ]);
  
  const handleAddOption = () => {
    setOptions([
      ...options,
      {
        title: '',
        description: '',
        pros: [''],
        cons: [''],
        impact: 'medium',
        timeOfDay: 'any',
        gradientFactors: {
          urgency: 5,
          importance: 5,
          confidence: 5,
          emotionalImpact: 5,
          longTermValue: 5
        },
        categories: []
      }
    ]);
  };
  
  const handleRemoveOption = (index: number) => {
    if (options.length > 1) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };
  
  const handleOptionChange = (index: number, field: keyof DecisionOption, value: any) => {
    const newOptions = [...options];
    newOptions[index] = {
      ...newOptions[index],
      [field]: value
    };
    setOptions(newOptions);
  };
  
  const handleGradientChange = (optionIndex: number, factor: string, value: number) => {
    const newOptions = [...options];
    if (!newOptions[optionIndex].gradientFactors) {
      newOptions[optionIndex].gradientFactors = {
        urgency: 5,
        importance: 5,
        confidence: 5,
        emotionalImpact: 5,
        longTermValue: 5
      };
    }
    
    newOptions[optionIndex].gradientFactors = {
      ...newOptions[optionIndex].gradientFactors!,
      [factor]: value
    };
    
    setOptions(newOptions);
  };
  
  const handleCategoryChange = (optionIndex: number, categories: string[]) => {
    const newOptions = [...options];
    newOptions[optionIndex].categories = categories;
    setOptions(newOptions);
  };
  
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  
  // Carregar categorias existentes de regras
  useEffect(() => {
    const savedRules = localStorage.getItem('decisionRules');
    if (savedRules) {
      try {
        const parsedRules = JSON.parse(savedRules);
        const categories = parsedRules
          .map((rule: any) => rule.category)
          .filter((category: string) => category && category.trim() !== '');
        
        // Usar Array.from para evitar erro de tipo com Set
        setAvailableCategories(Array.from(new Set(categories)));
      } catch (e) {
        console.error('Erro ao carregar categorias das regras:', e);
      }
    }
  }, []);
  
  const handleAddPro = (optionIndex: number) => {
    const newOptions = [...options];
    newOptions[optionIndex].pros.push('');
    setOptions(newOptions);
  };
  
  const handleAddCon = (optionIndex: number) => {
    const newOptions = [...options];
    newOptions[optionIndex].cons.push('');
    setOptions(newOptions);
  };
  
  const handleProChange = (optionIndex: number, proIndex: number, value: string) => {
    const newOptions = [...options];
    newOptions[optionIndex].pros[proIndex] = value;
    setOptions(newOptions);
  };
  
  const handleConChange = (optionIndex: number, conIndex: number, value: string) => {
    const newOptions = [...options];
    newOptions[optionIndex].cons[conIndex] = value;
    setOptions(newOptions);
  };
  
  const handleRemovePro = (optionIndex: number, proIndex: number) => {
    const newOptions = [...options];
    newOptions[optionIndex].pros = newOptions[optionIndex].pros.filter((_, i) => i !== proIndex);
    setOptions(newOptions);
  };
  
  const handleRemoveCon = (optionIndex: number, conIndex: number) => {
    const newOptions = [...options];
    newOptions[optionIndex].cons = newOptions[optionIndex].cons.filter((_, i) => i !== conIndex);
    setOptions(newOptions);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar formulário
    if (!title.trim()) {
      alert('Por favor, adicione um título para a decisão');
      return;
    }
    
    if (options.some(option => !option.title.trim())) {
      alert('Todas as opções precisam ter um título');
      return;
    }
    
    // Adicionar IDs às opções
    const optionsWithIds = options.map(option => ({
      ...option,
      id: Math.random().toString(36).substring(2, 11),
      pros: option.pros.filter(pro => pro.trim()),
      cons: option.cons.filter(con => con.trim())
    }));
    
    // Criar a nova decisão
    addDecision({
      title,
      description,
      options: optionsWithIds,
      deadline: deadline ? new Date(deadline) : undefined
    });
    
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
      <div 
        className="rounded-lg shadow-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'rgba(var(--card-bg), 0.95)' }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Nova Decisão</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-opacity-10 hover:bg-gray-500 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Título da Decisão
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 rounded-md border"
              style={{ 
                backgroundColor: 'rgba(var(--bg-color), 0.5)',
                borderColor: 'rgba(var(--border-color), 0.5)'
              }}
              placeholder="Ex: Escolher um novo projeto para trabalhar"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Descrição
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 rounded-md border"
              style={{ 
                backgroundColor: 'rgba(var(--bg-color), 0.5)',
                borderColor: 'rgba(var(--border-color), 0.5)'
              }}
              rows={3}
              placeholder="Descreva a decisão que precisa ser tomada..."
            />
          </div>
          
          <div>
            <label htmlFor="deadline" className="block text-sm font-medium mb-1">
              Prazo (opcional)
            </label>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 opacity-70" />
              <input
                type="datetime-local"
                id="deadline"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="p-2 rounded-md border"
                style={{ 
                  backgroundColor: 'rgba(var(--bg-color), 0.5)',
                  borderColor: 'rgba(var(--border-color), 0.5)'
                }}
              />
            </div>
          </div>
          
          <div className="border-t pt-4" style={{ borderColor: 'rgba(var(--border-color), 0.3)' }}>
            <h3 className="text-lg font-medium mb-4">Opções</h3>
            
            {options.map((option, optionIndex) => (
              <div 
                key={optionIndex} 
                className="mb-8 p-4 rounded-lg"
                style={{ backgroundColor: 'rgba(var(--highlight-color), 0.05)' }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">Opção {optionIndex + 1}</h4>
                  {options.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(optionIndex)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Título da Opção
                    </label>
                    <input
                      type="text"
                      value={option.title}
                      onChange={(e) => handleOptionChange(optionIndex, 'title', e.target.value)}
                      className="w-full p-2 rounded-md border"
                      style={{ 
                        backgroundColor: 'rgba(var(--bg-color), 0.5)',
                        borderColor: 'rgba(var(--border-color), 0.5)'
                      }}
                      placeholder="Ex: Projeto A"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Descrição da Opção
                    </label>
                    <textarea
                      value={option.description}
                      onChange={(e) => handleOptionChange(optionIndex, 'description', e.target.value)}
                      className="w-full p-2 rounded-md border"
                      style={{ 
                        backgroundColor: 'rgba(var(--bg-color), 0.5)',
                        borderColor: 'rgba(var(--border-color), 0.5)'
                      }}
                      rows={2}
                      placeholder="Descreva esta opção..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Impacto
                      </label>
                      <select
                        value={option.impact}
                        onChange={(e) => handleOptionChange(optionIndex, 'impact', e.target.value)}
                        className="w-full p-2 rounded-md border"
                        style={{ 
                          backgroundColor: 'rgba(var(--bg-color), 0.5)',
                          borderColor: 'rgba(var(--border-color), 0.5)'
                        }}
                      >
                        <option value="low">Baixo</option>
                        <option value="medium">Médio</option>
                        <option value="high">Alto</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Melhor Período do Dia
                      </label>
                      <select
                        value={option.timeOfDay}
                        onChange={(e) => handleOptionChange(optionIndex, 'timeOfDay', e.target.value)}
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
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium">
                        <div className="flex items-center">
                          <Tag className="w-3 h-3 mr-1" />
                          Categorias
                        </div>
                      </label>
                      <span className="text-xs opacity-70">Selecione categorias para aplicar regras específicas</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {availableCategories.map((category) => (
                        <label key={category} className="flex items-center space-x-1 text-sm">
                          <input
                            type="checkbox"
                            checked={option.categories?.includes(category) || false}
                            onChange={(e) => {
                              const newCategories = e.target.checked
                                ? [...(option.categories || []), category]
                                : (option.categories || []).filter(c => c !== category);
                              handleCategoryChange(optionIndex, newCategories);
                            }}
                            className="rounded"
                          />
                          <span>{category}</span>
                        </label>
                      ))}
                      
                      {availableCategories.length === 0 && (
                        <span className="text-xs opacity-70">Nenhuma categoria disponível. Adicione categorias nas regras de decisão.</span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium">
                        <div className="flex items-center">
                          <Sliders className="w-3 h-3 mr-1" />
                          Fatores de Gradiente
                        </div>
                      </label>
                      <span className="text-xs opacity-70">Ajuste os fatores para análise de nuances</span>
                    </div>
                    
                    <div className="space-y-3 p-3 rounded-md" style={{ backgroundColor: 'rgba(var(--highlight-color), 0.05)' }}>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Urgência</span>
                          <span>{option.gradientFactors?.urgency || 5}/10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={option.gradientFactors?.urgency || 5}
                          onChange={(e) => handleGradientChange(optionIndex, 'urgency', parseInt(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Importância</span>
                          <span>{option.gradientFactors?.importance || 5}/10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={option.gradientFactors?.importance || 5}
                          onChange={(e) => handleGradientChange(optionIndex, 'importance', parseInt(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Confiança</span>
                          <span>{option.gradientFactors?.confidence || 5}/10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={option.gradientFactors?.confidence || 5}
                          onChange={(e) => handleGradientChange(optionIndex, 'confidence', parseInt(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Impacto Emocional</span>
                          <span>{option.gradientFactors?.emotionalImpact || 5}/10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={option.gradientFactors?.emotionalImpact || 5}
                          onChange={(e) => handleGradientChange(optionIndex, 'emotionalImpact', parseInt(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Valor a Longo Prazo</span>
                          <span>{option.gradientFactors?.longTermValue || 5}/10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={option.gradientFactors?.longTermValue || 5}
                          onChange={(e) => handleGradientChange(optionIndex, 'longTermValue', parseInt(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium">
                          Prós
                        </label>
                        <button
                          type="button"
                          onClick={() => handleAddPro(optionIndex)}
                          className="text-xs flex items-center opacity-70 hover:opacity-100 transition-opacity"
                        >
                          <PlusCircle className="w-3 h-3 mr-1" />
                          Adicionar
                        </button>
                      </div>
                      
                      {option.pros.map((pro, proIndex) => (
                        <div key={proIndex} className="flex items-center mb-2">
                          <input
                            type="text"
                            value={pro}
                            onChange={(e) => handleProChange(optionIndex, proIndex, e.target.value)}
                            className="flex-1 p-1 text-sm rounded-md border"
                            style={{ 
                              backgroundColor: 'rgba(var(--bg-color), 0.5)',
                              borderColor: 'rgba(var(--border-color), 0.5)'
                            }}
                            placeholder="Vantagem..."
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePro(optionIndex, proIndex)}
                            className="ml-1 text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium">
                          Contras
                        </label>
                        <button
                          type="button"
                          onClick={() => handleAddCon(optionIndex)}
                          className="text-xs flex items-center opacity-70 hover:opacity-100 transition-opacity"
                        >
                          <PlusCircle className="w-3 h-3 mr-1" />
                          Adicionar
                        </button>
                      </div>
                      
                      {option.cons.map((con, conIndex) => (
                        <div key={conIndex} className="flex items-center mb-2">
                          <input
                            type="text"
                            value={con}
                            onChange={(e) => handleConChange(optionIndex, conIndex, e.target.value)}
                            className="flex-1 p-1 text-sm rounded-md border"
                            style={{ 
                              backgroundColor: 'rgba(var(--bg-color), 0.5)',
                              borderColor: 'rgba(var(--border-color), 0.5)'
                            }}
                            placeholder="Desvantagem..."
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveCon(optionIndex, conIndex)}
                            className="ml-1 text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Avaliação dos Arquétipos de Conselheiros */}
                  <div className="mt-4 p-3 rounded-md" style={{ backgroundColor: 'rgba(var(--highlight-color), 0.05)' }}>
                    <div className="flex items-center mb-2">
                      <Users className="w-4 h-4 mr-2" style={{ color: 'rgba(var(--accent-color), 1)' }} />
                      <h3 className="text-sm font-medium">Conselho dos Arquétipos</h3>
                    </div>
                    <ArchetypeEvaluation option={{...option, id: `preview-${optionIndex}`} as DecisionOption} />
                    <div className="text-xs opacity-70 mt-2">
                      Os conselheiros analisam esta opção com base em diferentes perspectivas e valores.
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={handleAddOption}
              className="w-full py-2 rounded-md border-dashed border-2 flex items-center justify-center"
              style={{ borderColor: 'rgba(var(--border-color), 0.5)' }}
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Adicionar Opção
            </button>
          </div>
          
          <div className="flex justify-end space-x-4 pt-4 border-t" style={{ borderColor: 'rgba(var(--border-color), 0.3)' }}>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-sm font-medium"
              style={{ backgroundColor: 'rgba(var(--highlight-color), 0.1)' }}
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              className="px-4 py-2 rounded-md text-sm font-medium flex items-center"
              style={{ backgroundColor: 'rgba(var(--accent-color), 0.2)' }}
            >
              <Check className="w-4 h-4 mr-2" />
              Salvar Decisão
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewDecisionForm;
