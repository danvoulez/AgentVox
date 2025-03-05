import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import useTimeAwareTheme from '@/hooks/useTimeAwareTheme';

interface ThemeInfoProps {
  showDetails?: boolean;
}

const ThemeInfo: React.FC<ThemeInfoProps> = ({ showDetails = false }) => {
  const { theme } = useTheme();
  const { timeOfDay, formattedTime, isAutoSwitchEnabled } = useTimeAwareTheme();
  
  const getThemeEmoji = () => {
    switch (theme) {
      case 'dawn': return '🌅';
      case 'day': return '☀️';
      case 'night': return '🌙';
      default: return '🎨';
    }
  };
  
  const getThemeName = () => {
    switch (theme) {
      case 'dawn': return 'Madrugada';
      case 'day': return 'Dia';
      case 'night': return 'Noite';
      default: return 'Desconhecido';
    }
  };
  
  if (!showDetails) {
    return (
      <div className="inline-flex items-center space-x-1 text-xs opacity-70">
        <span>{getThemeEmoji()}</span>
        <span>{getThemeName()}</span>
      </div>
    );
  }
  
  return (
    <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(var(--card-bg), 0.7)' }}>
      <div className="flex items-center mb-2">
        <span className="text-xl mr-2">{getThemeEmoji()}</span>
        <div>
          <div className="font-medium">{getThemeName()}</div>
          <div className="text-xs opacity-70">
            {isAutoSwitchEnabled ? 'Modo automático ativado' : 'Modo manual'}
          </div>
        </div>
      </div>
      
      {showDetails && (
        <div className="text-xs space-y-1 mt-2 opacity-80">
          <div className="flex justify-between">
            <span>Horário atual:</span>
            <span>{formattedTime}</span>
          </div>
          <div className="flex justify-between">
            <span>Período detectado:</span>
            <span>{timeOfDay === 'dawn' ? 'Madrugada' : timeOfDay === 'day' ? 'Dia' : 'Noite'}</span>
          </div>
          <div className="flex justify-between">
            <span>Tema atual:</span>
            <span>{getThemeName()}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeInfo;
