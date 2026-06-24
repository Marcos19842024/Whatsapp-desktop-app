import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Divider,
  Alert,
  Grid,
  Card,
  CardContent,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Visibility,
  VisibilityOff,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

interface ConfigData {
  nombreClinica: string;
  apiUrl: string;
  phoneNumberId: string;
  accessToken: string;
  waitBetween: number;
  maxRetries: number;
}

const Settings: React.FC = () => {
  const [config, setConfig] = useState<ConfigData>({
    nombreClinica: '',
    apiUrl: '',
    phoneNumberId: '',
    accessToken: '',
    waitBetween: 2000,
    maxRetries: 3
  });
  const [showToken, setShowToken] = useState(false);
  const [showPhoneId, setShowPhoneId] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Cargar configuración
    if (window.electronAPI) {
      window.electronAPI.on('config-loaded', (data) => {
        setConfig(data);
      });
      window.electronAPI.send('get-config');
    }
  }, []);

  const handleSave = () => {
    if (window.electronAPI) {
      window.electronAPI.send('save-config', config);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      toast.success('Configuración guardada correctamente');
    }
  };

  const handleRefresh = () => {
    if (window.electronAPI) {
      window.electronAPI.send('get-config');
      toast.info('Configuración recargada');
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">
            Configuración del Sistema
          </Typography>
          <Box>
            <IconButton onClick={handleRefresh} title="Recargar configuración">
              <RefreshIcon />
            </IconButton>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSave}
            >
              Guardar Configuración
            </Button>
          </Box>
        </Box>

        {saved && (
          <Alert icon={<CheckCircleIcon />} severity="success" sx={{ mb: 3 }}>
            Configuración guardada exitosamente
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nombre de la Clínica"
              value={config.nombreClinica}
              onChange={(e) => setConfig({ ...config, nombreClinica: e.target.value })}
              helperText="Este nombre aparecerá en los mensajes"
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="URL de la API de WhatsApp"
              value={config.apiUrl}
              onChange={(e) => setConfig({ ...config, apiUrl: e.target.value })}
              helperText="URL de la API de WhatsApp Business"
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="ID del Número de Teléfono"
              value={config.phoneNumberId}
              onChange={(e) => setConfig({ ...config, phoneNumberId: e.target.value })}
              type={showPhoneId ? 'text' : 'password'}
              helperText="ID del número de teléfono de WhatsApp Business"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPhoneId(!showPhoneId)}>
                      {showPhoneId ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Token de Acceso"
              value={config.accessToken}
              onChange={(e) => setConfig({ ...config, accessToken: e.target.value })}
              type={showToken ? 'text' : 'password'}
              helperText="Token de acceso de la API de WhatsApp"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowToken(!showToken)}>
                      {showToken ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Espera entre mensajes (ms)"
              value={config.waitBetween}
              onChange={(e) => setConfig({ ...config, waitBetween: parseInt(e.target.value) || 2000 })}
              type="number"
              helperText="Tiempo de espera entre el envío de cada mensaje"
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Intentos máximos"
              value={config.maxRetries}
              onChange={(e) => setConfig({ ...config, maxRetries: parseInt(e.target.value) || 3 })}
              type="number"
              helperText="Número máximo de reintentos en caso de fallo"
              sx={{ mb: 2 }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle1" gutterBottom>
          Configuración Avanzada
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  WhatsApp Business API
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Asegúrate de que tu token tenga los permisos necesarios para enviar mensajes.
                  La API requiere autenticación con token de acceso.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Plantillas de Mensajes
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Las plantillas deben estar aprobadas en el Meta Business Suite antes de ser utilizadas.
                  Las plantillas disponibles: citas, vacunas, y personalizadas.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            size="large"
          >
            Guardar Configuración
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Settings;