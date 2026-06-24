import { app, BrowserWindow, ipcMain, Menu, shell, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { setupIPCHandlers } from './ipcHandlers';

// Configurar handlers IPC
setupIPCHandlers();

let mainWindow: BrowserWindow | null = null;

// Función para obtener la ruta correcta según el SO
function getAssetPath(relativePath: string): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'assets', relativePath);
  }
  return path.join(__dirname, '../../assets', relativePath);
}

// Función para obtener la ruta de datos
function getDataPath(): string {
  const userDataPath = app.getPath('userData');
  const dataPath = path.join(userDataPath, 'data');
  
  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath, { recursive: true });
  }
  
  return dataPath;
}

function createWindow() {
  // Asegurar que la carpeta data existe
  getDataPath();

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      // Para debug
      devTools: true
    },
    icon: path.join(__dirname, '../../assets/icon.ico'),
    title: 'WhatsApp Reminder System',
    frame: true,
    show: false,
    backgroundColor: '#f5f5f5'
  });

  // Cargar la interfaz - CON MANEJO DE ERRORES
  const indexPath = path.join(__dirname, '../renderer/index.html');
  
  console.log('Cargando index desde:', indexPath);
  
  // Verificar que el archivo existe
  if (!fs.existsSync(indexPath)) {
    console.error('❌ index.html no encontrado en:', indexPath);
    // Intentar con ruta alternativa
    const altPath = path.join(__dirname, '../../src/renderer/index.html');
    if (fs.existsSync(altPath)) {
      mainWindow.loadFile(altPath);
    } else {
      mainWindow.loadURL('data:text/html,<h1>Error: index.html no encontrado</h1>');
    }
  } else {
    mainWindow.loadFile(indexPath);
  }

  // Mostrar cuando esté listo
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    // Abrir DevTools en desarrollo
    if (!app.isPackaged) {
      mainWindow?.webContents.openDevTools();
    }
  });

  // Manejar errores de carga
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('❌ Error al cargar la página:', errorCode, errorDescription);
    // Mostrar error en la ventana
    mainWindow?.loadURL(`data:text/html,<h1>Error de carga</h1><p>${errorDescription}</p>`);
  });

  // Configurar menú
  const menu = Menu.buildFromTemplate(getMenuTemplate());
  Menu.setApplicationMenu(menu);

  // Abrir links externos en el navegador
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Log para verificar que todo funciona
  console.log('✅ Ventana creada correctamente');
}

function getMenuTemplate(): Electron.MenuItemConstructorOptions[] {
  return [
    {
      label: 'Archivo',
      submenu: [
        {
          label: 'Importar Excel',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            mainWindow?.webContents.send('menu-import-excel');
          }
        },
        { type: 'separator' },
        {
          label: 'Salir',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Acciones',
      submenu: [
        {
          label: 'Enviar Recordatorios de Citas',
          click: () => {
            mainWindow?.webContents.send('menu-send-citas');
          }
        },
        {
          label: 'Enviar Recordatorios de Vacunas',
          click: () => {
            mainWindow?.webContents.send('menu-send-vacunas');
          }
        },
        { type: 'separator' },
        {
          label: '🔬 SIMULAR Citas',
          click: () => {
            mainWindow?.webContents.send('menu-simulate-citas');
          }
        },
        {
          label: '🔬 SIMULAR Vacunas',
          click: () => {
            mainWindow?.webContents.send('menu-simulate-vacunas');
          }
        }
      ]
    },
    {
      label: 'Ver',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Ayuda',
      submenu: [
        {
          label: 'Documentación',
          click: () => {
            shell.openExternal('https://github.com/tu-repo');
          }
        },
        { type: 'separator' },
        {
          label: 'Acerca de',
          click: () => {
            dialog.showMessageBox(mainWindow!, {
              type: 'info',
              title: 'Acerca de',
              message: 'WhatsApp Reminder System v1.0.0',
              detail: 'Sistema de envío de recordatorios por WhatsApp'
            });
          }
        }
      ]
    }
  ];
}

// App lifecycle con mejor manejo de errores
app.whenReady().then(() => {
  console.log('🚀 App lista, creando ventana...');
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}).catch((error) => {
  console.error('❌ Error al iniciar la app:', error);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
  // Mostrar en la interfaz
  mainWindow?.webContents.send('app-error', `Error: ${error.message}`);
});

// Manejar promesas rechazadas
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada:', reason);
  mainWindow?.webContents.send('app-error', `Error: ${reason}`);
});