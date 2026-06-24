import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

interface LogFile {
  name: string;
  size: number;
  modified: Date;
  path: string;
}

const LogsViewer: React.FC = () => {
  const [logs, setLogs] = useState<LogFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogFile | null>(null);
  const [logContent, setLogContent] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  const loadLogs = async () => {
    setLoading(true);
    if (window.electronAPI) {
      window.electronAPI.send('get-logs');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.on('log-update', (data) => {
        setLogs(data);
      });
    }
    loadLogs();
  }, []);

  const handleViewLog = async (log: LogFile) => {
    setSelectedLog(log);
    try {
      if (window.electronAPI) {
        // Simular lectura de log
        const content = `Fecha: ${log.modified}\nTamaño: ${log.size} bytes\n\nContenido del log...`;
        setLogContent(content);
        setOpenDialog(true);
      }
    } catch (error) {
      toast.error('Error al leer el log');
    }
  };

  const handleDeleteLog = async (logName: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar ${logName}?`)) {
      try {
        // Simular eliminación
        toast.success(`Log ${logName} eliminado`);
        loadLogs();
      } catch (error) {
        toast.error('Error al eliminar el log');
      }
    }
  };

  const handleClearAll = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar todos los logs?')) {
      if (window.electronAPI) {
        window.electronAPI.send('clear-logs');
        toast.success('Todos los logs eliminados');
        loadLogs();
      }
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">
            Registros de Envíos
          </Typography>
          <Box>
            <Button
              startIcon={<RefreshIcon />}
              onClick={loadLogs}
              disabled={loading}
              sx={{ mr: 1 }}
            >
              Actualizar
            </Button>
            <Button
              startIcon={<ClearIcon />}
              color="error"
              onClick={handleClearAll}
              disabled={logs.length === 0}
            >
              Limpiar Todo
            </Button>
          </Box>
        </Box>

        {logs.length === 0 ? (
          <Alert severity="info">
            No hay registros de envíos disponibles
          </Alert>
        ) : (
          <List>
            {logs.map((log, index) => (
              <ListItem
                key={index}
                divider
                sx={{
                  '&:hover': {
                    bgcolor: '#f5f5f5'
                  }
                }}
              >
                <ListItemText
                  primary={log.name}
                  secondary={
                    <>
                      <Chip
                        label={`Tamaño: ${formatSize(log.size)}`}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={`Modificado: ${log.modified.toLocaleString()}`}
                        size="small"
                        variant="outlined"
                      />
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleViewLog(log)}
                    title="Ver log"
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => handleDeleteLog(log.name)}
                    title="Eliminar log"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* Dialog para ver contenido del log */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedLog?.name}
        </DialogTitle>
        <DialogContent>
          <TextField
            multiline
            fullWidth
            rows={15}
            value={logContent}
            variant="outlined"
            InputProps={{
              readOnly: true,
              sx: {
                fontFamily: 'monospace',
                fontSize: '13px'
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cerrar</Button>
          <Button
            startIcon={<DownloadIcon />}
            onClick={() => {
              toast.info('Descargando log...');
            }}
          >
            Descargar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LogsViewer;