"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageProcessor = void 0;
const excelParser_1 = require("./excelParser");
const remindersData_1 = __importDefault(require("./remindersData"));
const whatsappService_1 = require("./whatsappService");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class MessageProcessor {
    constructor(nombreClinica) {
        this.nombreClinica = nombreClinica;
        this.remindersData = new remindersData_1.default(nombreClinica);
        this.whatsAppService = new whatsappService_1.WhatsAppService();
    }
    /**
     * Procesa un archivo Excel y envía los mensajes
     */
    async processAndSend(excelPath, tipo, sendMessages = true) {
        try {
            console.log(`📊 Procesando archivo: ${excelPath}`);
            console.log(`📝 Tipo: ${tipo}`);
            // 1. Leer el Excel
            const data = await excelParser_1.ExcelParser.parseExcel(excelPath);
            if (!data || data.length === 0) {
                throw new Error('El Excel está vacío');
            }
            // 2. Procesar los datos con las plantillas
            const clientes = this.remindersData.procesarDatos(data, tipo);
            console.log(`✅ ${clientes.length} clientes procesados`);
            // 3. Enviar mensajes si está habilitado
            let enviados = [];
            let fallidos = [];
            if (sendMessages) {
                const resultado = await this.whatsAppService.sendMessagesToClients(clientes, parseInt(process.env.WAIT_BETWEEN_MESSAGES || '2000'), parseInt(process.env.MAX_RETRIES || '3'));
                enviados = resultado.success;
                fallidos = resultado.failed;
            }
            // 4. Guardar resultados
            this.saveResults(tipo, clientes, enviados, fallidos);
            return {
                totalClientes: clientes.length,
                clientesProcesados: clientes,
                enviados,
                fallidos
            };
        }
        catch (error) {
            console.error('Error procesando mensajes:', error);
            throw error;
        }
    }
    /**
     * Guarda los resultados del procesamiento
     */
    saveResults(tipo, clientes, enviados, fallidos) {
        try {
            const logsDir = path.join(process.cwd(), 'logs');
            if (!fs.existsSync(logsDir)) {
                fs.mkdirSync(logsDir, { recursive: true });
            }
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `${tipo}_${timestamp}.json`;
            const filepath = path.join(logsDir, filename);
            const results = {
                tipo,
                fecha: new Date().toISOString(),
                totalClientes: clientes.length,
                totalEnviados: enviados.length,
                totalFallidos: fallidos.length,
                clientes: clientes.map(c => ({
                    nombre: c.nombre,
                    telefono: c.telefono,
                    mensajes: c.mensajes.map(m => m.contenido),
                    enviado: enviados.includes(c)
                })),
                fallidos: fallidos.map(c => ({
                    nombre: c.nombre,
                    telefono: c.telefono
                }))
            };
            fs.writeFileSync(filepath, JSON.stringify(results, null, 2));
            console.log(`📁 Resultados guardados en: ${filepath}`);
        }
        catch (error) {
            console.error('Error guardando resultados:', error);
        }
    }
}
exports.MessageProcessor = MessageProcessor;
//# sourceMappingURL=messageProcessor.js.map