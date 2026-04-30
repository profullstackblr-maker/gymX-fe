import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Skeleton,
  Alert,
  Divider,
  Avatar,
} from '@mui/material';
import {
  TrendingUp as TrendingIcon,
  Warning as WarningIcon,
  People as PeopleIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format, differenceInDays } from 'date-fns';
import { useMembers } from '../hooks/useMembers';
import { useAuth } from '../context/AuthContext';
import DashboardCards from '../components/DashboardCards';
import AnalyticsSection from '../components/AnalyticsSection';
import { PACKAGE_LABELS } from '../types';
import type { Member } from '../types';

const getRemainingDays = (expiryDate: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  return differenceInDays(expiry, today);
};

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { members, stats, loading, error, fetchMembers, fetchStats } = useMembers();

  useEffect(() => {
    fetchMembers();
    fetchStats();
  }, [fetchMembers, fetchStats]);

  const { admin } = useAuth();

  // Members expiring within 5 days (including today)
  const expiringSoon = members.filter((m) => {
    const r = getRemainingDays(m.expiryDate);
    return r >= 0 && r <= 5;
  });

  // Recently expired (last 7 days)
  const recentlyExpired = members.filter((m) => {
    const r = getRemainingDays(m.expiryDate);
    return r < 0 && r >= -7;
  });

  const AlertRow: React.FC<{ member: Member; type: 'warning' | 'error' }> = ({ member, type }) => {
    const remaining = getRemainingDays(member.expiryDate);
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 1.5,
          borderRadius: 2,
          bgcolor: type === 'warning' ? 'rgba(243,156,18,0.08)' : 'rgba(231,76,60,0.08)',
          border: `1px solid ${type === 'warning' ? 'rgba(243,156,18,0.3)' : 'rgba(231,76,60,0.3)'}`,
          mb: 1,
        }}
      >
        <Avatar
          sx={{
            width: 36,
            height: 36,
            bgcolor: type === 'warning' ? '#f39c12' : '#e74c3c',
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          {member.name.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {member.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {member.phone} &bull; {PACKAGE_LABELS[member.packageType]}
          </Typography>
        </Box>
        <Chip
          label={remaining < 0 ? `${Math.abs(remaining)}d ago` : remaining === 0 ? 'Today' : `${remaining}d left`}
          size="small"
          sx={{
            bgcolor: type === 'warning' ? '#f39c12' : '#e74c3c',
            color: '#fff',
            fontWeight: 700,
            fontSize: 11,
          }}
        />
      </Box>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Welcome back, {admin?.name?.split(' ')[0] || 'Admin'} 👋
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {format(new Date(), 'EEEE, MMMM d, yyyy')} &bull; Here's your gym overview
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Stats Cards */}
      <DashboardCards stats={stats} loading={loading} />

      {/* Analytics Charts */}
      <AnalyticsSection />

      {/* Alerts Section */}
      <Grid container spacing={3} sx={{ mt: 0.5 }}>
        {/* Expiring Soon */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WarningIcon sx={{ color: '#f39c12' }} />
                  <Typography variant="h6" fontWeight={700}>
                    Expiring Soon
                  </Typography>
                  {stats.expiringSoon > 0 && (
                    <Chip
                      label={stats.expiringSoon}
                      size="small"
                      sx={{ bgcolor: '#f39c12', color: '#fff', fontWeight: 700, ml: 0.5 }}
                    />
                  )}
                </Box>
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/members')}
                  sx={{ textTransform: 'none' }}
                >
                  View all
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} height={60} sx={{ borderRadius: 2, mb: 1 }} />
                ))
              ) : expiringSoon.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <TrendingIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                  <Typography color="text.secondary" variant="body2">
                    No members expiring soon
                  </Typography>
                </Box>
              ) : (
                expiringSoon.slice(0, 5).map((m) => <AlertRow key={m._id} member={m} type="warning" />)
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recently Expired */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PeopleIcon sx={{ color: '#e74c3c' }} />
                  <Typography variant="h6" fontWeight={700}>
                    Recently Expired
                  </Typography>
                  {recentlyExpired.length > 0 && (
                    <Chip
                      label={recentlyExpired.length}
                      size="small"
                      sx={{ bgcolor: '#e74c3c', color: '#fff', fontWeight: 700, ml: 0.5 }}
                    />
                  )}
                </Box>
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/members')}
                  sx={{ textTransform: 'none' }}
                >
                  View all
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} height={60} sx={{ borderRadius: 2, mb: 1 }} />
                ))
              ) : recentlyExpired.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <TrendingIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                  <Typography color="text.secondary" variant="body2">
                    No recently expired members
                  </Typography>
                </Box>
              ) : (
                recentlyExpired.slice(0, 5).map((m) => <AlertRow key={m._id} member={m} type="error" />)
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
