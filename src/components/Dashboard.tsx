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
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  LinearProgress,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Fab,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Message as MessageIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  Menu as MenuIcon,
  CloudUpload as CloudUploadIcon,
  Send as SendIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Notifications as NotificationsIcon,
  WhatsApp as WhatsAppIcon,
  Science as ScienceIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';

import StatsCards from './StatsCards';
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
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
    onDrop: async (files) => {
      if (files.length > 0) {
        const file = files[0];
        // Enviar al proceso principal para importar
        if (window.electronAPI) {
          // Simular importación
          toast.info(`Importando archivo: ${file.name}`);
          // Aquí se implementaría la lógica real de importación
        }
      }
    }
  });

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
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <WhatsAppIcon sx={{ mr: 2 }} />
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            WhatsApp Reminder System
          </Typography>

          <Badge badgeContent={stats.pendientes} color="error">
            <NotificationsIcon sx={{ mr: 2 }} />
          </Badge>

          <Tooltip title="Actualizar">
            <IconButton color="inherit" onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250, mt: 8 }}>
          <List>
            <ListItem button selected={tabValue === 0} onClick={() => { setTabValue(0); setDrawerOpen(false); }}>
              <ListItemIcon><DashboardIcon /></ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem button selected={tabValue === 1} onClick={() => { setTabValue(1); setDrawerOpen(false); }}>
              <ListItemIcon><PeopleIcon /></ListItemIcon>
              <ListItemText primary="Clientes" />
            </ListItem>
            <ListItem button selected={tabValue === 2} onClick={() => { setTabValue(2); setDrawerOpen(false); }}>
              <ListItemIcon><MessageIcon /></ListItemIcon>
              <ListItemText primary="Mensajes" />
            </ListItem>
            <ListItem button selected={tabValue === 3} onClick={() => { setTabValue(3); setDrawerOpen(false); }}>
              <ListItemIcon><HistoryIcon /></ListItemIcon>
              <ListItemText primary="Logs" />
            </ListItem>
          </List>
          <Divider />
          <List>
            <ListItem button selected={tabValue === 4} onClick={() => { setTabValue(4); setDrawerOpen(false); }}>
              <ListItemIcon><SettingsIcon /></ListItemIcon>
              <ListItemText primary="Configuración" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

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
          {/* Stats Cards */}
          <StatsCards stats={stats} />

          {/* Dropzone */}
          <Paper sx={{ p: 3, mb: 3, mt: 3 }} {...getRootProps()}>
            <input {...getInputProps()} />
            <Box sx={{ textAlign: 'center' }}>
              <CloudUploadIcon sx={{ fontSize: 48, color: '#25D366', mb: 2 }} />
              <Typography variant="h6">
                {isDragActive ? 'Suelta el archivo aquí' : 'Arrastra o haz clic para importar Excel'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Soporta archivos .xlsx y .xls
              </Typography>
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
            <Tab label="Dashboard" />
            <Tab label={`Clientes (${stats.total})`} />
            <Tab label="Mensajes" />
            <Tab label="Logs" />
            <Tab label="Configuración" />
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

      // Botones de prueba de simulación
      <Button
        variant="outlined"
        color="warning"
        startIcon={<ScienceIcon />}
        onClick={() => window.electronAPI?.send('simulate-citas', {})}
        disabled={isProcessing}
        fullWidth
      >
        🔬 SIMULAR Citas
      </Button>

      <Button
        variant="outlined"
        color="warning"
        startIcon={<ScienceIcon />}
        onClick={() => window.electronAPI?.send('simulate-vacunas', {})}
        disabled={isProcessing}
        fullWidth
      >
        🔬 SIMULAR Vacunas
      </Button>
    </Box>
  );
};

export default Dashboard;