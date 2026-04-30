import React from 'react';
import { Grid, Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import {
  People as PeopleIcon,
  CheckCircle as ActiveIcon,
  Cancel as ExpiredIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import type { Stats } from '../types';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, bgColor, loading }) => (
  <Card
    sx={{
      height: '100%',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' },
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={500} gutterBottom>
            {title}
          </Typography>
          {loading ? (
            <Skeleton width={60} height={40} />
          ) : (
            <Typography variant="h4" fontWeight={800} color="text.primary">
              {value}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: bgColor,
            color: color,
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

interface DashboardCardsProps {
  stats: Stats;
  loading?: boolean;
}

const DashboardCards: React.FC<DashboardCardsProps> = ({ stats, loading }) => {
  const cards = [
    {
      title: 'Total Members',
      value: stats.total,
      icon: <PeopleIcon fontSize="large" />,
      color: '#1a1a2e',
      bgColor: '#e8eaf6',
    },
    {
      title: 'Active Members',
      value: stats.active,
      icon: <ActiveIcon fontSize="large" />,
      color: '#2ecc71',
      bgColor: '#e8f5e9',
    },
    {
      title: 'Expired Members',
      value: stats.expired,
      icon: <ExpiredIcon fontSize="large" />,
      color: '#e74c3c',
      bgColor: '#fce4ec',
    },
    {
      title: 'Expiring Soon',
      value: stats.expiringSoon,
      icon: <WarningIcon fontSize="large" />,
      color: '#f39c12',
      bgColor: '#fff8e1',
    },
  ];

  return (
    <Grid container spacing={3}>
      {cards.map((card) => (
        <Grid item xs={12} sm={6} lg={3} key={card.title}>
          <StatCard {...card} loading={loading} />
        </Grid>
      ))}
    </Grid>
  );
};

export default DashboardCards;
