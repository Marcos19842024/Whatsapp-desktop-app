import { ExcelParser } from './excelParser';
import RemindersData from './remindersData';
import { WhatsAppService } from './whatsappService';
import { Cliente } from '../types/reminders';
import * as fs from 'fs';
import * as path from 'path';

export class MessageProcessor {
    private remindersData: RemindersData;
    private whatsAppService: WhatsAppService;
    private nombreClinica: string;

    constructor(nombreClinica: string) {
        this.nombreClinica = nombreClinica;
        this.remindersData = new RemindersData(nombreClinica);
        this.whatsAppService = new WhatsAppService();
    }

    /**
     * Procesa un archivo Excel y envía los mensajes
     */
    async processAndSend(
        excelPath: string,
        tipo: 'vacunas' | 'citas',
        sendMessages: boolean = true
    ): Promise<{
        totalClientes: number;
        clientesProcesados: Cliente[];
        enviados: Cliente[];
        fallidos: Cliente[];
    }> {
        try {
            console.log(`📊 Procesando archivo: ${excelPath}`);
            console.log(`📝 Tipo: ${tipo}`);

            // 1. Leer el Excel
            const data = await ExcelParser.parseExcel(excelPath);
            
            if (!data || data.length === 0) {
                throw new Error('El Excel está vacío');
            }

            // 2. Procesar los datos con las plantillas
            const clientes = this.remindersData.procesarDatos(data, tipo);
            
            console.log(`✅ ${clientes.length} clientes procesados`);

            // 3. Enviar mensajes si está habilitado
            let enviados: Cliente[] = [];
            let fallidos: Cliente[] = [];

            if (sendMessages) {
                const resultado = await this.whatsAppService.sendMessagesToClients(
                    clientes,
                    parseInt(process.env.WAIT_BETWEEN_MESSAGES || '2000'),
                    parseInt(process.env.MAX_RETRIES || '3')
                );
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

        } catch (error) {
            console.error('Error procesando mensajes:', error);
            throw error;
        }
    }

    /**
     * Guarda los resultados del procesamiento
     */
    private saveResults(
        tipo: string,
        clientes: Cliente[],
        enviados: Cliente[],
        fallidos: Cliente[]
    ): void {
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

        } catch (error) {
            console.error('Error guardando resultados:', error);
        }
    }
}