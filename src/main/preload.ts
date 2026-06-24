import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  send: (channel: string, data?: any) => {
    const validChannels = [
      'import-excel',
      'send-citas',
      'send-vacunas',
      'simulate-citas',
      'simulate-vacunas',
      'get-config',
      'save-config',
      'get-logs',
      'clear-logs',
      'export-report'
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },

  on: (channel: string, func: (...args: any[]) => void) => {
    const validChannels = [
      'import-progress',
      'import-complete',
      'send-progress',
      'send-complete',
      'config-loaded',
      'log-update',
      'app-error',
      'menu-import-excel',
      'menu-send-citas',
      'menu-send-vacunas',
      'menu-about'
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },

  removeListener: (channel: string, func: (...args: any[]) => void) => {
    ipcRenderer.removeListener(channel, func);
  }
});

declare global {
  interface Window {
    electronAPI: {
      send: (channel: string, data?: any) => void;
      on: (channel: string, func: (...args: any[]) => void) => void;
      removeListener: (channel: string, func: (...args: any[]) => void) => void;
    };
  }
}