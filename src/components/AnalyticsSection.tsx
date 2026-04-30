import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Skeleton,
  Alert,
  Chip,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  ComposedChart,
} from 'recharts';
import { BarChart as BarChartIcon } from '@mui/icons-material';
import { membersAPI } from '../services/api';
import type { Analytics } from '../types';

type ViewMode = 'daily' | 'monthly' | 'yearly';

const formatRevenue = (value: number) => {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value}`;
};

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <Box
      sx={{
        bgcolor: '#1a1a2e',
        color: '#fff',
        p: 1.5,
        borderRadius: 2,
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        minWidth: 160,
      }}
    >
      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block', mb: 0.5 }}>
        {label}
      </Typography>
      {payload.map((p) => (
        <Box key={p.name} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Typography variant="caption" sx={{ color: p.color, fontWeight: 600 }}>
            {p.name}
          </Typography>
          <Typography variant="caption" fontWeight={700} sx={{ color: '#fff' }}>
            {p.name === 'Revenue' ? formatRevenue(p.value) : p.value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

const AnalyticsSection: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>('monthly');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await membersAPI.getAnalytics();
        setAnalytics(data.data);
      } catch {
        setError('Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const chartData = (() => {
    if (!analytics) return [];
    if (view === 'daily') {
      return analytics.daily.map((d) => ({
        label: d.date.slice(5), // MM-DD
        Members: d.count,
        Revenue: d.revenue,
      }));
    }
    if (view === 'monthly') {
      return analytics.monthly.map((m) => ({
        label: m.month,
        Members: m.count,
        Revenue: m.revenue,
      }));
    }
    return analytics.yearly.map((y) => ({
      label: y.year,
      Members: y.count,
      Revenue: y.revenue,
    }));
  })();

  const totals = (() => {
    if (!analytics) return { members: 0, revenue: 0 };
    const src = view === 'daily' ? analytics.daily : view === 'monthly' ? analytics.monthly : analytics.yearly;
    return src.reduce(
      (acc, d) => ({ members: acc.members + d.count, revenue: acc.revenue + d.revenue }),
      { members: 0, revenue: 0 }
    );
  })();

  const viewLabel = view === 'daily' ? 'Last 30 Days' : view === 'monthly' ? `Year ${new Date().getFullYear()}` : 'Last 3 Years';

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BarChartIcon sx={{ color: '#0f3460' }} />
            <Typography variant="h6" fontWeight={700}>
              Analytics
            </Typography>
            <Chip label={viewLabel} size="small" sx={{ bgcolor: '#f0f2f5', fontWeight: 600, ml: 0.5 }} />
          </Box>

          <ToggleButtonGroup
            size="small"
            value={view}
            exclusive
            onChange={(_, v) => v && setView(v)}
            sx={{ '& .MuiToggleButton-root': { textTransform: 'none', px: 2, fontWeight: 600 } }}
          >
            <ToggleButton value="daily">Daily</ToggleButton>
            <ToggleButton value="monthly">Monthly</ToggleButton>
            <ToggleButton value="yearly">Yearly</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Summary chips */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Box sx={{ px: 2, py: 1, bgcolor: 'rgba(15,52,96,0.07)', borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Total Members
            </Typography>
            <Typography variant="h6" fontWeight={800} color="#0f3460">
              {totals.members}
            </Typography>
          </Box>
          <Box sx={{ px: 2, py: 1, bgcolor: 'rgba(46,204,113,0.08)', borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Total Revenue
            </Typography>
            <Typography variant="h6" fontWeight={800} color="success.dark">
              {formatRevenue(totals.revenue)}
            </Typography>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#666' }}
                tickLine={false}
                axisLine={false}
                interval={view === 'daily' ? 4 : 0}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: '#666' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                width={30}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: '#666' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatRevenue}
                width={55}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                iconType="circle"
                iconSize={8}
              />
              <Bar
                yAxisId="left"
                dataKey="Members"
                fill="#0f3460"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="Revenue"
                stroke="#2ecc71"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#2ecc71', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}

        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1, textAlign: 'right' }}>
          Bars = new members (left axis) &bull; Line = revenue (right axis)
        </Typography>
      </CardContent>
    </Card>
  );
};

export default AnalyticsSection;
