import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
  InputAdornment,
  Typography,
  Box,
  Chip,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Schedule as TimeIcon,
  Close as CloseIcon,
  FitnessCenter as PackageIcon,
  CurrencyRupee as RupeeIcon,
} from '@mui/icons-material';
import { format, addDays } from 'date-fns';
import type { Member, MemberFormData, PackageType } from '../types';
import { PACKAGE_OPTIONS, JOINING_TIME_OPTIONS, PACKAGE_FEES } from '../types';

interface MemberFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: MemberFormData) => Promise<void>;
  editMember?: Member | null;
  loading?: boolean;
}

const defaultForm: MemberFormData = {
  name: '',
  phone: '',
  email: '',
  joiningDate: format(new Date(), 'yyyy-MM-dd'),
  packageType: '',
  joiningTime: 'morning',
  amount: '',
  notes: '',
};

const MemberForm: React.FC<MemberFormProps> = ({
  open,
  onClose,
  onSubmit,
  editMember,
  loading = false,
}) => {
  const [form, setForm] = useState<MemberFormData>(defaultForm);
  const [errors, setErrors] = useState<Partial<MemberFormData>>({});

  useEffect(() => {
    if (editMember) {
      setForm({
        name: editMember.name,
        phone: editMember.phone,
        email: editMember.email || '',
        joiningDate: format(new Date(editMember.joiningDate), 'yyyy-MM-dd'),
        packageType: editMember.packageType,
        joiningTime: editMember.joiningTime,
        amount: editMember.amount !== undefined ? String(editMember.amount) : '',
        notes: editMember.notes || '',
      });
    } else {
      setForm(defaultForm);
    }
    setErrors({});
  }, [editMember, open]);

  const validate = (): boolean => {
    const newErrors: Partial<MemberFormData> = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^[0-9]{10}$/.test(form.phone.trim()))
      newErrors.phone = 'Enter a valid 10-digit phone number';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = 'Enter a valid email address';
    if (!form.joiningDate) newErrors.joiningDate = 'Joining date is required';
    if (!form.packageType) newErrors.packageType = 'Package type is required' as PackageType;
    if (!form.joiningTime) newErrors.joiningTime = 'Joining time is required';
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) < 0)
      newErrors.amount = 'Enter a valid amount';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof MemberFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      // Auto-fill amount when package changes (only if amount not manually edited)
      if (field === 'packageType' && value in PACKAGE_FEES) {
        updated.amount = String(PACKAGE_FEES[value as PackageType]);
      }
      return updated;
    });
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await onSubmit(form);
  };

  // Preview expiry date
  const selectedPackage = PACKAGE_OPTIONS.find((p) => p.value === form.packageType);
  const expiryPreview =
    form.joiningDate && selectedPackage
      ? format(addDays(new Date(form.joiningDate), selectedPackage.days), 'dd MMM yyyy')
      : null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ pb: 1, pr: 6 }}>
        <Typography variant="h6" fontWeight={700}>
          {editMember ? 'Edit Member' : 'Add New Member'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {editMember ? 'Update member information' : 'Fill in the details to register a new member'}
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 12, top: 12 }}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} sx={{ pt: 1 }}>
          {/* Full Name */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Full Name *"
              value={form.name}
              onChange={handleChange('name')}
              error={!!errors.name}
              helperText={errors.name}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Phone */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone Number *"
              value={form.phone}
              onChange={handleChange('phone')}
              error={!!errors.phone}
              helperText={errors.phone}
              inputProps={{ maxLength: 10 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Email */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email (Optional)"
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              error={!!errors.email}
              helperText={errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Joining Date */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Joining Date *"
              type="date"
              value={form.joiningDate}
              onChange={handleChange('joiningDate')}
              error={!!errors.joiningDate}
              helperText={errors.joiningDate}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Package Type */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Package Type *"
              value={form.packageType}
              onChange={handleChange('packageType')}
              error={!!errors.packageType}
              helperText={errors.packageType}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PackageIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            >
              {PACKAGE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Amount */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Amount Paid (₹) *"
              type="number"
              value={form.amount}
              onChange={handleChange('amount')}
              error={!!errors.amount}
              helperText={errors.amount || 'Auto-filled based on package'}
              inputProps={{ min: 0 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <RupeeIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Joining Time */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Joining Time *"
              value={form.joiningTime}
              onChange={handleChange('joiningTime')}
              error={!!errors.joiningTime}
              helperText={errors.joiningTime}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TimeIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            >
              {JOINING_TIME_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Expiry Preview */}
          {expiryPreview && (
            <Grid item xs={12} sm={6}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: 'success.light',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  height: '56px',
                }}
              >
                <Typography variant="body2" color="success.dark" fontWeight={500}>
                  Expiry Date:
                </Typography>
                <Chip
                  label={expiryPreview}
                  size="small"
                  color="success"
                  sx={{ fontWeight: 700 }}
                />
              </Box>
            </Grid>
          )}

          {/* Notes */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes (Optional)"
              multiline
              rows={2}
              value={form.notes}
              onChange={handleChange('notes')}
              placeholder="Any additional information about the member..."
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" color="inherit" disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{ minWidth: 120 }}
        >
          {loading ? 'Saving...' : editMember ? 'Update Member' : 'Add Member'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MemberForm;
