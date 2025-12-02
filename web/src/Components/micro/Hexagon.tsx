import { FC } from 'react';

interface HexagonProps {
  active?: boolean;
  variant?: 'default' | 'success' | 'error';
  strokeWidth?: string;
  themeColor?: string;
}

export const Hexagon: FC<HexagonProps> = ({ 
  active = false, 
  variant = 'default',
  strokeWidth = '0.5vh',
  themeColor = '#3b82f6'
}) => {
  const getStrokeColor = () => {
    if (active) {
      switch (variant) {
        case 'success':
          return '#10b981'; // green-500
        case 'error':
          return '#ef4444'; // red-500
        default:
          return themeColor;
      }
    }
    return 'rgba(255, 255, 255, 0.3)';
  };

  const getFillColor = () => {
    if (active) {
      switch (variant) {
        case 'success':
          return 'rgba(16, 185, 129, 0.2)';
        case 'error':
          return 'rgba(239, 68, 68, 0.2)';
        default:
          // Convert hex to rgba with 0.2 opacity
          const hex = themeColor.replace('#', '');
          const r = parseInt(hex.substring(0, 2), 16);
          const g = parseInt(hex.substring(2, 4), 16);
          const b = parseInt(hex.substring(4, 6), 16);
          return `rgba(${r}, ${g}, ${b}, 0.2)`;
      }
    }
    return 'rgba(0, 0, 0, 0.6)';
  };

  return (
    <svg
      viewBox="0 0 100 100"
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
      }}
    >
      <polygon
        points="25,5 75,5 95,50 75,95 25,95 5,50"
        fill={getFillColor()}
        stroke={getStrokeColor()}
        strokeWidth={strokeWidth}
        style={{
          transition: 'all 0.15s ease-in-out',
        }}
      />
    </svg>
    
  );
};
