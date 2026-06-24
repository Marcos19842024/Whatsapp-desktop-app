import React from 'react';
import { Box, Typography, Paper, Chip, Divider } from '@mui/material';
import {
  Person as PersonIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';

interface MessagePreviewProps {
  client: any;
}

const MessagePreview: React.FC<MessagePreviewProps> = ({ client }) => {
  if (!client) return null;

  const ownMessages = client.mensajes.filter((m: any) => m.esPropio);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Typography variant="h6">
          {client.nombre}
        </Typography>
        <Chip
          label={`${client.mascotas.length} mascotas`}
          size="small"
          variant="outlined"
        />
        <Chip
          label={client.telefono}
          size="small"
          variant="outlined"
        />
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
        {ownMessages.map((msg: any, index: number) => (
          <Paper
            key={index}
            className="message-preview own"
            sx={{
              p: 2,
              mb: 2,
              bgcolor: '#e8f5e9',
              borderLeft: '4px solid #25D366'
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <PersonIcon fontSize="small" color="action" />
              <Typography variant="caption" color="textSecondary">
                Mensaje {index + 1}
              </Typography>
              <Box flex={1} />
              <AccessTimeIcon fontSize="small" color="action" />
              <Typography variant="caption" color="textSecondary">
                {msg.timestamp}
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                fontFamily: 'monospace',
                fontSize: '13px'
              }}
            >
              {msg.contenido}
            </Typography>
          </Paper>
        ))}

        {ownMessages.length === 0 && (
          <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
            No hay mensajes generados para este cliente
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default MessagePreview;