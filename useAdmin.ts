import { useState, useCallback } from 'react';
import { UserProfile, UserRole } from './auth';
import { SystemMetrics, AuditLogEntry, UserManagementFilter } from './admin';
import { AdminService } from './adminService';

export function useAdmin() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadMetrics = useCallback(async () => {
    try {
      const data = await AdminService.fetchSystemMetrics();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    }
  }, []);

  const loadUsers = useCallback(async (filter?: UserManagementFilter) => {
    setLoading(true);
    try {
      const data = await AdminService.listUsers(filter);
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  const changeRole = useCallback(async (userId: string, newRole: UserRole) => {
    const success = await AdminService.updateUserRole(userId, newRole);
    if (success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    }
    return success;
  }, []);

  const toggleUser = useCallback(async (userId: string, isActive: boolean) => {
    const success = await AdminService.toggleUserStatus(userId, isActive);
    if (success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isActive } : u))
      );
    }
    return success;
  }, []);

  const approveUser = useCallback(async (userId: string) => {
    const success = await AdminService.approveUser(userId);
    if (success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, approvalStatus: 'approved', isApproved: true } : u))
      );
      // reload metrics
      AdminService.fetchSystemMetrics().then((m) => setMetrics(m)).catch(() => {});
    }
    return success;
  }, []);

  const setApprovalStatus = useCallback(async (userId: string, status: 'pending' | 'approved' | 'rejected') => {
    const success = await AdminService.setUserApprovalStatus(userId, status);
    if (success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, approvalStatus: status, isApproved: status === 'approved' } : u))
      );
      AdminService.fetchSystemMetrics().then((m) => setMetrics(m)).catch(() => {});
    }
    return success;
  }, []);

  const loadAuditLogs = useCallback(async () => {
    const logs = await AdminService.fetchAuditLogs();
    setAuditLogs(logs);
  }, []);

  return {
    metrics,
    users,
    auditLogs,
    loading,
    error,
    loadMetrics,
    loadUsers,
    approveUser,
    setApprovalStatus,
    changeRole,
    toggleUser,
    loadAuditLogs,
  };
}
