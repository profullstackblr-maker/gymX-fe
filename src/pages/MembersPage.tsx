import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Snackbar,
  Alert,
  Fade,
} from '@mui/material';
import { Add as AddIcon, People as PeopleIcon } from '@mui/icons-material';
import { useMembers } from '../hooks/useMembers';
import MemberTable from '../components/MemberTable';
import MemberForm from '../components/MemberForm';
import type { Member, MemberFormData } from '../types';

const MembersPage: React.FC = () => {
  const { members, total, loading, error, fetchMembers, fetchStats, createMember, updateMember, deleteMember } =
    useMembers();

  const [formOpen, setFormOpen] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const currentFilters = useRef<{ search?: string; status?: string }>({});

  const doFetch = useCallback(
    (pg: number, rpp: number, filters?: { search?: string; status?: string }) => {
      const f = filters ?? currentFilters.current;
      fetchMembers({ ...f, page: pg + 1, limit: rpp });
    },
    [fetchMembers]
  );

  useEffect(() => {
    doFetch(0, rowsPerPage);
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleAddClick = () => {
    setEditMember(null);
    setFormOpen(true);
  };

  const handleEditClick = (member: Member) => {
    setEditMember(member);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditMember(null);
  };

  const handleFormSubmit = async (data: MemberFormData) => {
    setFormLoading(true);
    let result;

    if (editMember) {
      result = await updateMember(editMember._id, data);
    } else {
      result = await createMember(data);
    }

    setFormLoading(false);

    if (result.success) {
      showSnackbar(
        editMember ? 'Member updated successfully!' : 'Member added successfully!',
        'success'
      );
      handleFormClose();
      doFetch(page, rowsPerPage);
      fetchStats();
    } else {
      showSnackbar(result.message || 'An error occurred.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteMember(id);
    if (result.success) {
      showSnackbar('Member deleted successfully!', 'success');
      doFetch(page, rowsPerPage);
      fetchStats();
    } else {
      showSnackbar(result.message || 'Failed to delete member.', 'error');
    }
  };

  const handleSearch = useCallback(
    (search: string) => {
      currentFilters.current = { ...currentFilters.current, search };
      setPage(0);
      doFetch(0, rowsPerPage, currentFilters.current);
    },
    [doFetch, rowsPerPage]
  );

  const handleFilter = useCallback(
    (status: string) => {
      currentFilters.current = { ...currentFilters.current, status };
      setPage(0);
      doFetch(0, rowsPerPage, currentFilters.current);
    },
    [doFetch, rowsPerPage]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      doFetch(newPage, rowsPerPage);
    },
    [doFetch, rowsPerPage]
  );

  const handleRowsPerPageChange = useCallback(
    (newRowsPerPage: number) => {
      setRowsPerPage(newRowsPerPage);
      setPage(0);
      doFetch(0, newRowsPerPage);
    },
    [doFetch]
  );

  return (
    <Fade in>
      <Box>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 3,
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <PeopleIcon sx={{ color: 'primary.main', fontSize: 28 }} />
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Members
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage all gym members
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
            sx={{
              background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
              '&:hover': { background: 'linear-gradient(135deg, #0f3460, #1a1a2e)' },
              px: 3,
              py: 1,
            }}
          >
            Add Member
          </Button>
        </Box>

        {/* Table */}
        <MemberTable
          members={members}
          total={total}
          page={page}
          rowsPerPage={rowsPerPage}
          loading={loading}
          error={error}
          onEdit={handleEditClick}
          onDelete={handleDelete}
          onSearch={handleSearch}
          onFilter={handleFilter}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />

        {/* Form Dialog */}
        <MemberForm
          open={formOpen}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
          editMember={editMember}
          loading={formLoading}
        />

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            sx={{ borderRadius: 2, fontWeight: 500 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Fade>
  );
};

export default MembersPage;
