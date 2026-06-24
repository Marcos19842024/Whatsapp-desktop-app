import { Cliente } from '../types/reminders';
export declare class WhatsAppService {
    private apiUrl;
    private phoneNumberId;
    private accessToken;
    constructor();
    /**
     * Envía un mensaje de texto a través de la API de WhatsApp
     */
    sendTextMessage(phoneNumber: string, message: string): Promise<any>;
    /**
     * Envía un mensaje plantilla (template) de WhatsApp
     */
    sendTemplateMessage(phoneNumber: string, templateName: string, components?: any[]): Promise<any>;
    /**
     * Envía mensajes a múltiples clientes con un delay entre ellos
     */
    sendMessagesToClients(clients: Cliente[], delayBetween?: number, maxRetries?: number): Promise<{
        success: Cliente[];
        failed: Cliente[];
    }>;
    /**
     * Limpia el número de teléfono
     */
    private cleanPhoneNumber;
    /**
     * Delay para esperar entre mensajes
     */
    private delay;
}
