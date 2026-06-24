import axios from 'axios';
import { Cliente } from '../types/reminders';

export class WhatsAppService {
    private apiUrl: string;
    private phoneNumberId: string;
    private accessToken: string;

    constructor() {
        this.apiUrl = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0';
        this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
        this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';

        if (!this.phoneNumberId || !this.accessToken) {
            throw new Error('WhatsApp configuration is missing');
        }
    }

    /**
     * Envía un mensaje de texto a través de la API de WhatsApp
     */
    async sendTextMessage(phoneNumber: string, message: string): Promise<any> {
        try {
            // Limpiar el número de teléfono
            const cleanedNumber = this.cleanPhoneNumber(phoneNumber);

            const url = `${this.apiUrl}/${this.phoneNumberId}/messages`;
            
            const payload = {
                messaging_product: 'whatsapp',
                to: cleanedNumber,
                type: 'text',
                text: {
                    preview_url: false,
                    body: message
                }
            };

            const response = await axios.post(url, payload, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log(`✅ Mensaje enviado a ${cleanedNumber}: ${message.substring(0, 50)}...`);
            return response.data;

        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error al enviar mensaje WhatsApp:', {
                    status: error.response?.status,
                    data: error.response?.data,
                    message: error.message
                });
                throw new Error(`WhatsApp API error: ${error.response?.data?.error?.message || error.message}`);
            }
            throw error;
        }
    }

    /**
     * Envía un mensaje plantilla (template) de WhatsApp
     */
    async sendTemplateMessage(phoneNumber: string, templateName: string, components?: any[]): Promise<any> {
        try {
            const cleanedNumber = this.cleanPhoneNumber(phoneNumber);

            const url = `${this.apiUrl}/${this.phoneNumberId}/messages`;
            
            const payload: any = {
                messaging_product: 'whatsapp',
                to: cleanedNumber,
                type: 'template',
                template: {
                    name: templateName,
                    language: {
                        code: 'es'
                    }
                }
            };

            if (components && components.length > 0) {
                payload.template.components = components;
            }

            const response = await axios.post(url, payload, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log(`✅ Template enviado a ${cleanedNumber}: ${templateName}`);
            return response.data;

        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error al enviar template WhatsApp:', {
                    status: error.response?.status,
                    data: error.response?.data,
                    message: error.message
                });
                throw new Error(`WhatsApp API error: ${error.response?.data?.error?.message || error.message}`);
            }
            throw error;
        }
    }

    /**
     * Envía mensajes a múltiples clientes con un delay entre ellos
     */
    async sendMessagesToClients(
        clients: Cliente[], 
        delayBetween: number = 2000,
        maxRetries: number = 3
    ): Promise<{ success: Cliente[]; failed: Cliente[] }> {
        const success: Cliente[] = [];
        const failed: Cliente[] = [];

        for (const cliente of clients) {
            try {
                if (cliente.mensajes.length === 0) {
                    console.log(`⏭️ Cliente ${cliente.nombre} sin mensajes para enviar`);
                    continue;
                }

                // Obtener el último mensaje (el más completo) o concatenar todos
                let mensajeCompleto = '';
                for (const msg of cliente.mensajes) {
                    if (msg.esPropio) {
                        mensajeCompleto += msg.contenido + '\n';
                    }
                }

                if (!mensajeCompleto) {
                    console.log(`⏭️ Cliente ${cliente.nombre} no tiene mensajes propios`);
                    continue;
                }

                // Intentar enviar con reintentos
                let intentos = 0;
                let enviado = false;

                while (intentos < maxRetries && !enviado) {
                    try {
                        await this.sendTextMessage(cliente.telefono, mensajeCompleto);
                        enviado = true;
                        success.push(cliente);
                        console.log(`✅ Mensaje enviado a ${cliente.nombre} (${cliente.telefono})`);
                    } catch (error) {
                        intentos++;
                        console.log(`⚠️ Intento ${intentos} falló para ${cliente.nombre}`);
                        if (intentos < maxRetries) {
                            await this.delay(1000 * intentos); // Espera exponencial
                        }
                    }
                }

                if (!enviado) {
                    failed.push(cliente);
                    console.log(`❌ No se pudo enviar mensaje a ${cliente.nombre} después de ${maxRetries} intentos`);
                }

                // Esperar entre mensajes
                if (clients.indexOf(cliente) < clients.length - 1) {
                    await this.delay(delayBetween);
                }

            } catch (error) {
                console.error(`Error procesando cliente ${cliente.nombre}:`, error);
                failed.push(cliente);
            }
        }

        return { success, failed };
    }

    /**
     * Limpia el número de teléfono
     */
    private cleanPhoneNumber(phone: string): string {
        if (!phone) return '';
        
        // Remover todos los caracteres no numéricos
        let cleaned = phone.replace(/[^0-9]/g, '');
        
        // Si el número tiene 10 dígitos, agregar código de país (52 para México)
        if (cleaned.length === 10) {
            cleaned = `52${cleaned}`;
        }
        
        return cleaned;
    }

    /**
     * Delay para esperar entre mensajes
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}