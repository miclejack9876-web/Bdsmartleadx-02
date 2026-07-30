import { getSupabaseClient } from './supabaseClient';
import { UserProfile, UserRole } from './auth';
import { SystemMetrics, AuditLogEntry, UserManagementFilter } from './admin';

export class AdminService {
  private static client = getSupabaseClient();

  static async fetchSystemMetrics(): Promise<SystemMetrics> {
    const { count: usersCount } = await AdminService.client
      .from('profiles')
      .select('id', { count: 'exact', head: true });

    const { count: activeUsersCount } = await AdminService.client
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true);

    const { count: pendingUsersCount } = await AdminService.client
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .or('approval_status.eq.pending,is_approved.eq.false');

    const { count: approvedUsersCount } = await AdminService.client
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .or('approval_status.eq.approved,is_approved.eq.true');

    const { count: leadsCount } = await AdminService.client
      .from('leads')
      .select('id', { count: 'exact', head: true });

    return {
      totalUsers: usersCount || 0,
      activeUsers: activeUsersCount || 0,
      pendingUsers: pendingUsersCount || 0,
      approvedUsers: approvedUsersCount || 0,
      totalLeads: leadsCount || 0,
      systemStatus: 'healthy',
    };
  }

  static async listUsers(filter?: UserManagementFilter): Promise<UserProfile[]> {
    let query = AdminService.client.from('profiles').select('*');

    if (filter?.role) {
      query = query.eq('role', filter.role);
    }
    if (filter?.isActive !== undefined) {
      query = query.eq('is_active', filter.isActive);
    }
    if (filter?.approvalStatus && filter.approvalStatus !== 'all') {
      if (filter.approvalStatus === 'pending') {
        query = query.or('approval_status.eq.pending,is_approved.eq.false');
      } else if (filter.approvalStatus === 'approved') {
        query = query.or('approval_status.eq.approved,is_approved.eq.true');
      } else {
        query = query.eq('approval_status', filter.approvalStatus);
      }
    }
    if (filter?.searchQuery) {
      query = query.or(`full_name.ilike.%${filter.searchQuery}%,email.ilike.%${filter.searchQuery}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[BdSmartLeadX-02] Admin list users error:', error.message);
      return [];
    }

    return (data || []).map((user) => {
      const approvalStatus = (user.approval_status as any) || (user.is_approved ? 'approved' : 'pending');
      const isApproved = user.is_approved ?? (approvalStatus === 'approved');

      return {
        id: user.id,
        email: user.email,
        fullName: user.full_name || null,
        avatarUrl: user.avatar_url || null,
        role: user.role || 'user',
        department: user.department || null,
        isActive: user.is_active ?? true,
        approvalStatus,
        isApproved,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      };
    });
  }

  static async approveUser(userId: string): Promise<boolean> {
    const { error } = await AdminService.client
      .from('profiles')
      .update({
        approval_status: 'approved',
        is_approved: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('[BdSmartLeadX-02] Approve user error:', error.message);
      return false;
    }

    return true;
  }

  static async setUserApprovalStatus(
    userId: string,
    status: 'pending' | 'approved' | 'rejected'
  ): Promise<boolean> {
    const isApproved = status === 'approved';
    const { error } = await AdminService.client
      .from('profiles')
      .update({
        approval_status: status,
        is_approved: isApproved,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('[BdSmartLeadX-02] Set user approval status error:', error.message);
      return false;
    }

    return true;
  }

  static async updateUserRole(userId: string, newRole: UserRole): Promise<boolean> {
    const { error } = await AdminService.client
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      console.error('[BdSmartLeadX-02] Update user role error:', error.message);
      return false;
    }

    return true;
  }

  static async toggleUserStatus(userId: string, isActive: boolean): Promise<boolean> {
    const { error } = await AdminService.client
      .from('profiles')
      .update({ is_active: isActive })
      .eq('id', userId);

    if (error) {
      console.error('[BdSmartLeadX-02] Toggle user status error:', error.message);
      return false;
    }

    return true;
  }

  static async fetchAuditLogs(limit = 50): Promise<AuditLogEntry[]> {
    const { data, error } = await AdminService.client
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[BdSmartLeadX-02] Fetch audit logs error:', error.message);
      return [];
    }

    return (data || []).map((log) => ({
      id: log.id,
      userId: log.user_id,
      action: log.action,
      resource: log.resource,
      details: log.details || {},
      createdAt: log.created_at,
    }));
  }
            }
