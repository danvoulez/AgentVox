import React, { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeSettings from './ThemeSettings';

const ThemeSelector: React.FC = () => {
  const { theme, setTheme, toggleTheme, setThemeBasedOnTime } = useTheme();
  const [showSettings, setShowSettings] = useState(false);

  // Aplicar tema baseado na hora ao montar o componente
  useEffect(() => {
    // Verificar se já existe um tema salvo pelo usuário
    const savedTheme = localStorage.getItem('theme');
    if (!savedTheme) {
      setThemeBasedOnTime();
    }
  }, [setThemeBasedOnTime]);

  const handleThemeChange = (newTheme: 'dawn' | 'day' | 'night') => {
    setTheme(newTheme);
    // Marcar que o usuário selecionou manualmente um tema
    localStorage.setItem('userSelectedTheme', 'true');
  };

  const handleAutoTheme = () => {
    setThemeBasedOnTime();
    // Remover a marcação de seleção manual
    localStorage.removeItem('userSelectedTheme');
  };

  return (
    <>
      {showSettings && <ThemeSettings onClose={() => setShowSettings(false)} />}
      
      <div className="flex flex-col items-center space-y-2 p-3 rounded-lg" style={{ backgroundColor: 'rgba(var(--card-bg), 0.7)' }}>
        <div className="text-sm font-medium mb-2">Tema</div>
        
        <div className="flex items-center space-x-3">
        <button
          onClick={() => handleThemeChange('dawn')}
          className={`p-2 rounded-full transition-all ${theme === 'dawn' ? 'ring-2 ring-offset-2 ring-blue-400 scale-110' : 'opacity-70'}`}
          title="Madrugada"
        >
          <span className="sr-only">Tema Madrugada</span>
          <div className="w-6 h-6 bg-[#0a1932] rounded-full border border-gray-600 flex items-center justify-center">
            <span className="text-xs text-blue-300">🌅</span>
          </div>
        </button>
        
        <button
          onClick={() => handleThemeChange('day')}
          className={`p-2 rounded-full transition-all ${theme === 'day' ? 'ring-2 ring-offset-2 ring-blue-400 scale-110' : 'opacity-70'}`}
          title="Dia"
        >
          <span className="sr-only">Tema Dia</span>
          <div className="w-6 h-6 bg-[#f0f0f5] rounded-full border border-gray-300 flex items-center justify-center">
            <span className="text-xs">☀️</span>
          </div>
        </button>
        
        <button
          onClick={() => handleThemeChange('night')}
          className={`p-2 rounded-full transition-all ${theme === 'night' ? 'ring-2 ring-offset-2 ring-purple-400 scale-110' : 'opacity-70'}`}
          title="Noite"
        >
          <span className="sr-only">Tema Noite</span>
          <div className="w-6 h-6 bg-[#1f1a3c] rounded-full border border-gray-600 flex items-center justify-center">
            <span className="text-xs">🌙</span>
          </div>
        </button>
      </div>
      
      <button
        onClick={handleAutoTheme}
        className="text-xs px-3 py-1 rounded-full bg-opacity-20 hover:bg-opacity-30 transition-all"
        style={{ backgroundColor: 'rgba(var(--accent-color), 0.2)' }}
        title="Alternar automaticamente com base na hora do dia"
      >
        Auto
      </button>
      
      <button
        onClick={toggleTheme}
        className="text-xs px-3 py-1 rounded-full bg-opacity-20 hover:bg-opacity-30 transition-all mt-1"
        style={{ backgroundColor: 'rgba(var(--accent-color), 0.2)' }}
        title="Alternar entre os temas"
      >
        Alternar
      </button>
      
      <button
        onClick={() => setShowSettings(true)}
        className="text-xs px-3 py-1 rounded-full bg-opacity-20 hover:bg-opacity-30 transition-all mt-1"
        style={{ backgroundColor: 'rgba(var(--accent-color), 0.2)' }}
        title="Configurações avançadas de tema"
      >
        Configurações
      </button>
    </div>
    </>
  );
};

export default ThemeSelector;
