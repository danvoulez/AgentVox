import React, { useState } from 'react';
import { useVox, VoxMemory } from '@/contexts/VoxContext';
import { motion } from 'framer-motion';
import { X, Edit2, Save, Star, Clock } from 'lucide-react';

interface MemoryDetailProps {
  memory: VoxMemory;
  onClose: () => void;
  memoryTypes: { id: string; name: string; description: string }[];
}

const MemoryDetail: React.FC<MemoryDetailProps> = ({ memory, onClose, memoryTypes }) => {
  const { updateMemory } = useVox();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState<any>(memory.content);
  const [editedImportance, setEditedImportance] = useState(memory.importance);
  const [editedType, setEditedType] = useState(memory.memoryType);
  const [isSaving, setIsSaving] = useState(false);

  // Formatação de data usando neurociência cognitiva - datas são mais fáceis de lembrar quando contextualizadas
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    let contextualTime = '';
    if (diffDays === 0) {
      contextualTime = 'hoje';
    } else if (diffDays === 1) {
      contextualTime = 'ontem';
    } else if (diffDays < 7) {
      contextualTime = `há ${diffDays} dias`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      contextualTime = `há ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      contextualTime = `há ${months} ${months === 1 ? 'mês' : 'meses'}`;
    } else {
      const years = Math.floor(diffDays / 365);
      contextualTime = `há ${years} ${years === 1 ? 'ano' : 'anos'}`;
    }
    
    return `${date.toLocaleDateString()} (${contextualTime})`;
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await updateMemory(memory.id, {
        content: editedContent,
        importance: editedImportance,
        memoryType: editedType
      });
      
      if (success) {
        setIsEditing(false);
      } else {
        alert('Falha ao atualizar a memória. Tente novamente.');
      }
    } catch (error) {
      console.error('Error updating memory:', error);
      alert('Erro ao atualizar a memória.');
    } finally {
      setIsSaving(false);
    }
  };

  // Renderização do conteúdo da memória com base no tipo
  const renderMemoryContent = () => {
    if (isEditing) {
      if (typeof editedContent === 'object') {
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
              <input
                type="text"
                value={editedContent.title || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedContent({ ...editedContent, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea
                value={editedContent.description || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedContent({ ...editedContent, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            {editedContent.details && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Detalhes</label>
                <textarea
                  value={editedContent.details || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedContent({ ...editedContent, details: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            )}
          </div>
        );
      } else if (typeof editedContent === 'string') {
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo</label>
            <textarea
              value={editedContent}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedContent(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        );
      } else {
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo (JSON)</label>
            <textarea
              value={JSON.stringify(editedContent, null, 2)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                try {
                  setEditedContent(JSON.parse(e.target.value));
                } catch (error) {
                  // Permitir edição mesmo com JSON inválido temporariamente
                }
              }}
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono"
            />
          </div>
        );
      }
    } else {
      if (typeof memory.content === 'object') {
        return (
          <div className="space-y-4">
            {memory.content.title && (
              <h3 className="text-lg font-medium text-gray-900">{memory.content.title}</h3>
            )}
            {memory.content.description && (
              <p className="text-sm text-gray-700 whitespace-pre-line">{memory.content.description}</p>
            )}
            {memory.content.details && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Detalhes:</h4>
                <p className="text-sm text-gray-600 whitespace-pre-line bg-gray-50 p-3 rounded-md">
                  {memory.content.details}
                </p>
              </div>
            )}
            {memory.content.links && memory.content.links.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Links:</h4>
                <ul className="list-disc list-inside text-sm text-blue-600">
                  {memory.content.links.map((link: string, index: number) => (
                    <li key={index}>
                      <a href={link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      } else if (typeof memory.content === 'string') {
        return <p className="text-sm text-gray-700 whitespace-pre-line">{memory.content}</p>;
      } else {
        return (
          <pre className="text-xs text-gray-600 bg-gray-50 p-3 rounded-md overflow-auto max-h-96">
            {JSON.stringify(memory.content, null, 2)}
          </pre>
        );
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        onClick={(e: React.ChangeEvent<HTMLInputElement>) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
          <div className="flex items-center">
            <div className="mr-3">
              <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                {memoryTypes.find((t: any) => t.id === memory.memoryType)?.name || memory.memoryType}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isEditing ? 'Editando Memória' : 'Detalhes da Memória'}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="p-2 text-gray-500 hover:text-green-600 transition-colors"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-t-green-600 border-r-green-600 border-b-green-600 border-l-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-red-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Memória</label>
                <select
                  value={editedType}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  {memoryTypes.map((type: any) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  {memoryTypes.find((t: any) => t.id === editedType)?.description}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Importância (1-5)</label>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setEditedImportance(value)}
                      className="p-1 focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          value <= editedImportance ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        fill={value <= editedImportance ? '#FBBF24' : 'none'}
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              {renderMemoryContent()}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-gray-400 mr-1" />
                  <span className="text-xs text-gray-500">
                    Criada: {formatDate(memory.createdAt)}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-gray-400 mr-1" />
                  <span className="text-xs text-gray-500">
                    Último acesso: {formatDate(memory.lastAccessed)}
                  </span>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center mb-1">
                  <span className="text-sm font-medium text-gray-700 mr-2">Importância:</span>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < memory.importance ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        fill={i < memory.importance ? '#FBBF24' : 'none'}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-4">
                {renderMemoryContent()}
              </div>
            </>
          )}
        </div>
        
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="text-xs text-gray-500">
            {isEditing ? (
              <p>
                Edite os detalhes desta memória. Memórias mais importantes são mais resistentes ao esquecimento
                e têm maior prioridade na recuperação.
              </p>
            ) : (
              <p>
                ID: {memory.id.substring(0, 8)}...{memory.id.substring(memory.id.length - 8)}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MemoryDetail;
