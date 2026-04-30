import React, { useState } from 'react';
import MemberDetailDialog from './MemberDetailDialog';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Skeleton,
  useMediaQuery,
  useTheme,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FileDownload as ExportIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { format, differenceInDays } from 'date-fns';
import type { Member } from '../types';
import { PACKAGE_LABELS } from '../types';

type SortField = 'name' | 'expiryDate' | 'joiningDate' | 'remainingDays';
type SortOrder = 'asc' | 'desc';
type StatusFilter = 'all' | 'active' | 'expired';

interface MemberTableProps {
  members: Member[];
  total: number;
  page: number;
  rowsPerPage: number;
  loading: boolean;
  error: string | null;
  onEdit: (member: Member) => void;
  onDelete: (id: string) => Promise<void>;
  onSearch: (search: string) => void;
  onFilter: (status: string) => void;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
}

const getRemainingDays = (expiryDate: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  return differenceInDays(expiry, today);
};

const getRowStyle = (remainingDays: number) => {
  if (remainingDays < 0) return { bgcolor: '#fff5f5', borderLeft: '4px solid #e74c3c' };
  if (remainingDays <= 5) return { bgcolor: '#fffbf0', borderLeft: '4px solid #f39c12' };
  return {};
};

const getStatusChip = (remainingDays: number) => {
  if (remainingDays < 0)
    return <Chip label="Expired" size="small" sx={{ bgcolor: '#e74c3c', color: '#fff', fontWeight: 700 }} />;
  if (remainingDays <= 5)
    return <Chip label="Expiring Soon" size="small" sx={{ bgcolor: '#f39c12', color: '#fff', fontWeight: 700 }} />;
  return <Chip label="Active" size="small" sx={{ bgcolor: '#2ecc71', color: '#fff', fontWeight: 700 }} />;
};

