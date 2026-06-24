import { Cliente } from '../types/reminders';
export declare class MessageProcessor {
    private remindersData;
    private whatsAppService;
    private nombreClinica;
    constructor(nombreClinica: string);
    /**
     * Procesa un archivo Excel y envía los mensajes
     */
    processAndSend(excelPath: string, tipo: 'vacunas' | 'citas', sendMessages?: boolean): Promise<{
        totalClientes: number;
        clientesProcesados: Cliente[];
        enviados: Cliente[];
        fallidos: Cliente[];
    }>;
    /**
     * Guarda los resultados del procesamiento
     */
    private saveResults;
}
