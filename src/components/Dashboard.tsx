import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  LinearProgress,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Fab,
  Tooltip,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Message as MessageIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  CloudUpload as CloudUploadIcon,
  Send as SendIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  WhatsApp as WhatsAppIcon,
  Science as ScienceIcon
} from '@mui/icons-material';
import { FileWithPath, useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import ClientsList from './ClientsList';
import MessagePreview from './MessagePreview';
import Settings from './Settings';
import LogsViewer from './LogsViewer';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Dashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    enviados: 0,
    fallidos: 0,
    pendientes: 0
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' as 'info' | 'success' | 'error' | 'warning'
  });

  // Dropzone para Excel
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    onDrop: async (files: FileWithPath[]) => {
      console.log('📄 Archivo soltado en Dropzone:', files);
      
      if (files.length > 0) {
        const file = files[0];
        console.log('📄 Archivo:', file.name, 'Tamaño:', file.size);
        
        if (window.electronAPI) {
          setIsImporting(true);
          toast.info(`📂 Procesando archivo: ${file.name}`);
          
          // TIMEOUT: Si pasa más de 30 segundos, mostrar error
          const timeoutId = setTimeout(() => {
            if (isImporting) {
              setIsImporting(false);
              toast.error('⏱️ El procesamiento está tomando demasiado tiempo');
            }
          }, 30000);
        
          try {
            // Leer el archivo como ArrayBuffer
            const arrayBuffer = await file.arrayBuffer();
            
            // Convertir a base64
            const uint8Array = new Uint8Array(arrayBuffer);
            let binary = '';
            for (let i = 0; i < uint8Array.length; i++) {
              binary += String.fromCharCode(uint8Array[i]);
            }
            const base64 = btoa(binary);
            
            console.log('📤 Enviando archivo al main process...');
            console.log('📊 Tamaño base64:', base64.length);
            
            // Enviar al proceso principal
            window.electronAPI.send('import-excel-data', {
              fileName: file.name,
              fileData: base64
            });

            // Limpiar timeout
            clearTimeout(timeoutId);
        
          } catch (error) {
            console.error('❌ Error al leer el archivo:', error);
            toast.error('Error al leer el archivo');
            setIsImporting(false);
            // Limpiar timeout
            clearTimeout(timeoutId);
          }
        } else {
          console.error('❌ electronAPI no disponible');
          toast.error('API no disponible');
        }
      }
    }
  });

  // Escuchar el evento import-complete
  useEffect(() => {
      console.log('🔍 Dashboard mounted');
      console.log('📡 window.electronAPI disponible:', !!window.electronAPI);
      
      if (!window.electronAPI) {
          console.error('❌ electronAPI NO disponible');
          return;
      }

      // Registrar listener para import-complete
      window.electronAPI.on('import-complete', (data) => {
          console.log('🎉 ===== import-complete RECIBIDO =====');
          console.log('📊 Datos:', {
              fileName: data.fileName,
              tipo: data.tipo,
              total: data.total,
              primerCliente: data.clientes?.[0]
          });
          
          if (!data || !data.clientes) {
              console.error('❌ Datos inválidos');
              toast.error('Datos inválidos recibidos');
              return;
          }

          // Actualizar el estado
          setUploadedFile(data.fileName);
          setClients(data.clientes);
          setStats({
              total: data.clientes.length,
              enviados: 0,
              fallidos: 0,
              pendientes: data.clientes.length
          });
          
          setIsImporting(false);
          
          // Mostrar mensaje de éxito con detalles
          const tipoTexto = data.tipo === 'vacunas' ? 'Vacunas' : 'Citas';
          toast.success(`✅ ${data.clientes.length} clientes de ${tipoTexto} importados de ${data.fileName}`);
          
          console.log('✅ Estado actualizado correctamente');
      });

      // Registrar listener para errores
      window.electronAPI.on('app-error', (message) => {
          console.log('❌ app-error recibido:', message);
          setIsImporting(false);
          toast.error(message);
      });

      // Solicitar configuración
      console.log('📤 Solicitando configuración...');
      window.electronAPI.send('get-config');
      
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    if (window.electronAPI) {
      // Escuchar eventos del main
      window.electronAPI.on('import-complete', (data) => {
        setClients(data.clientes);
        setStats(prev => ({
          ...prev,
          total: data.clientes.length,
          pendientes: data.clientes.length
        }));
        toast.success(`Archivo ${data.fileName} importado correctamente`);
      });

      window.electronAPI.on('send-progress', (data) => {
        setIsProcessing(true);
        setProgress(data.progress || 0);
        setProgressMessage(data.message || 'Procesando...');
      });

      window.electronAPI.on('send-complete', (data) => {
        setIsProcessing(false);
        setProgress(100);
        setStats(prev => ({
          ...prev,
          enviados: data.enviados,
          fallidos: data.fallidos,
          pendientes: data.total - data.enviados
        }));
        toast.success(`Envío completado: ${data.enviados} enviados, ${data.fallidos} fallidos`);
      });

      // Menú actions
      window.electronAPI.on('menu-import-excel', () => {
        // Simular click en el dropzone
        const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
        fileInput?.click();
      });

      window.electronAPI.on('menu-send-citas', () => {
        handleSendCitas();
      });

      window.electronAPI.on('menu-send-vacunas', () => {
        handleSendVacunas();
      });
    }

    return () => {
      // Limpiar listeners
    };
  }, []);

  const handleSendCitas = async () => {
    if (window.electronAPI) {
      window.electronAPI.send('send-citas', {
        excelPath: process.env.EXCEL_AGENDAS_PATH
      });
    }
  };

  const handleSendVacunas = async () => {
    if (window.electronAPI) {
      window.electronAPI.send('send-vacunas', {
        excelPath: process.env.EXCEL_MP_PATH
      });
    }
  };

  const handleRefresh = () => {
    if (window.electronAPI) {
      window.electronAPI.send('get-logs');
    }
    toast.info('Actualizando...');
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* App Bar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <WhatsAppIcon sx={{ mr: 2 }} />
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            WhatsApp Reminder System
          </Typography>

          <Tooltip title="Actualizar">
            <IconButton color="inherit" onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: 8,
          height: '100vh',
          overflow: 'auto',
          bgcolor: 'background.default'
        }}
      >
        <Container maxWidth="xl" sx={{ py: 3 }}>
          {/* Dropzone */}
          <Paper sx={{ p: 3, mb: 3 }} {...getRootProps()}>
            <input {...getInputProps()} />
            <Box sx={{ textAlign: 'center' }}>
              <CloudUploadIcon sx={{ fontSize: 48, color: '#25D366', mb: 2 }} />
              <Typography variant="h6">
                {isDragActive ? 'Suelta el archivo aquí' : 'Arrastra o haz clic para importar Excel'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Soporta archivos .xlsx y .xls
              </Typography>
              {isImporting && (
                <Box sx={{ mt: 2 }}>
                  <CircularProgress size={24} />
                  <Typography variant="body2">Cargando archivo...</Typography>
                </Box>
              )}
              {uploadedFile && !isImporting && (
                <Chip 
                  label={`Archivo: ${uploadedFile}`} 
                  color="success" 
                  sx={{ mt: 2 }}
                />
              )}
            </Box>
          </Paper>

          {/* Progress Bar */}
          {isProcessing && (
            <Box sx={{ mb: 3 }}>
              <LinearProgress variant="determinate" value={progress} />
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {progressMessage}
              </Typography>
            </Box>
          )}

          {/* Tabs */}
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
            <Tab label="Dashboard" icon={<DashboardIcon />} />
            <Tab label={`Clientes (${stats.total})`} icon={<PeopleIcon />} />
            <Tab label="Mensajes" icon={<MessageIcon />} />
          <Tab label="Logs" icon={<HistoryIcon />} />
            <Tab label="Configuración" icon={<SettingsIcon />} />
          </Tabs>

          {/* Tab Panels */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Acciones Rápidas
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<ScienceIcon />}
                      onClick={() => window.electronAPI?.send('simulate-citas', {})}
                      disabled={isProcessing}
                      fullWidth
                    >
                      🔬 Enviar Recordatorios de Citas (prueba)
                    </Button>

                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<ScienceIcon />}
                      onClick={() => window.electronAPI?.send('simulate-vacunas', {})}
                      disabled={isProcessing}
                      fullWidth
                    >
                      🔬 Enviar Recordatorios de Vacunas (prueba)
                    </Button>

                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<SendIcon />}
                      onClick={handleSendCitas}
                      disabled={isProcessing}
                      fullWidth
                    >
                      Enviar Recordatorios de Citas
                    </Button>

                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<SendIcon />}
                      onClick={handleSendVacunas}
                      disabled={isProcessing}
                      fullWidth
                    >
                      Enviar Recordatorios de Vacunas
                    </Button>

                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => {
                        if (window.electronAPI) {
                          window.electronAPI.send('export-report', { clientes: clients });
                        }
                      }}
                      disabled={clients.length === 0}
                      fullWidth
                    >
                      Exportar Reporte
                    </Button>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Resumen de Envíos
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-around', py: 2 }}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="success.main">
                        {stats.enviados}
                      </Typography>
                      <Typography variant="body2">Enviados</Typography>
                    </Box>
                    <Box textAlign="center">
                      <Typography variant="h4" color="error.main">
                        {stats.fallidos}
                      </Typography>
                      <Typography variant="body2">Fallidos</Typography>
                    </Box>
                    <Box textAlign="center">
                      <Typography variant="h4" color="warning.main">
                        {stats.pendientes}
                      </Typography>
                      <Typography variant="body2">Pendientes</Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Últimos Clientes Procesados
                  </Typography>
                  <ClientsList clients={clients.slice(0, 10)} onSelect={setSelectedClient} />
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Paper sx={{ p: 3 }}>
              <ClientsList clients={clients} onSelect={setSelectedClient} />
            </Paper>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Clientes
                  </Typography>
                  <ClientsList 
                    clients={clients} 
                    onSelect={setSelectedClient}
                    selectedId={selectedClient?.nombre}
                  />
                </Paper>
              </Grid>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3, minHeight: 400 }}>
                  <Typography variant="h6" gutterBottom>
                    Previsualización de Mensaje
                  </Typography>
                  {selectedClient ? (
                    <MessagePreview client={selectedClient} />
                  ) : (
                    <Typography color="textSecondary" align="center" sx={{ mt: 8 }}>
                      Selecciona un cliente para ver sus mensajes
                    </Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <LogsViewer />
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <Settings />
          </TabPanel>
        </Container>
      </Box>

      {/* FAB para enviar rápido */}
      {clients.length > 0 && !isProcessing && (
        <Tooltip title="Enviar mensajes">
          <Fab
            color="primary"
            sx={{ position: 'fixed', bottom: 32, right: 32 }}
            onClick={() => {
              if (window.electronAPI) {
                window.electronAPI.send('send-citas', {});
              }
            }}
          >
            <SendIcon />
          </Fab>
        </Tooltip>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;