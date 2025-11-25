import {createRoot} from 'react-dom/client';
import {StrictMode} from 'react';
import {MantineProvider} from '@mantine/core';
import {VisibilityProvider} from './Providers/VisibilityProvider';
import {ConfigProvider} from './Providers/ConfigProvider';
import {AppearanceStoreProvider} from './Providers/AppearanceStoreProvider';
import {App} from './Components/App';
import {DebugProvider} from './Providers/debug';
import {IsRunningInBrowser} from './Utils/Misc';
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={{colorScheme:'dark'}}>
      <ConfigProvider>
        <AppearanceStoreProvider>
          {IsRunningInBrowser() ? (
            <DebugProvider />
          ) : (
            <VisibilityProvider component='App'>
              <App/>
            </VisibilityProvider>
          )}
        </AppearanceStoreProvider>
      </ConfigProvider>
    </MantineProvider>
  </StrictMode>
);