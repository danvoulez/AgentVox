import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeSettingsProps {
  onClose: () => void;
}

const ThemeSettings: React.FC<ThemeSettingsProps> = ({ onClose }) => {
  const { theme, setTheme, preferences, updatePreferences, resetToDefaults } = useTheme();
  const [autoSwitch, setAutoSwitch] = useState<boolean>(preferences.autoSwitch);
  
  // Sincronizar estado local com as preferências do contexto
  useEffect(() => {
    setAutoSwitch(preferences.autoSwitch);
  }, [preferences.autoSwitch]);

  const handleAutoSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isAuto = e.target.checked;
    setAutoSwitch(isAuto);
    updatePreferences({ autoSwitch: isAuto });
    
    // Manter compatibilidade com o código existente
    if (isAuto) {
      localStorage.removeItem('userSelectedTheme');
    } else {
      localStorage.setItem('userSelectedTheme', 'true');
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div 
        className="rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'rgba(var(--card-bg), 0.95)' }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Configurações de Tema</h2>
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
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Escolha de Tema</h3>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => {
                  setTheme('dawn');
                  setAutoSwitch(false);
                  updatePreferences({ autoSwitch: false, lastManualTheme: 'dawn' });
                  localStorage.setItem('userSelectedTheme', 'true');
                }}
                className={`p-4 rounded-lg border transition-all ${
                  theme === 'dawn' ? 'ring-2 ring-blue-400' : 'opacity-70'
                }`}
                style={{ 
                  backgroundColor: '#0a1932',
                  borderColor: 'rgba(70, 85, 120, 0.6)'
                }}
              >
                <div className="flex flex-col items-center">
                  <span className="text-xl mb-2">🌅</span>
                  <span className="text-blue-300 text-sm">Madrugada</span>
                </div>
              </button>
              
              <button
                onClick={() => {
                  setTheme('day');
                  setAutoSwitch(false);
                  updatePreferences({ autoSwitch: false, lastManualTheme: 'day' });
                  localStorage.setItem('userSelectedTheme', 'true');
                }}
                className={`p-4 rounded-lg border transition-all ${
                  theme === 'day' ? 'ring-2 ring-blue-400' : 'opacity-70'
                }`}
                style={{ 
                  backgroundColor: '#f0f0f5',
                  borderColor: 'rgba(200, 200, 220, 0.6)'
                }}
              >
                <div className="flex flex-col items-center">
                  <span className="text-xl mb-2">☀️</span>
                  <span className="text-gray-800 text-sm">Dia</span>
                </div>
              </button>
              
              <button
                onClick={() => {
                  setTheme('night');
                  setAutoSwitch(false);
                  updatePreferences({ autoSwitch: false, lastManualTheme: 'night' });
                  localStorage.setItem('userSelectedTheme', 'true');
                }}
                className={`p-4 rounded-lg border transition-all ${
                  theme === 'night' ? 'ring-2 ring-purple-400' : 'opacity-70'
                }`}
                style={{ 
                  backgroundColor: '#1f1a3c',
                  borderColor: 'rgba(90, 70, 120, 0.6)'
                }}
              >
                <div className="flex flex-col items-center">
                  <span className="text-xl mb-2">🌙</span>
                  <span className="text-purple-300 text-sm">Noite</span>
                </div>
              </button>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-4">
            <div className="flex items-center justify-between">
              <label htmlFor="auto-switch" className="text-sm font-medium">
                Alternar tema automaticamente com base na hora do dia
              </label>
              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full">
                <input
                  id="auto-switch"
                  type="checkbox"
                  className="absolute w-6 h-6 transition duration-200 ease-in-out transform bg-white rounded-full appearance-none cursor-pointer peer border border-gray-300 checked:right-0 checked:border-blue-500 checked:bg-blue-500 left-0 top-0"
                  checked={autoSwitch}
                  onChange={handleAutoSwitchChange}
                />
                <label
                  htmlFor="auto-switch"
                  className="block w-full h-full overflow-hidden rounded-full cursor-pointer bg-gray-300 peer-checked:bg-blue-300 opacity-50"
                ></label>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Madrugada: 5h às 11h | Dia: 12h às 17h | Noite: 18h às 4h
            </p>
          </div>
          
          <div className="border-t border-gray-700 pt-4">
            <h3 className="text-lg font-medium mb-3">Dicas</h3>
            <ul className="text-sm space-y-2 text-gray-300">
              <li>• Você pode alternar entre os temas a qualquer momento</li>
              <li>• O tema automático se ajusta com base na hora do seu dispositivo</li>
              <li>• Suas preferências são salvas para futuras visitas</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 flex justify-between">
          <button
            onClick={() => {
              resetToDefaults();
              setAutoSwitch(true);
            }}
            className="px-4 py-2 rounded-md text-sm font-medium"
            style={{ backgroundColor: 'rgba(var(--accent-color), 0.1)' }}
          >
            Restaurar Padrões
          </button>
          
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium"
            style={{ backgroundColor: 'rgba(var(--accent-color), 0.2)' }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;
