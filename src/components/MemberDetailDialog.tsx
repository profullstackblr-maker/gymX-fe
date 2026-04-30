import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  Avatar,
  Grid,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Schedule as TimeIcon,
  FitnessCenter as PackageIcon,
  Timer as TimerIcon,
  Edit as EditIcon,
  CurrencyRupee as RupeeIcon,
} from '@mui/icons-material';
import { format, differenceInDays } from 'date-fns';
import type { Member } from '../types';
import { PACKAGE_LABELS } from '../types';

interface MemberDetailDialogProps {
  open: boolean;
  member: Member | null;
  onClose: () => void;
  onEdit: (member: Member) => void;
}

const getRemainingDays = (expiryDate: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  return differenceInDays(expiry, today);
};

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string; valueColor?: string }> = ({
  icon,
  label,
  value,
  valueColor,
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.2 }}>
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: 2,
        bgcolor: 'grey.100',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        color: 'text.secondary',
      }}
    >
      {icon}
    </Box>
    <Box sx={{ flex: 1 }}>
      <Typography variant="caption" color="text.secondary" display="block" lineHeight={1.2}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} color={valueColor || 'text.primary'}>
        {value}
      </Typography>
    </Box>
  </Box>
);

const MemberDetailDialog: React.FC<MemberDetailDialogProps> = ({
  open,
  member,
  onClose,
  onEdit,
}) => {
  if (!member) return null;

  const remaining = getRemainingDays(member.expiryDate);
  const isExpired = remaining < 0;
  const isExpiringSoon = !isExpired && remaining <= 5;

  const statusColor = isExpired ? '#e74c3c' : isExpiringSoon ? '#f39c12' : '#2ecc71';
  const statusBg = isExpired ? '#fce4ec' : isExpiringSoon ? '#fff8e1' : '#e8f5e9';
  const statusLabel = isExpired ? 'Expired' : isExpiringSoon ? 'Expiring Soon' : 'Active';

  const avatarInitials = member.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}
    >
      {/* Coloured header band */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)',
          pt: 4,
          pb: 3,
          px: 3,
          position: 'relative',
          textAlign: 'center',
        }}
      >
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ position: 'absolute', top: 12, right: 12, color: 'rgba(255,255,255,0.7)' }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <Avatar
          sx={{
            width: 72,
            height: 72,
            bgcolor: statusColor,
            fontSize: 26,
            fontWeight: 800,
            mx: 'auto',
            mb: 1.5,
            boxShadow: `0 4px 16px ${statusColor}66`,
          }}
        >
          {avatarInitials}
        </Avatar>

        <Typography variant="h6" fontWeight={700} color="#fff">
          {member.name}
        </Typography>

        <Box sx={{ mt: 1 }}>
          <Chip
            label={statusLabel}
            size="small"
            sx={{
              bgcolor: statusBg,
              color: statusColor,
              fontWeight: 700,
              fontSize: 12,
              border: `1px solid ${statusColor}44`,
            }}
          />
        </Box>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {/* Remaining days banner */}
        <Box
          sx={{
            mb: 2.5,
            p: 1.5,
            borderRadius: 2,
            bgcolor: statusBg,
            border: `1px solid ${statusColor}33`,
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" fontWeight={800} color={statusColor}>
            {isExpired ? Math.abs(remaining) : remaining}
          </Typography>
          <Typography variant="caption" color={statusColor} fontWeight={500}>
            {isExpired ? `days expired` : remaining === 0 ? 'expires today' : `days remaining`}
          </Typography>
        </Box>

        <Divider sx={{ mb: 1 }} />

        {/* Details */}
        <InfoRow
          icon={<RupeeIcon fontSize="small" />}
          label="Amount Paid"
          value={`₹${(member.amount ?? 0).toLocaleString('en-IN')}`}
          valueColor="success.main"
        />
        <Divider />
        <InfoRow icon={<PhoneIcon fontSize="small" />} label="Phone" value={member.phone} />
        <Divider />
        <InfoRow
          icon={<EmailIcon fontSize="small" />}
          label="Email"
          value={member.email || '—'}
        />
        <Divider />
        <InfoRow
          icon={<PackageIcon fontSize="small" />}
          label="Package"
          value={`${PACKAGE_LABELS[member.packageType]} (${member.packageDurationDays} days)`}
        />
        <Divider />
        <InfoRow
          icon={<TimeIcon fontSize="small" />}
          label="Joining Time"
          value={member.joiningTime}
        />
        <Divider />
        <InfoRow
          icon={<CalendarIcon fontSize="small" />}
          label="Joining Date"
          value={format(new Date(member.joiningDate), 'dd MMM yyyy')}
        />
        <Divider />
        <InfoRow
          icon={<TimerIcon fontSize="small" />}
          label="Expiry Date"
          value={format(new Date(member.expiryDate), 'dd MMM yyyy')}
          valueColor={statusColor}
        />

        {member.notes && (
          <>
            <Divider />
            <Box sx={{ py: 1.2 }}>
              <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                Notes
              </Typography>
              <Typography variant="body2" color="text.primary" sx={{ whiteSpace: 'pre-wrap' }}>
                {member.notes}
              </Typography>
            </Box>
          </>
        )}

        {/* Member since */}
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.disabled">
            Member since {format(new Date(member.createdAt), 'dd MMM yyyy')}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" color="inherit" fullWidth>
          Close
        </Button>
        <Button
          onClick={() => { onClose(); onEdit(member); }}
          variant="contained"
          startIcon={<EditIcon />}
          fullWidth
          sx={{
            background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
            '&:hover': { background: 'linear-gradient(135deg, #0f3460, #1a1a2e)' },
          }}
        >
          Edit Member
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MemberDetailDialog;
