import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'dawn' | 'day' | 'night';

interface ThemePreferences {
  autoSwitch: boolean;
  lastManualTheme: Theme | null;
}

interface ThemeContextProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setThemeBasedOnTime: () => void;
  preferences: ThemePreferences;
  updatePreferences: (prefs: Partial<ThemePreferences>) => void;
  resetToDefaults: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('dawn');
  const [preferences, setPreferences] = useState<ThemePreferences>({
    autoSwitch: true,
    lastManualTheme: null
  });

  // Função para alternar entre os temas em sequência
  const toggleTheme = () => {
    setTheme(prevTheme => {
      if (prevTheme === 'dawn') return 'day';
      if (prevTheme === 'day') return 'night';
      return 'dawn';
    });
  };

  // Função para definir o tema com base na hora do dia
  const setThemeBasedOnTime = () => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      setTheme('dawn'); // Madrugada/Amanhecer: 5h às 11h
    } else if (hour >= 12 && hour < 18) {
      setTheme('day'); // Dia: 12h às 17h
    } else {
      setTheme('night'); // Noite: 18h às 4h
    }
    
    // Atualizar preferências para modo automático
    updatePreferences({ autoSwitch: true });
  };
  
  // Função para atualizar preferências
  const updatePreferences = (prefs: Partial<ThemePreferences>) => {
    setPreferences(prev => {
      const newPrefs = { ...prev, ...prefs };
      localStorage.setItem('themePreferences', JSON.stringify(newPrefs));
      return newPrefs;
    });
  };
  
  // Função para resetar para configurações padrão
  const resetToDefaults = () => {
    const defaultPrefs: ThemePreferences = {
      autoSwitch: true,
      lastManualTheme: null
    };
    setPreferences(defaultPrefs);
    localStorage.setItem('themePreferences', JSON.stringify(defaultPrefs));
    setThemeBasedOnTime();
  };

  // Efeito para aplicar o tema ao elemento root do HTML
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Se não estiver em modo automático, salvar como último tema manual
    if (!preferences.autoSwitch) {
      updatePreferences({ lastManualTheme: theme });
    }
  }, [theme, preferences.autoSwitch]);

  // Efeito para carregar o tema salvo e preferências
  useEffect(() => {
    // Carregar preferências salvas
    const savedPrefs = localStorage.getItem('themePreferences');
    if (savedPrefs) {
      try {
        const parsedPrefs = JSON.parse(savedPrefs) as ThemePreferences;
        setPreferences(parsedPrefs);
      } catch (e) {
        console.error('Erro ao carregar preferências de tema:', e);
      }
    }
    
    // Carregar tema salvo
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const userSelectedTheme = localStorage.getItem('userSelectedTheme');
    
    if (savedTheme && ['dawn', 'day', 'night'].includes(savedTheme)) {
      setTheme(savedTheme);
    } else {
      setThemeBasedOnTime();
    }
    
    // Configurar um intervalo para verificar e atualizar o tema a cada hora
    const intervalId = setInterval(() => {
      const currentPrefs = JSON.parse(localStorage.getItem('themePreferences') || '{}');
      if (currentPrefs.autoSwitch) {
        setThemeBasedOnTime();
      }
    }, 60 * 60 * 1000); // 1 hora
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      toggleTheme,
      setThemeBasedOnTime,
      preferences,
      updatePreferences,
      resetToDefaults
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};
