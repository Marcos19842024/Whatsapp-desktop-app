import { ipcMain, dialog, BrowserWindow } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { MessageProcessor } from '../services/messageProcessor';
import { ExcelParser } from '../services/excelParser';
import RemindersData from '../services/remindersData';

let isProcessing = false;

export function setupIPCHandlers() {
  
  // ============================================
  // 1. IMPORTAR EXCEL
  // ============================================
  ipcMain.on('import-excel', async (event) => {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return;

    const result = await dialog.showOpenDialog(win, {
      properties: ['openFile'],
      filters: [
        { name: 'Excel Files', extensions: ['xlsx', 'xls'] }
      ]
    });

    if (!result.canceled && result.filePaths.length > 0) {
      const filePath = result.filePaths[0];
      const fileName = path.basename(filePath);
      
      try {
        // Leer el Excel
        const data = await ExcelParser.parseExcel(filePath);
        
        // Determinar el tipo basado en los encabezados
        const headers = data[0];
        let tipo: 'vacunas' | 'citas' = 'citas';
        
        if (headers && headers.some((h: any) => h && h.toString().toUpperCase().includes('VACUNA'))) {
          tipo = 'vacunas';
        }
        
        // Procesar usando RemindersData
        const nombreClinica = process.env.NOMBRE_CLINICA || 'Clínica Veterinaria';
        const remindersData = new RemindersData(nombreClinica);
        const clientes = remindersData.procesarDatos(data, tipo);
        
        // Enviar resultado al frontend
        win.webContents.send('import-complete', {
          fileName,
          tipo,
          total: clientes.length,
          clientes: clientes.map((c: any) => ({
            nombre: c.nombre,
            telefono: c.telefono,
            mascotas: c.mascotas || [],
            mensajes: c.mensajes || []
          }))
        });
        
      } catch (error: any) {
        win.webContents.send('app-error', `Error importando Excel: ${error.message}`);
        console.error('Error importando Excel:', error);
      }
    }
  });

  // ============================================
  // 2. ENVIAR RECORDATORIOS DE CITAS (REAL)
  // ============================================
  ipcMain.on('send-citas', async (event, data) => {
    if (isProcessing) {
      event.reply('app-error', 'Ya hay un proceso en curso');
      return;
    }

    const win = BrowserWindow.getFocusedWindow();
    if (!win) return;

    isProcessing = true;
    
    try {
      const nombreClinica = process.env.NOMBRE_CLINICA || 'Clínica Veterinaria';
      const processor = new MessageProcessor(nombreClinica);
      
      const excelPath = data?.excelPath || process.env.EXCEL_AGENDAS_PATH;
      
      if (!excelPath || !fs.existsSync(excelPath)) {
        throw new Error(`No se encontró el archivo de citas: ${excelPath}`);
      }

      win.webContents.send('send-progress', {
        status: 'iniciando',
        message: '📤 Enviando recordatorios de citas...',
        progress: 0
      });

      // ENVÍO REAL: último parámetro = true
      const result = await processor.processAndSend(
        excelPath,
        'citas',
        true  // <--- true = enviar realmente
      );

      win.webContents.send('send-complete', {
        tipo: 'citas',
        total: result.totalClientes,
        enviados: result.enviados.length,
        fallidos: result.fallidos.length,
        detalles: {
          enviados: result.enviados.map((c: any) => c.nombre),
          fallidos: result.fallidos.map((c: any) => c.nombre)
        }
      });

    } catch (error: any) {
      win.webContents.send('app-error', `Error enviando citas: ${error.message}`);
      console.error('Error enviando citas:', error);
    } finally {
      isProcessing = false;
    }
  });

  // ============================================
  // 3. ENVIAR RECORDATORIOS DE VACUNAS (REAL)
  // ============================================
  ipcMain.on('send-vacunas', async (event, data) => {
    if (isProcessing) {
      event.reply('app-error', 'Ya hay un proceso en curso');
      return;
    }

    const win = BrowserWindow.getFocusedWindow();
    if (!win) return;

    isProcessing = true;
    
    try {
      const nombreClinica = process.env.NOMBRE_CLINICA || 'Clínica Veterinaria';
      const processor = new MessageProcessor(nombreClinica);
      
      const excelPath = data?.excelPath || process.env.EXCEL_MP_PATH;
      
      if (!excelPath || !fs.existsSync(excelPath)) {
        throw new Error(`No se encontró el archivo de vacunas: ${excelPath}`);
      }

      win.webContents.send('send-progress', {
        status: 'iniciando',
        message: '📤 Enviando recordatorios de vacunas...',
        progress: 0
      });

      // ENVÍO REAL: último parámetro = true
      const result = await processor.processAndSend(
        excelPath,
        'vacunas',
        true  // <--- true = enviar realmente
      );

      win.webContents.send('send-complete', {
        tipo: 'vacunas',
        total: result.totalClientes,
        enviados: result.enviados.length,
        fallidos: result.fallidos.length,
        detalles: {
          enviados: result.enviados.map((c: any) => c.nombre),
          fallidos: result.fallidos.map((c: any) => c.nombre)
        }
      });

    } catch (error: any) {
      win.webContents.send('app-error', `Error enviando vacunas: ${error.message}`);
      console.error('Error enviando vacunas:', error);
    } finally {
      isProcessing = false;
    }
  });

  // ============================================
  // 4. SIMULAR ENVÍO DE CITAS (NO ENVÍA REAL)
  // ============================================
  ipcMain.on('simulate-citas', async (event, data) => {
    if (isProcessing) {
      event.reply('app-error', 'Ya hay un proceso en curso');
      return;
    }

    const win = BrowserWindow.getFocusedWindow();
    if (!win) return;

    isProcessing = true;
    
    try {
      const nombreClinica = process.env.NOMBRE_CLINICA || 'Clínica Veterinaria';
      const processor = new MessageProcessor(nombreClinica);
      
      const excelPath = data?.excelPath || process.env.EXCEL_AGENDAS_PATH;
      
      if (!excelPath || !fs.existsSync(excelPath)) {
        throw new Error(`No se encontró el archivo de citas: ${excelPath}`);
      }

      win.webContents.send('send-progress', {
        status: 'simulando',
        message: '🔬 SIMULANDO envío de citas (sin enviar realmente)...',
        progress: 0
      });

      // SIMULACIÓN: último parámetro = false
      const result = await processor.processAndSend(
        excelPath,
        'citas',
        false  // <--- false = solo simulación
      );

      // Mostrar los mensajes generados en la simulación
      const mensajesGenerados = result.clientesProcesados.map((c: any) => ({
        cliente: c.nombre,
        telefono: c.telefono,
        mensajes: c.mensajes.filter((m: any) => m.esPropio).map((m: any) => m.contenido)
      }));

      win.webContents.send('send-complete', {
        tipo: 'citas - 🔬 SIMULACIÓN',
        total: result.totalClientes,
        enviados: result.totalClientes, // En simulación, todos se "enviarían"
        fallidos: 0,
        detalles: {
          enviados: result.clientesProcesados.map((c: any) => c.nombre),
          fallidos: [],
          mensajes: mensajesGenerados  // <--- Incluye los mensajes generados
        }
      });

    } catch (error: any) {
      win.webContents.send('app-error', `Error en simulación de citas: ${error.message}`);
      console.error('Error en simulación de citas:', error);
    } finally {
      isProcessing = false;
    }
  });

  // ============================================
  // 5. SIMULAR ENVÍO DE VACUNAS (NO ENVÍA REAL)
  // ============================================
  ipcMain.on('simulate-vacunas', async (event, data) => {
    if (isProcessing) {
      event.reply('app-error', 'Ya hay un proceso en curso');
      return;
    }

    const win = BrowserWindow.getFocusedWindow();
    if (!win) return;

    isProcessing = true;
    
    try {
      const nombreClinica = process.env.NOMBRE_CLINICA || 'Clínica Veterinaria';
      const processor = new MessageProcessor(nombreClinica);
      
      const excelPath = data?.excelPath || process.env.EXCEL_MP_PATH;
      
      if (!excelPath || !fs.existsSync(excelPath)) {
        throw new Error(`No se encontró el archivo de vacunas: ${excelPath}`);
      }

      win.webContents.send('send-progress', {
        status: 'simulando',
        message: '🔬 SIMULANDO envío de vacunas (sin enviar realmente)...',
        progress: 0
      });

      // SIMULACIÓN: último parámetro = false
      const result = await processor.processAndSend(
        excelPath,
        'vacunas',
        false  // <--- false = solo simulación
      );

      // Mostrar los mensajes generados en la simulación
      const mensajesGenerados = result.clientesProcesados.map((c: any) => ({
        cliente: c.nombre,
        telefono: c.telefono,
        mensajes: c.mensajes.filter((m: any) => m.esPropio).map((m: any) => m.contenido)
      }));

      win.webContents.send('send-complete', {
        tipo: 'vacunas - 🔬 SIMULACIÓN',
        total: result.totalClientes,
        enviados: result.totalClientes,
        fallidos: 0,
        detalles: {
          enviados: result.clientesProcesados.map((c: any) => c.nombre),
          fallidos: [],
          mensajes: mensajesGenerados
        }
      });

    } catch (error: any) {
      win.webContents.send('app-error', `Error en simulación de vacunas: ${error.message}`);
      console.error('Error en simulación de vacunas:', error);
    } finally {
      isProcessing = false;
    }
  });

  // ============================================
  // 6. OBTENER LOGS
  // ============================================
  ipcMain.on('get-logs', async (event) => {
    try {
      const logsDir = path.join(process.cwd(), 'logs');
      if (!fs.existsSync(logsDir)) {
        event.reply('log-update', []);
        return;
      }

      const files = fs.readdirSync(logsDir);
      const logs = files
        .filter((f: string) => f.endsWith('.json'))
        .map((f: string) => {
          const filePath = path.join(logsDir, f);
          const stats = fs.statSync(filePath);
          return {
            name: f,
            size: stats.size,
            modified: stats.mtime,
            path: filePath
          };
        })
        .sort((a: any, b: any) => b.modified.getTime() - a.modified.getTime());

      event.reply('log-update', logs);
    } catch (error: any) {
      event.reply('app-error', `Error obteniendo logs: ${error.message}`);
    }
  });

  // ============================================
  // 7. LIMPIAR LOGS
  // ============================================
  ipcMain.on('clear-logs', async (event) => {
    try {
      const logsDir = path.join(process.cwd(), 'logs');
      if (fs.existsSync(logsDir)) {
        const files = fs.readdirSync(logsDir);
        for (const file of files) {
          fs.unlinkSync(path.join(logsDir, file));
        }
        event.reply('log-update', []);
        event.reply('app-error', '🗑️ Logs eliminados correctamente');
      }
    } catch (error: any) {
      event.reply('app-error', `Error limpiando logs: ${error.message}`);
    }
  });

  // ============================================
  // 8. EXPORTAR REPORTE
  // ============================================
  ipcMain.on('export-report', async (event, data) => {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return;

    const result = await dialog.showSaveDialog(win, {
      title: 'Guardar Reporte',
      defaultPath: `reporte_${new Date().toISOString().slice(0,10)}.csv`,
      filters: [
        { name: 'CSV', extensions: ['csv'] }
      ]
    });

    if (!result.canceled && result.filePath) {
      try {
        let csv = 'Cliente,Telefono,Mascota,Mensajes\n';
        if (data && data.clientes) {
          data.clientes.forEach((c: any) => {
            const mensajes = c.mensajes?.map((m: any) => m.contenido).join(' | ') || '';
            const mascotas = c.mascotas?.map((m: any) => m.nombre).join(', ') || '';
            csv += `"${c.nombre}","${c.telefono}","${mascotas}","${mensajes}"\n`;
          });
        }
        
        fs.writeFileSync(result.filePath, csv);
        win.webContents.send('app-error', `✅ Reporte exportado correctamente a: ${result.filePath}`);
      } catch (error: any) {
        win.webContents.send('app-error', `Error exportando reporte: ${error.message}`);
      }
    }
  });

  // ============================================
  // 9. OBTENER CONFIGURACIÓN
  // ============================================
  ipcMain.on('get-config', (event) => {
    const config = {
      nombreClinica: process.env.NOMBRE_CLINICA || 'Clínica Veterinaria',
      apiUrl: process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0',
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN ? '****' : '',
      waitBetween: parseInt(process.env.WAIT_BETWEEN_MESSAGES || '2000'),
      maxRetries: parseInt(process.env.MAX_RETRIES || '3')
    };
    event.reply('config-loaded', config);
  });

  // ============================================
  // 10. GUARDAR CONFIGURACIÓN
  // ============================================
  ipcMain.on('save-config', (event, config) => {
    try {
      const envPath = path.join(process.cwd(), '.env');
      let envContent = '';
      
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
      }
      
      const envVars: { [key: string]: string } = {
        NOMBRE_CLINICA: config.nombreClinica || '',
        WAIT_BETWEEN_MESSAGES: config.waitBetween?.toString() || '2000',
        MAX_RETRIES: config.maxRetries?.toString() || '3'
      };
      
      Object.keys(envVars).forEach(key => {
        const regex = new RegExp(`^${key}=.*$`, 'm');
        const value = envVars[key];
        
        if (regex.test(envContent)) {
          envContent = envContent.replace(regex, `${key}=${value}`);
        } else {
          envContent += `\n${key}=${value}`;
        }
      });
      
      fs.writeFileSync(envPath, envContent);
      event.reply('app-error', '✅ Configuración guardada correctamente');
      
    } catch (error: any) {
      event.reply('app-error', `Error guardando configuración: ${error.message}`);
    }
  });
}