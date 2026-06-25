"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
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
    'test-ipc', // Para pruebas
    'get-config-direct' // Para pruebas
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
    'test-response', // Para pruebas
    'menu-import-excel',
    'menu-send-citas',
    'menu-send-vacunas',
    'menu-simulate-citas',
    'menu-simulate-vacunas',
    'menu-about',
    'console-log'
];
console.log('📡 Configurando bridge de comunicación...');
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    send: (channel, data) => {
        console.log(`📤 Enviando mensaje: ${channel}`, data);
        if (validSendChannels.includes(channel)) {
            electron_1.ipcRenderer.send(channel, data);
        }
        else {
            console.warn(`⚠️ Canal no válido para send: ${channel}`);
        }
    },
    on: (channel, func) => {
        console.log(`📥 Registrando listener para: ${channel}`);
        if (validReceiveChannels.includes(channel)) {
            const wrappedFunc = (event, ...args) => {
                console.log(`📨 Evento recibido: ${channel}`, args);
                func(...args);
            };
            electron_1.ipcRenderer.on(channel, wrappedFunc);
        }
        else {
            console.warn(`⚠️ Canal no válido para on: ${channel}`);
        }
    },
    removeListener: (channel, func) => {
        console.log(`🗑️ Removiendo listener: ${channel}`);
        electron_1.ipcRenderer.removeListener(channel, func);
    }
});
console.log('✅ Bridge configurado correctamente');
// Verificar en el contexto
console.log('📡 Canales disponibles para send:', validSendChannels);
console.log('📡 Canales disponibles para on:', validReceiveChannels);
//# sourceMappingURL=preload.js.map