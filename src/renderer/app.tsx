import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer, toast } from 'react-toastify';
// @ts-ignore: no type declarations for CSS import
import 'react-toastify/dist/ReactToastify.css';
import './styles.css';

import Dashboard from '../components/Dashboard';

// Tema personalizado
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#25D366', // WhatsApp green
      dark: '#128C7E',
      light: '#DCF8C6',
    },
    secondary: {
      main: '#075E54',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        },
      },
    },
  },
});

const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Configurar listeners de electron
    if (window.electronAPI) {
      window.electronAPI.on('app-error', (message: string) => {
        toast.error(message);
      });

      setIsReady(true);
    }
  }, []);

  if (!isReady) {
    return <div>Cargando aplicación...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Dashboard />
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </ThemeProvider>
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);