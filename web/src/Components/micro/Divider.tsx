import { FC } from 'react';
import { Box } from '@mantine/core';

export const Divider: FC = () => {
  return (
    <Box
      style={{
        width: '100%',
        height: '2px',
        backgroundColor: 'var(--mantine-color-blue-6)',
        margin: '1vh 0',
      }}
    />
  );
};
