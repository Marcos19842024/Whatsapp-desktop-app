import { ipcMain, dialog, BrowserWindow } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

console.log('🔧 ===== INICIALIZANDO IPC HANDLERS =====');

// Registrar manejadores directamente (sin función wrapper)
console.log('📌 Registrando manejadores IPC...');

// 1. MANEJADOR: get-config
ipcMain.on('get-config', (event) => {
  console.log('🎯 ===== get-config EJECUTADO =====');
  
  const config = {
    nombreClinica: process.env.NOMBRE_CLINICA || 'Clínica Veterinaria',
    apiUrl: process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN ? '****' : '',
    waitBetween: parseInt(process.env.WAIT_BETWEEN_MESSAGES || '2000'),
    maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
    excelAgendasPath: process.env.EXCEL_AGENDAS_PATH || './data/Agendas.xlsx',
    excelMpPath: process.env.EXCEL_MP_PATH || './data/MP_Pendientes.xlsx'
  };
  
  console.log('📋 Configuración enviada:', config);
  event.reply('config-loaded', config);
});

// 2. MANEJADOR: import-excel-data (VERSIÓN SIMPLIFICADA PARA PRUEBA)
ipcMain.on('import-excel-data', async (event, data) => {
    console.log('🎯 ===== import-excel-data EJECUTADO =====');
    console.log('📄 Datos recibidos:', {
        fileName: data?.fileName,
        fileDataLength: data?.fileData?.length || 0
    });
    
    const win = BrowserWindow.getFocusedWindow();
    if (!win) {
        console.error('❌ No hay ventana activa');
        return;
    }

    try {
        // 1. Verificar datos
        if (!data || !data.fileData) {
            throw new Error('No se recibieron datos del archivo');
        }

        // 2. Decodificar base64
        console.log('🔄 Decodificando base64...');
        const buffer = Buffer.from(data.fileData, 'base64');
        console.log(`✅ Buffer creado: ${buffer.length} bytes`);
        
        if (buffer.length === 0) {
            throw new Error('El buffer está vacío');
        }

        // 3. Leer con XLSX
        console.log('📖 Leyendo con XLSX...');
        const XLSX = require('xlsx');
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        console.log(`✅ Workbook leído. Hojas: ${workbook.SheetNames.join(', ')}`);
        
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const excelData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        
        console.log(`✅ Excel convertido: ${excelData.length} filas`);
        
        if (excelData.length === 0) {
            throw new Error('El Excel no contiene datos');
        }

        // 4. Mostrar encabezados
        const headers = excelData[0];
        console.log('📋 Encabezados:', headers);

        // 5. Determinar el tipo de archivo
        let tipo: 'vacunas' | 'citas' = 'citas';
        const headerStrings = headers.map((h: any) => h?.toString().toUpperCase() || '');
        
        // Verificar si es de vacunas
        const hasVacuna = headerStrings.some((h: string | string[]) => h.includes('VACUNA'));
        const hasCliente = headerStrings.some((h: string | string[]) => h.includes('CLIENTE'));
        const hasProximoFecha = headerStrings.some((h: string | string[]) => h.includes('PRÓXIMA') || h.includes('PROXIMA'));
        
        if (hasVacuna || hasCliente || hasProximoFecha) {
            tipo = 'vacunas';
            console.log('📝 Tipo detectado: VACUNAS');
        } else {
            console.log('📝 Tipo detectado: CITAS (por defecto)');
        }

        // 6. PROCESAR CON REMINDERSDATA
        console.log('🔄 Procesando con RemindersData...');
        const nombreClinica = process.env.NOMBRE_CLINICA || 'Clínica Veterinaria';
        const RemindersData = require('../services/remindersData').default;
        const remindersData = new RemindersData(nombreClinica);
        
        console.log('📊 Ejecutando procesarDatos...');
        const clientes = remindersData.procesarDatos(excelData, tipo);
        
        console.log(`✅ Clientes procesados: ${clientes.length}`);

        // 7. Verificar que hay clientes
        if (clientes.length === 0) {
            console.warn('⚠️ No se procesó ningún cliente');
            
            // Enviar mensaje de error
            win.webContents.send('app-error', 
                'No se encontraron clientes válidos. Verifica el formato del Excel.\n' +
                'Para citas: FECHA, INICIO, TIPO VISITA, PROPIETARIO, MASCOTA, TELÉFONO\n' +
                'Para vacunas: CLIENTE, TELÉFONO 1, MASCOTA, TIPO DE RECORDATORIO, VACUNA, PRÓXIMA FECHA'
            );
            return;
        }

        // 8. Mostrar clientes procesados
        console.log('👤 Clientes procesados:');
        clientes.slice(0, 5).forEach((c: any, i: number) => {
            console.log(`   ${i+1}. ${c.nombre} - ${c.telefono} - ${c.mascotas?.length || 0} mascotas`);
            if (c.mensajes && c.mensajes.length > 0) {
                console.log(`      Mensajes: ${c.mensajes.length}`);
                // Mostrar primer mensaje
                const primerMensaje = c.mensajes.find((m: any) => m.esPropio);
                if (primerMensaje) {
                    console.log(`      Primer mensaje: ${primerMensaje.contenido.substring(0, 100)}...`);
                }
            }
        });

        // 9. Preparar datos para enviar al frontend
        const clientesData = clientes.map((c: any) => ({
            nombre: c.nombre || 'Sin nombre',
            telefono: c.telefono || 'Sin teléfono',
            mascotas: c.mascotas || [],
            mensajes: c.mensajes || [],
            status: c.status || false,
            // Campos adicionales
            fechaCita: c.fechaCita || '',
            horaCita: c.horaCita || '',
            tipoVisita: c.tipoVisita || '',
            asunto: c.asunto || '',
            agenda: c.agenda || '',
            estado: c.estado || ''
        }));

        // 10. Enviar al frontend
        console.log('📤 Enviando datos al frontend...');
        console.log(`📊 Total de clientes: ${clientesData.length}`);
        
        win.webContents.send('import-complete', {
            fileName: data.fileName,
            tipo: tipo,
            total: clientesData.length,
            clientes: clientesData
        });
        
        win.webContents.send('app-error', 
            `✅ Importados ${clientesData.length} clientes desde ${data.fileName}`
        );
        
        console.log('✅ IMPORTACIÓN COMPLETADA EXITOSAMENTE');

    } catch (error: any) {
        console.error('❌ Error:', error);
        console.error('❌ Stack:', error.stack);
        win.webContents.send('app-error', `Error: ${error.message}`);
    }
});

