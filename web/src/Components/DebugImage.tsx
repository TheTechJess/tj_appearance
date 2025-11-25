import { FC } from 'react';
import debugBg from '../assets/debugbg.png';

export const DebugImage: FC = () => {
  return (
    <img 
      src={debugBg} 
      alt="Debug background" 
      style={{ 
        width: '100%', 
        height: '100%', 
        objectFit: 'cover' 
      }} 
    />
  );
};
