import React, { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import useTimeAwareTheme from '@/hooks/useTimeAwareTheme';

interface ThemeClockProps {
  size?: 'sm' | 'md' | 'lg';
  showThemeInfo?: boolean;
}

const ThemeClock: React.FC<ThemeClockProps> = ({ 
  size = 'md',
  showThemeInfo = true
}) => {
  const { theme } = useTheme();
  const { currentTime, timeOfDay, formattedTime } = useTimeAwareTheme();
  const [date, setDate] = useState<string>('');
  
  // Configurar tamanhos com base no prop size
  const clockSize = size === 'sm' ? 'w-16 h-16' : size === 'lg' ? 'w-32 h-32' : 'w-24 h-24';
  const fontSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-xl' : 'text-base';
  
  useEffect(() => {
    // Formatar a data atual
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      day: '2-digit', 
      month: 'short' 
    };
    setDate(currentTime.toLocaleDateString('pt-BR', options));
  }, [currentTime]);
  
  // Obter cores baseadas no tema atual
  const getClockColors = () => {
    switch (theme) {
      case 'dawn':
        return {
          face: 'bg-gradient-to-br from-blue-900 to-indigo-800',
          border: 'border-blue-700',
          hands: 'bg-blue-300',
          text: 'text-blue-200'
        };
      case 'day':
        return {
          face: 'bg-gradient-to-br from-blue-50 to-blue-100',
          border: 'border-blue-200',
          hands: 'bg-blue-600',
          text: 'text-blue-800'
        };
      case 'night':
        return {
          face: 'bg-gradient-to-br from-purple-900 to-indigo-900',
          border: 'border-purple-700',
          hands: 'bg-purple-300',
          text: 'text-purple-200'
        };
      default:
        return {
          face: 'bg-gradient-to-br from-gray-800 to-gray-900',
          border: 'border-gray-700',
          hands: 'bg-gray-300',
          text: 'text-gray-200'
        };
    }
  };
  
  const colors = getClockColors();
  
  // Calcular a rotação dos ponteiros
  const hours = currentTime.getHours() % 12;
  const minutes = currentTime.getMinutes();
  const seconds = currentTime.getSeconds();
  
  const hourRotation = (hours * 30) + (minutes * 0.5); // 30 graus por hora + ajuste para minutos
  const minuteRotation = minutes * 6; // 6 graus por minuto
  const secondRotation = seconds * 6; // 6 graus por segundo
  
  return (
    <div className="flex flex-col items-center">
      <div className={`${clockSize} rounded-full ${colors.face} ${colors.border} border-2 relative flex items-center justify-center shadow-lg`}>
        {/* Marcadores de hora */}
        {[...Array(12)].map((_, i) => (
          <div 
            key={i} 
            className="absolute w-1 h-2 bg-opacity-70"
            style={{ 
              backgroundColor: `rgba(var(--highlight-color), 0.7)`,
              transform: `rotate(${i * 30}deg) translateY(-${size === 'sm' ? '6' : size === 'lg' ? '14' : '10'}px)` 
            }}
          />
        ))}
        
        {/* Ponteiro das horas */}
        <div 
          className={`absolute ${colors.hands} rounded-full`}
          style={{ 
            height: size === 'sm' ? '4px' : size === 'lg' ? '8px' : '6px',
            width: size === 'sm' ? '25%' : size === 'lg' ? '25%' : '25%',
            transformOrigin: '50% 50%',
            transform: `rotate(${hourRotation}deg)`,
            zIndex: 10
          }}
        />
        
        {/* Ponteiro dos minutos */}
        <div 
          className={`absolute ${colors.hands} rounded-full`}
          style={{ 
            height: size === 'sm' ? '3px' : size === 'lg' ? '6px' : '4px',
            width: size === 'sm' ? '35%' : size === 'lg' ? '35%' : '35%',
            transformOrigin: '50% 50%',
            transform: `rotate(${minuteRotation}deg)`,
            zIndex: 20
          }}
        />
        
        {/* Ponteiro dos segundos */}
        <div 
          className="absolute bg-red-500 rounded-full"
          style={{ 
            height: size === 'sm' ? '1px' : size === 'lg' ? '2px' : '1px',
            width: size === 'sm' ? '40%' : size === 'lg' ? '40%' : '40%',
            transformOrigin: '50% 50%',
            transform: `rotate(${secondRotation}deg)`,
            zIndex: 30
          }}
        />
        
        {/* Centro do relógio */}
        <div 
          className="absolute rounded-full z-40 border"
          style={{ 
            height: size === 'sm' ? '4px' : size === 'lg' ? '8px' : '6px',
            width: size === 'sm' ? '4px' : size === 'lg' ? '8px' : '6px',
            backgroundColor: `rgba(var(--highlight-color), 1)`,
            borderColor: `rgba(var(--border-color), 0.5)`
          }}
        />
      </div>
      
      {showThemeInfo && (
        <div className={`mt-2 ${fontSize} ${colors.text} text-center`}>
          <div>{formattedTime}</div>
          <div className="text-xs opacity-70">{date}</div>
          {size !== 'sm' && (
            <div className="mt-1 text-xs flex items-center justify-center space-x-1">
              {timeOfDay === 'dawn' && <span>🌅 Madrugada</span>}
              {timeOfDay === 'day' && <span>☀️ Dia</span>}
              {timeOfDay === 'night' && <span>🌙 Noite</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ThemeClock;
