import React, { useState, useEffect } from 'react';
import { useVox, VoxMemory } from '@/contexts/VoxContext';
import { Brain, Search, Clock, Star, Plus, Trash2, Edit2, Save, X, Filter } from 'lucide-react';
import MemoryDetail from './MemoryDetail';
import MemoryCreationForm from './MemoryCreationForm';
import { motion, AnimatePresence } from 'framer-motion';

// Baseado no modelo de memória Atkinson-Shiffrin e na curva de esquecimento de Ebbinghaus
const MemorySystem: React.FC = () => {
  const { memories, retrieveRelevantMemories, deleteMemory } = useVox();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMemories, setFilteredMemories] = useState<VoxMemory[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<VoxMemory | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [memoryTypeFilter, setMemoryTypeFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'importance' | 'recency'>('importance');
  const [isSearching, setIsSearching] = useState(false);

  // Tipos de memória baseados em pesquisas cognitivas
  const memoryTypes = [
    { id: 'episodic', name: 'Episódica', description: 'Eventos específicos e experiências pessoais' },
    { id: 'semantic', name: 'Semântica', description: 'Conhecimento factual e conceitual' },
    { id: 'procedural', name: 'Procedimental', description: 'Habilidades e procedimentos' },
    { id: 'emotional', name: 'Emocional', description: 'Associações emocionais e sentimentos' },
    { id: 'autobiographical', name: 'Autobiográfica', description: 'Eventos significativos da vida' }
  ];

  // Efeito para carregar memórias iniciais
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMemories(sortMemories(memories, sortBy));
      setIsSearching(false);
    }
  }, [memories, sortBy]);

  // Função para buscar memórias relevantes
  const handleSearch = async () => {
    if (searchQuery.trim() === '') {
      setFilteredMemories(sortMemories(memories, sortBy));
      return;
    }

    setIsSearching(true);
    try {
      const relevantMemories = await retrieveRelevantMemories(searchQuery);
      setFilteredMemories(sortMemories(relevantMemories, sortBy));
    } catch (error) {
      console.error('Error searching memories:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Ordenar memórias com base em importância ou recência
  const sortMemories = (memoriesToSort: VoxMemory[], sortCriteria: 'importance' | 'recency') => {
    return [...memoriesToSort].sort((a, b) => {
      if (sortCriteria === 'importance') {
        return b.importance - a.importance;
      } else {
        return new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime();
      }
    });
  };

  // Filtrar memórias por tipo
  const filterByType = (memories: VoxMemory[], typeFilter: string | null) => {
    if (!typeFilter) return memories;
    return memories.filter((memory: any) => memory.memoryType === typeFilter);
  };

  // Memórias filtradas e ordenadas
  const displayedMemories = filterByType(filteredMemories, memoryTypeFilter);

  // Calcular a "força" da memória com base na curva de esquecimento de Ebbinghaus
  const calculateMemoryStrength = (memory: VoxMemory) => {
    const lastAccessedDate = new Date(memory.lastAccessed);
    const now = new Date();
    const daysSinceLastAccess = Math.max(1, Math.floor((now.getTime() - lastAccessedDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Fórmula da curva de esquecimento: R = e^(-t/S), onde R é retenção, t é tempo, e S é força da memória
    const retentionRate = Math.exp(-daysSinceLastAccess / (memory.importance * 2));
    return Math.max(0.1, Math.min(1, retentionRate));
  };

  // Agrupar memórias por força (implementando o modelo de memória de trabalho de Baddeley)
  const getMemoryStrengthCategory = (strength: number) => {
    if (strength > 0.8) return 'strong';
    if (strength > 0.4) return 'medium';
    return 'weak';
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-md p-6 w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Brain className="w-6 h-6 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold text-blue-800">Sistema de Memória</h2>
        </div>
        
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4 mr-1" />
          <span className="text-sm font-medium">Nova Memória</span>
        </button>
      </div>

      {/* Barra de pesquisa e filtros */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            onKeyDown={(e: React.ChangeEvent<HTMLInputElement>) => e.key === 'Enter' && handleSearch()}
            placeholder="Buscar memórias..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {isSearching ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
            ) : (
              <span className="text-sm text-blue-600 hover:text-blue-800">Buscar</span>
            )}
          </button>
        </div>
        
        <div className="flex space-x-2">
          <div className="relative inline-block">
            <select
              value={memoryTypeFilter || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMemoryTypeFilter(e.target.value || null)}
              className="appearance-none pl-8 pr-10 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Todos os tipos</option>
              {memoryTypes.map((type: any) => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          <div className="relative inline-block">
            <select
              value={sortBy}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSortBy(e.target.value as 'importance' | 'recency')}
              className="appearance-none pl-8 pr-10 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="importance">Importância</option>
              <option value="recency">Recência</option>
            </select>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Clock className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de memórias */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {displayedMemories.length > 0 ? (
          displayedMemories.map((memory) => {
            const strength = calculateMemoryStrength(memory);
            const strengthCategory = getMemoryStrengthCategory(strength);
            
            return (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow border-l-4 ${
                  strengthCategory === 'strong' ? 'border-green-500' :
                  strengthCategory === 'medium' ? 'border-yellow-500' :
                  'border-red-500'
                }`}
                onClick={() => setSelectedMemory(memory)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 mr-2">
                        {memoryTypes.find((t: any) => t.id === memory.memoryType)?.name || memory.memoryType}
                      </span>
                      <div className="flex items-center">
                        {Array.from({ length: Math.ceil(memory.importance) }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-yellow-400" fill="#FBBF24" />
                        ))}
                      </div>
                    </div>
                    <h3 className="font-medium mt-1 text-gray-900">
                      {typeof memory.content === 'object' && memory.content.title 
                        ? memory.content.title 
                        : typeof memory.content === 'string'
                          ? memory.content.substring(0, 50) + (memory.content.length > 50 ? '...' : '')
                          : 'Memória sem título'}
                    </h3>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(memory.lastAccessed).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="mt-2">
                  <div className="text-xs text-gray-600 line-clamp-2">
                    {typeof memory.content === 'object' && memory.content.description
                      ? memory.content.description
                      : typeof memory.content === 'string'
                        ? memory.content
                        : JSON.stringify(memory.content).substring(0, 100) + '...'}
                  </div>
                </div>
                
                <div className="mt-2 flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    Força da memória: {Math.round(strength * 100)}%
                  </div>
                  <button
                    onClick={(e: React.ChangeEvent<HTMLInputElement>) => {
                      e.stopPropagation();
                      if (confirm('Tem certeza que deseja excluir esta memória?')) {
                        deleteMemory(memory.id);
                      }
                    }}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-2 bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-500 mb-2">
              {isSearching 
                ? 'Buscando memórias...'
                : searchQuery 
                  ? 'Nenhuma memória encontrada para esta busca.' 
                  : 'Nenhuma memória encontrada. Crie sua primeira memória!'}
            </div>
            {!isSearching && searchQuery && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Criar nova memória
              </button>
            )}
          </div>
        )}
      </div>

      {/* Detalhes da memória selecionada */}
      <AnimatePresence>
        {selectedMemory && (
          <MemoryDetail 
            memory={selectedMemory} 
            onClose={() => setSelectedMemory(null)} 
            memoryTypes={memoryTypes}
          />
        )}
      </AnimatePresence>

      {/* Formulário de criação de memória */}
      <AnimatePresence>
        {showCreateForm && (
          <MemoryCreationForm 
            onClose={() => setShowCreateForm(false)} 
            memoryTypes={memoryTypes}
          />
        )}
      </AnimatePresence>

      {/* Informações sobre o sistema de memória */}
      <div className="bg-blue-50 rounded-lg p-4 mt-6">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Sobre o Sistema de Memória</h3>
        <p className="text-xs text-blue-700">
          Este sistema é baseado no modelo de memória Atkinson-Shiffrin e na curva de esquecimento de Ebbinghaus.
          As memórias são classificadas por tipo (episódica, semântica, procedimental, etc.) e têm uma "força" que
          diminui com o tempo, simulando o processo natural de esquecimento. Memórias mais importantes ou acessadas
          recentemente são mais resistentes ao esquecimento.
        </p>
      </div>
    </div>
  );
};

export default MemorySystem;