const exportToCSV = (members: Member[]) => {
  const headers = ['Name', 'Phone', 'Email', 'Package', 'Amount (₹)', 'Joining Date', 'Expiry Date', 'Remaining Days', 'Status', 'Joining Time'];
  const rows = members.map((m) => {
    const remaining = getRemainingDays(m.expiryDate);
    const status = remaining < 0 ? 'Expired' : remaining <= 5 ? 'Expiring Soon' : 'Active';
    return [
      m.name,
      m.phone,
      m.email || '',
      PACKAGE_LABELS[m.packageType],
      String(m.amount ?? 0),
      format(new Date(m.joiningDate), 'dd/MM/yyyy'),
      format(new Date(m.expiryDate), 'dd/MM/yyyy'),
      remaining < 0 ? '0' : remaining.toString(),
      status,
      m.joiningTime,
    ];
  });

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `gymx-members-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

const MemberTable: React.FC<MemberTableProps> = ({
  members,
  total,
  page,
  rowsPerPage,
  loading,
  error,
  onEdit,
  onDelete,
  onSearch,
  onFilter,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortField, setSortField] = useState<SortField>('expiryDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [detailMember, setDetailMember] = useState<Member | null>(null);

  const handleSearch = (value: string) => {
    setSearch(value);
    onSearch(value);
  };

  const handleFilter = (_: React.MouseEvent<HTMLElement>, value: StatusFilter | null) => {
    const newFilter = value || 'all';
    setStatusFilter(newFilter);
    onFilter(newFilter === 'all' ? '' : newFilter);
  };

  const handleSort = (field: SortField) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  // Sort members: expired first, then by chosen field
  const sortedMembers = [...members].sort((a, b) => {
    const aRemaining = getRemainingDays(a.expiryDate);
    const bRemaining = getRemainingDays(b.expiryDate);

    // Expired always at top
    if (aRemaining < 0 && bRemaining >= 0) return -1;
    if (bRemaining < 0 && aRemaining >= 0) return 1;

    if (sortField === 'remainingDays') {
      return sortOrder === 'asc' ? aRemaining - bRemaining : bRemaining - aRemaining;
    }
    if (sortField === 'name') {
      return sortOrder === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    if (sortField === 'expiryDate') {
      const diff = new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
      return sortOrder === 'asc' ? diff : -diff;
    }
    if (sortField === 'joiningDate') {
      const diff = new Date(a.joiningDate).getTime() - new Date(b.joiningDate).getTime();
      return sortOrder === 'asc' ? diff : -diff;
    }
    return 0;
  });

  const handleDeleteConfirm = async () => {
    if (!deleteDialogId) return;
    setDeleteLoading(true);
    await onDelete(deleteDialogId);
    setDeleteLoading(false);
    setDeleteDialogId(null);
  };

  const columns = [
    { id: 'name' as SortField, label: 'Name', sortable: true },
    { id: null, label: 'Phone', sortable: false },
    { id: null, label: 'Package', sortable: false },
    { id: null, label: 'Amount', sortable: false },
    { id: 'joiningDate' as SortField, label: 'Joined', sortable: true },
    { id: 'expiryDate' as SortField, label: 'Expires', sortable: true },
    { id: 'remainingDays' as SortField, label: 'Days Left', sortable: true },
    { id: null, label: 'Status', sortable: false },
    { id: null, label: 'Actions', sortable: false },
  ];

  return (
    <Box>
      {/* Toolbar */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          mb: 2,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <TextField
          size="small"
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          sx={{ minWidth: 260, flex: 1, maxWidth: 360 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
          <ToggleButtonGroup
            size="small"
            value={statusFilter}
            exclusive
            onChange={handleFilter}
            sx={{ '& .MuiToggleButton-root': { textTransform: 'none', px: 2 } }}
          >
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="active">Active</ToggleButton>
            <ToggleButton value="expired">Expired</ToggleButton>
          </ToggleButtonGroup>

          <Button
            variant="outlined"
            size="small"
            startIcon={<ExportIcon />}
            onClick={() => exportToCSV(sortedMembers)}
            disabled={members.length === 0}
          >
            Export CSV
          </Button>
        </Box>
      </Box>

      {/* Legend */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#e74c3c' }} />
          <Typography variant="caption" color="text.secondary">Expired</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#f39c12' }} />
          <Typography variant="caption" color="text.secondary">Expiring within 5 days</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#2ecc71' }} />
          <Typography variant="caption" color="text.secondary">Active</Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <Table size={isMobile ? 'small' : 'medium'} stickyHeader>
          <TableHead>
            <TableRow sx={{ '& th': { bgcolor: '#1a1a2e', color: '#fff', fontWeight: 700 } }}>
              {columns.map((col, i) => (
                <TableCell
                  key={i}
                  sx={{ bgcolor: '#1a1a2e', color: '#fff', fontWeight: 700, whiteSpace: 'nowrap' }}
                >
                  {col.sortable && col.id ? (
                    <TableSortLabel
                      active={sortField === col.id}
                      direction={sortField === col.id ? sortOrder : 'asc'}
                      onClick={() => handleSort(col.id as SortField)}
                      sx={{
                        color: '#fff !important',
                        '& .MuiTableSortLabel-icon': { color: '#fff !important' },
                        '&.Mui-active': { color: '#e94560 !important' },
                      }}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton variant="text" width="80%" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : sortedMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <FilterIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                    <Typography color="text.secondary">No members found</Typography>
                    {search && (
                      <Typography variant="caption" color="text.disabled">
                        Try adjusting your search or filter
                      </Typography>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              sortedMembers.map((member) => {
                const remaining = getRemainingDays(member.expiryDate);
                const rowStyle = getRowStyle(remaining);
                return (
                  <TableRow
                    key={member._id}
                    onClick={() => setDetailMember(member)}
                    sx={{
                      ...rowStyle,
                      '&:hover': { bgcolor: 'action.hover', cursor: 'pointer' },
                      transition: 'background-color 0.15s',
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {member.name}
                      </Typography>
                      {member.email && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {member.email}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{member.phone}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={PACKAGE_LABELS[member.packageType]}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600, borderColor: '#1a1a2e', color: '#1a1a2e' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="success.dark">
                        ₹{(member.amount ?? 0).toLocaleString('en-IN')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap>
                        {format(new Date(member.joiningDate), 'dd MMM yyyy')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap fontWeight={500}>
                        {format(new Date(member.expiryDate), 'dd MMM yyyy')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color={remaining < 0 ? 'error.main' : remaining <= 5 ? 'warning.main' : 'success.main'}
                      >
                        {remaining < 0 ? 'Expired' : `${remaining}d`}
                      </Typography>
                    </TableCell>
                    <TableCell>{getStatusChip(remaining)}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Edit member">
                          <IconButton size="small" color="primary" onClick={() => onEdit(member)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete member">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteDialogId(member._id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {!loading && total > 0 && (
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, newPage) => onPageChange(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} of ${count} members`}
          sx={{ borderTop: '1px solid', borderColor: 'divider' }}
        />
      )}

      {/* Member Detail Dialog */}
      <MemberDetailDialog
        open={!!detailMember}
        member={detailMember}
        onClose={() => setDetailMember(null)}
        onEdit={(member) => { setDetailMember(null); onEdit(member); }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteDialogId}
        onClose={() => !deleteLoading && setDeleteDialogId(null)}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle fontWeight={700}>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this member? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setDeleteDialogId(null)}
            variant="outlined"
            disabled={deleteLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MemberTable;