// 3. MANEJADOR: import-excel (diálogo)
ipcMain.on('import-excel', async (event) => {
  console.log('🎯 ===== import-excel EJECUTADO =====');
  
  const win = BrowserWindow.getFocusedWindow();
  if (!win) {
    console.error('❌ No hay ventana activa');
    return;
  }

  const result = await dialog.showOpenDialog(win, {
    properties: ['openFile'],
    filters: [
      { name: 'Excel Files', extensions: ['xlsx', 'xls'] }
    ]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0];
    console.log('📄 Archivo seleccionado:', filePath);
    
    // Leer el archivo y enviarlo
    try {
      const fileBuffer = fs.readFileSync(filePath);
      const base64 = fileBuffer.toString('base64');
      
      // Enviar al manejador import-excel-data
      ipcMain.emit('import-excel-data', event, {
        fileName: path.basename(filePath),
        fileData: base64
      });
    } catch (error: any) {
      console.error('❌ Error leyendo archivo:', error);
      win.webContents.send('app-error', `Error: ${error.message}`);
    }
  }
});

// 4. MANEJADOR: send-citas
ipcMain.on('send-citas', async (event, data) => {
  console.log('🎯 ===== send-citas EJECUTADO =====');
  const win = BrowserWindow.getFocusedWindow();
  if (!win) return;
  
  win.webContents.send('app-error', 'Función send-citas en desarrollo');
});

// 5. MANEJADOR: send-vacunas
ipcMain.on('send-vacunas', async (event, data) => {
  console.log('🎯 ===== send-vacunas EJECUTADO =====');
  const win = BrowserWindow.getFocusedWindow();
  if (!win) return;
  
  win.webContents.send('app-error', 'Función send-vacunas en desarrollo');
});

// 6. MANEJADOR: simulate-citas
ipcMain.on('simulate-citas', async (event, data) => {
  console.log('🎯 ===== simulate-citas EJECUTADO =====');
  const win = BrowserWindow.getFocusedWindow();
  if (!win) return;
  
  win.webContents.send('app-error', '🔬 Simulación de citas en desarrollo');
});

// 7. MANEJADOR: simulate-vacunas
ipcMain.on('simulate-vacunas', async (event, data) => {
  console.log('🎯 ===== simulate-vacunas EJECUTADO =====');
  const win = BrowserWindow.getFocusedWindow();
  if (!win) return;
  
  win.webContents.send('app-error', '🔬 Simulación de vacunas en desarrollo');
});

// 8. MANEJADOR: get-logs
ipcMain.on('get-logs', async (event) => {
  console.log('🎯 ===== get-logs EJECUTADO =====');
  event.reply('log-update', []);
});

// 9. MANEJADOR: clear-logs
ipcMain.on('clear-logs', async (event) => {
  console.log('🎯 ===== clear-logs EJECUTADO =====');
  event.reply('app-error', 'Logs limpiados');
});

// 10. MANEJADOR: export-report
ipcMain.on('export-report', async (event, data) => {
  console.log('🎯 ===== export-report EJECUTADO =====');
  const win = BrowserWindow.getFocusedWindow();
  if (!win) return;
  
  win.webContents.send('app-error', 'Función export-report en desarrollo');
});

// 11. MANEJADOR: save-config
ipcMain.on('save-config', (event, config) => {
  console.log('🎯 ===== save-config EJECUTADO =====');
  event.reply('app-error', 'Configuración guardada (simulada)');
});

console.log('✅ ===== TODOS LOS MANEJADORES REGISTRADOS =====');

// Exportar función vacía para compatibilidad
export function setupIPCHandlers() {
  console.log('✅ setupIPCHandlers llamado (ya registrados)');
}