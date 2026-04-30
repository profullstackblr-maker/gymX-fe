import { useState, useCallback } from 'react';
import { membersAPI } from '../services/api';
import type { Member, Stats } from '../types';

export const useMembers = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, expired: 0, expiringSoon: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(
    async (params?: { search?: string; status?: string; sortBy?: string; order?: string; page?: number; limit?: number }) => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await membersAPI.getAll(params);
        setMembers(data.data);
        setTotal(data.total ?? 0);
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to fetch members.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await membersAPI.getStats();
      setStats(data.data);
    } catch {
      // stats failure is non-critical
    }
  }, []);

  const createMember = useCallback(async (memberData: object) => {
    try {
      const { data } = await membersAPI.create(memberData);
      return { success: true, data: data.data };
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to create member.';
      return { success: false, message: msg };
    }
  }, []);

  const updateMember = useCallback(async (id: string, memberData: object) => {
    try {
      const { data } = await membersAPI.update(id, memberData);
      return { success: true, data: data.data };
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to update member.';
      return { success: false, message: msg };
    }
  }, []);

  const deleteMember = useCallback(async (id: string) => {
    try {
      await membersAPI.delete(id);
      return { success: true };
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to delete member.';
      return { success: false, message: msg };
    }
  }, []);

  return {
    members,
    total,
    stats,
    loading,
    error,
    fetchMembers,
    fetchStats,
    createMember,
    updateMember,
    deleteMember,
  };
};
