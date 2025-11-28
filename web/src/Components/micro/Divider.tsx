import { FC } from 'react';
import { Box } from '@mantine/core';

export const Divider: FC = () => {
  return (
    <Box
      style={{
        width: '100%',
        height: '2px',
        backgroundColor: '#686868ff',
        margin: '1vh 0',
      }}
    />
  );
};
