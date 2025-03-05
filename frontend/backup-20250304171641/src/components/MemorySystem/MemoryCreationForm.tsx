import React, { useState } from 'react';
import { useVox } from '@/contexts/VoxContext';
import { motion } from 'framer-motion';
import { X, Save, Star, HelpCircle } from 'lucide-react';

interface MemoryCreationFormProps {
  onClose: () => void;
  memoryTypes: { id: string; name: string; description: string }[];
}

// Baseado em princípios de codificação de memória da neurociência cognitiva
const MemoryCreationForm: React.FC<MemoryCreationFormProps> = ({ onClose, memoryTypes }) => {
  const { addMemory } = useVox();
  const [memoryType, setMemoryType] = useState('semantic');
  const [importance, setImportance] = useState(3);
  const [contentType, setContentType] = useState<'simple' | 'structured'>('simple');
  const [simpleContent, setSimpleContent] = useState('');
  const [structuredContent, setStructuredContent] = useState({
    title: '',
    description: '',
    details: '',
    links: [] as string[] as string[]
  });
  const [newLink, setNewLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Dicas baseadas em pesquisas sobre formação de memória
  const memoryFormationTips = [
    "Seja específico e detalhado - memórias com detalhes sensoriais são mais duradouras",
    "Use linguagem concreta em vez de abstrata - facilita a recuperação da memória",
    "Conecte a novas informações a conhecimentos existentes - fortalece as conexões neurais",
    "Organize informações em categorias - facilita o armazenamento e recuperação",
    "Inclua contexto emocional - memórias com carga emocional são mais resistentes ao esquecimento"
  ];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const content = contentType === 'simple' ? simpleContent : structuredContent;
      
      // Validação
      if (contentType === 'simple' && !simpleContent.trim()) {
        alert('Por favor, adicione algum conteúdo à memória.');
        setIsSubmitting(false);
        return;
      }
      
      if (contentType === 'structured' && !structuredContent.title.trim()) {
        alert('Por favor, adicione um título à memória.');
        setIsSubmitting(false);
        return;
      }

      const memoryId = await addMemory({
        memoryType,
        content,
        importance
      });
      
      if (memoryId) {
        onClose();
      } else {
        alert('Falha ao criar memória. Tente novamente.');
      }
    } catch (error) {
      console.error('Error creating memory:', error);
      alert('Erro ao criar memória.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addLink = () => {
    if (newLink.trim() && isValidUrl(newLink)) {
      setStructuredContent({
        ...structuredContent,
        links: [...structuredContent.links, newLink.trim()] as string[]
      });
      setNewLink('');
    } else {
      alert('Por favor, insira uma URL válida.');
    }
  };

  const removeLink = (index: number) => {
    const updatedLinks = [...structuredContent.links];
    updatedLinks.splice(index, 1);
    setStructuredContent({
      ...structuredContent,
      links: updatedLinks
    });
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
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
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Criar Nova Memória</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-red-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {showHelp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-blue-50 p-4 rounded-md mb-4"
            >
              <h3 className="text-sm font-medium text-blue-800 mb-2">Dicas para Criar Memórias Eficazes</h3>
              <ul className="list-disc list-inside text-xs text-blue-700 space-y-1">
                {memoryFormationTips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </motion.div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Memória</label>
              <select
                value={memoryType}
                onChange={(e) => setMemoryType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {memoryTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                {memoryTypes.find(t => t.id === memoryType)?.description}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Importância</label>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setImportance(value)}
                    className="p-1 focus:outline-none"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        value <= importance ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      fill={value <= importance ? '#FBBF24' : 'none'}
                    />
                  </button>
                ))}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Memórias mais importantes são mais resistentes ao esquecimento e têm maior prioridade na recuperação.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Formato do Conteúdo</label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="simple"
                    checked={contentType === 'simple'}
                    onChange={() => setContentType('simple')}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Texto Simples</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="structured"
                    checked={contentType === 'structured'}
                    onChange={() => setContentType('structured')}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Estruturado</span>
                </label>
              </div>
            </div>
            
            {contentType === 'simple' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo</label>
                <textarea
                  value={simpleContent}
                  onChange={(e) => setSimpleContent(e.target.value)}
                  rows={8}
                  placeholder="Digite o conteúdo da memória aqui..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={structuredContent.title}
                    onChange={(e) => setStructuredContent({ ...structuredContent, title: e.target.value })}
                    placeholder="Título da memória"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={structuredContent.description}
                    onChange={(e) => setStructuredContent({ ...structuredContent, description: e.target.value })}
                    rows={3}
                    placeholder="Breve descrição da memória"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Detalhes</label>
                  <textarea
                    value={structuredContent.details}
                    onChange={(e) => setStructuredContent({ ...structuredContent, details: e.target.value })}
                    rows={5}
                    placeholder="Detalhes adicionais, contexto, ou informações importantes"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Links</label>
                  <div className="flex">
                    <input
                      type="text"
                      value={newLink}
                      onChange={(e) => setNewLink(e.target.value)}
                      placeholder="https://exemplo.com"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={addLink}
                      className="px-4 py-2 bg-blue-100 text-blue-700 font-medium rounded-r-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Adicionar
                    </button>
                  </div>
                  {structuredContent.links.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {structuredContent.links.map((link, index) => (
                        <li key={index} className="flex items-center justify-between text-sm">
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline truncate max-w-[90%]"
                          >
                            {link}
                          </a>
                          <button
                            type="button"
                            onClick={() => removeLink(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-t-blue-200 border-r-blue-200 border-b-blue-200 border-l-transparent rounded-full animate-spin mr-2" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Memória
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MemoryCreationForm;
