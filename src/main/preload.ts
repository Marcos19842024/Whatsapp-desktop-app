import { contextBridge, ipcRenderer } from 'electron';

console.log('🔌 ===== PRELOAD SCRIPT EJECUTÁNDOSE =====');

// Lista de canales permitidos para enviar
const validSendChannels = [
  'import-excel',
  'import-excel-data',
  'import-excel-direct',
  'send-citas',
  'send-vacunas',
  'simulate-citas',
  'simulate-vacunas',
  'get-config',
  'save-config',
  'get-logs',
  'clear-logs',
  'export-report',
  'test-ipc',           // Para pruebas
  'get-config-direct'   // Para pruebas
];

// Lista de canales permitidos para recibir
const validReceiveChannels = [
  'import-progress',
  'import-complete',
  'send-progress',
  'send-complete',
  'config-loaded',
  'log-update',
  'app-error',
  'test-response',      // Para pruebas
  'menu-import-excel',
  'menu-send-citas',
  'menu-send-vacunas',
  'menu-simulate-citas',
  'menu-simulate-vacunas',
  'menu-about',
  'console-log'
];

console.log('📡 Configurando bridge de comunicación...');

contextBridge.exposeInMainWorld('electronAPI', {
  send: (channel: string, data?: any) => {
    console.log(`📤 Enviando mensaje: ${channel}`, data);
    
    if (validSendChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    } else {
      console.warn(`⚠️ Canal no válido para send: ${channel}`);
    }
  },

  on: (channel: string, func: (...args: any[]) => void) => {
    console.log(`📥 Registrando listener para: ${channel}`);
    
    if (validReceiveChannels.includes(channel)) {
      const wrappedFunc = (event: any, ...args: any[]) => {
        console.log(`📨 Evento recibido: ${channel}`, args);
        func(...args);
      };
      ipcRenderer.on(channel, wrappedFunc);
      
    } else {
      console.warn(`⚠️ Canal no válido para on: ${channel}`);
    }
  },

  removeListener: (channel: string, func: (...args: any[]) => void) => {
    console.log(`🗑️ Removiendo listener: ${channel}`);
    ipcRenderer.removeListener(channel, func);
  }
});

console.log('✅ Bridge configurado correctamente');

// Verificar en el contexto
console.log('📡 Canales disponibles para send:', validSendChannels);
console.log('📡 Canales disponibles para on:', validReceiveChannels);

declare global {
  interface Window {
    electronAPI: {
      send: (channel: string, data?: any) => void;
      on: (channel: string, func: (...args: any[]) => void) => void;
      removeListener: (channel: string, func: (...args: any[]) => void) => void;
    };
  }
}

declare global {
  interface Window {
    electronAPI: {
      send: (channel: string, data?: any) => void;
      on: (channel: string, func: (...args: any[]) => void) => void;
      removeListener: (channel: string, func: (...args: any[]) => void) => void;
    };
  }
}