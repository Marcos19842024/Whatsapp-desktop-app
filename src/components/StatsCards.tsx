import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import {
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Pending as PendingIcon
} from '@mui/icons-material';

interface StatsCardsProps {
  stats: {
    total: number;
    enviados: number;
    fallidos: number;
    pendientes: number;
  };
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Total Clientes',
      value: stats.total,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      bg: '#e3f2fd'
    },
    {
      title: 'Enviados',
      value: stats.enviados,
      icon: <CheckCircleIcon sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
      bg: '#e8f5e9'
    },
    {
      title: 'Fallidos',
      value: stats.fallidos,
      icon: <ErrorIcon sx={{ fontSize: 40 }} />,
      color: '#c62828',
      bg: '#ffebee'
    },
    {
      title: 'Pendientes',
      value: stats.pendientes,
      icon: <PendingIcon sx={{ fontSize: 40 }} />,
      color: '#e65100',
      bg: '#fff3e0'
    }
  ];

  return (
    <Grid container spacing={3}>
      {cards.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Paper
            className="stat-card"
            sx={{
              p: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: card.bg
            }}
          >
            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {card.title}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 600, color: card.color }}>
                {card.value}
              </Typography>
            </Box>
            <Box sx={{ color: card.color, opacity: 0.8 }}>
              {card.icon}
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default StatsCards;