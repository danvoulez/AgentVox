import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

type TimeOfDay = 'dawn' | 'day' | 'night';

interface UseTimeAwareThemeReturn {
  currentTime: Date;
  timeOfDay: TimeOfDay;
  formattedTime: string;
  isAutoSwitchEnabled: boolean;
  toggleAutoSwitch: () => void;
}

/**
 * Hook personalizado que fornece informações sobre o tempo atual e o tema correspondente
 */
export const useTimeAwareTheme = (): UseTimeAwareThemeReturn => {
  const { preferences, updatePreferences } = useTheme();
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  // Atualizar o tempo atual a cada minuto
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 60 * 1000); // 1 minuto
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Determinar o período do dia com base na hora atual
  const getTimeOfDay = (date: Date): TimeOfDay => {
    const hour = date.getHours();
    
    if (hour >= 5 && hour < 12) {
      return 'dawn'; // Madrugada/Amanhecer: 5h às 11h
    } else if (hour >= 12 && hour < 18) {
      return 'day'; // Dia: 12h às 17h
    } else {
      return 'night'; // Noite: 18h às 4h
    }
  };
  
  // Formatar a hora atual
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Alternar o modo automático
  const toggleAutoSwitch = () => {
    updatePreferences({ autoSwitch: !preferences.autoSwitch });
  };
  
  return {
    currentTime,
    timeOfDay: getTimeOfDay(currentTime),
    formattedTime: formatTime(currentTime),
    isAutoSwitchEnabled: preferences.autoSwitch,
    toggleAutoSwitch
  };
};

export default useTimeAwareTheme;
