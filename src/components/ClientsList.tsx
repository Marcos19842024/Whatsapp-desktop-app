import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Typography,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Collapse,
  Paper
} from '@mui/material';
import {
  Search as SearchIcon,
  Pets as PetsIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';

interface ClientsListProps {
  clients: any[];
  onSelect: (client: any) => void;
  selectedId?: string;
}

const ClientsList: React.FC<ClientsListProps> = ({ clients, onSelect, selectedId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filteredClients = clients.filter(client =>
    client.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.mascotas.some((m: any) => m.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleExpand = (clientName: string) => {
    setExpanded(expanded === clientName ? null : clientName);
  };

  if (clients.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="textSecondary">
          No hay clientes cargados
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        placeholder="Buscar cliente o mascota..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          )
        }}
      />

      <List sx={{ maxHeight: 400, overflow: 'auto' }}>
        {filteredClients.map((client) => (
          <React.Fragment key={client.nombre}>
            <ListItem
              button
              selected={selectedId === client.nombre}
              onClick={() => {
                onSelect(client);
                handleExpand(client.nombre);
              }}
              sx={{
                borderBottom: '1px solid #f0f0f0',
                '&:hover': {
                  background: '#f5f5f5'
                }
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: '#25D366' }}>
                  {client.nombre.charAt(0)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="subtitle1">{client.nombre}</Typography>
                    <Chip
                      label={`${client.mascotas.length} mascotas`}
                      size="small"
                      icon={<PetsIcon />}
                      variant="outlined"
                    />
                    <Chip
                      label={`${client.mensajes.filter((m: any) => m.esPropio).length} mensajes`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                }
                secondary={client.telefono}
              />
              <IconButton onClick={() => handleExpand(client.nombre)}>
                {expanded === client.nombre ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </ListItem>
            <Collapse in={expanded === client.nombre}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: '#fafafa' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Mascotas:
                </Typography>
                {client.mascotas.map((mascota: any) => (
                  <Chip
                    key={mascota.nombre}
                    label={mascota.nombre}
                    icon={<PetsIcon />}
                    sx={{ mr: 1, mb: 1 }}
                    size="small"
                  />
                ))}
              </Paper>
            </Collapse>
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default ClientsList;