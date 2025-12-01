import { FC } from 'react';
import { Box } from '@mantine/core';

export const Divider: FC = () => {
  return (
    <Box
      style={{
        width: '100%',
        height: '4px',
        backgroundColor: '#fff',
        margin: '1vh 0',
        border: '1px solid #fff',
        borderRadius: '2px',
        zIndex: 10,
        position: 'relative',
      }}
    />
  );
};
