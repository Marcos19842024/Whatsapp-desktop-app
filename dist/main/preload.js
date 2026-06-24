"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    send: (channel, data) => {
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
            electron_1.ipcRenderer.send(channel, data);
        }
    },
    on: (channel, func) => {
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
            electron_1.ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    },
    removeListener: (channel, func) => {
        electron_1.ipcRenderer.removeListener(channel, func);
    }
});
//# sourceMappingURL=preload.js.map