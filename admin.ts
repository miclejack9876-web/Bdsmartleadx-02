import { UserRole, UserProfile, ApprovalStatus } from './auth';

export interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  approvedUsers: number;
  totalLeads: number;
  systemStatus: 'healthy' | 'degraded' | 'maintenance';
}

export interface UserManagementFilter {
  role?: UserRole;
  isActive?: boolean;
  approvalStatus?: ApprovalStatus | 'all';
  searchQuery?: string;
}

export interface RolePermission {
  role: UserRole;
  permissions: string[];
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  resource: string;
  details?: Record<string, unknown>;
  createdAt: string;
}
