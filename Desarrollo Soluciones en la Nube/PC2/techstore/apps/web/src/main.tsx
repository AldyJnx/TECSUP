import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import '@/shared/config/i18n';
import './styles/globals.css';
import { App } from './App';
import { ThemeProvider } from '@/app/providers/ThemeProvider';
import { queryClient } from '@/shared/api/queryClient';
// Inicializa el axios singleton (importa el módulo para registrar interceptores)
import '@/shared/api/axios';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
