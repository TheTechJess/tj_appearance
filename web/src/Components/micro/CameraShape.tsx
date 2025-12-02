import { FC } from 'react';

interface CameraShapeProps {
  type: 'hexagon' | 'circle' | 'square' | 'diamond' | 'pentagon';
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

export const CameraShape: FC<CameraShapeProps> = ({ 
  type, 
  fill = 'rgba(0,0,0,0.6)', 
  stroke = 'rgba(255,255,255,0.3)', 
  strokeWidth = 4 
}) => {
  return (
    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
      {type === 'hexagon' && (
        <polygon 
          points="25,4 75,4 96,50 75,96 25,96 4,50" 
          fill={fill} 
          stroke={stroke} 
          strokeWidth={strokeWidth} 
        />
      )}
      {type === 'circle' && (
        <circle 
          cx="50" 
          cy="50" 
          r="46" 
          fill={fill} 
          stroke={stroke} 
          strokeWidth={strokeWidth} 
        />
      )}
      {type === 'square' && (
        <rect 
          x="10" 
          y="10" 
          width="80" 
          height="80" 
          rx="8" 
          fill={fill} 
          stroke={stroke} 
          strokeWidth={strokeWidth} 
        />
      )}
      {type === 'diamond' && (
        <polygon 
          points="50,4 96,50 50,96 4,50" 
          fill={fill} 
          stroke={stroke} 
          strokeWidth={strokeWidth} 
        />
      )}
      {type === 'pentagon' && (
        <polygon 
          points="50,4 95,38 77,90 23,90 5,38" 
          fill={fill} 
          stroke={stroke} 
          strokeWidth={strokeWidth} 
        />
      )}
    </svg>
  );
};
