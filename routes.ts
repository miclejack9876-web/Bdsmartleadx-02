import { UserRole } from '../types/auth';

export interface RouteDefinition {
  path: string;
  title: string;
  subtitle: string;
  requiredRole?: UserRole;
  isProtected: boolean;
}

export const APP_ROUTES: Record<string, RouteDefinition> = {
  '/': {
    path: '/',
    title: 'BdSmartLeadX-02 Architecture Gateway',
    subtitle: 'Production-ready architecture, Supabase client initialization & route protection',
    isProtected: false,
  },
  '/overview': {
    path: '/overview',
    title: 'User Overview Dashboard',
    subtitle: 'System performance metrics and activity feeds',
    requiredRole: 'user',
    isProtected: true,
  },
  '/dashboard': {
    path: '/dashboard',
    title: 'Lead Intelligence Dashboard',
    subtitle: 'System overview & real-time metric streams',
    requiredRole: 'user',
    isProtected: true,
  },
  '/feed': {
    path: '/feed',
    title: 'Global Job Feed',
    subtitle: 'Explore active sign-up exchange campaigns & leads',
    requiredRole: 'user',
    isProtected: true,
  },
  '/offers': {
    path: '/offers',
    title: 'Post & Manage Offers',
    subtitle: 'Create, monitor, and configure lead exchange offers',
    requiredRole: 'user',
    isProtected: true,
  },
  '/submissions': {
    path: '/submissions',
    title: 'Offer Submissions',
    subtitle: 'Review and verify submitted lead conversions',
    requiredRole: 'user',
    isProtected: true,
  },
  '/profile': {
    path: '/profile',
    title: 'Surfing Balance & Profile',
    subtitle: 'Manage financial wallet, balance, and earnings',
    requiredRole: 'user',
    isProtected: true,
  },
  '/leads': {
    path: '/leads',
    title: 'Lead Pipeline Architecture',
    subtitle: 'Lead records management with Supabase row level security',
    requiredRole: 'agent',
    isProtected: true,
  },
  '/analytics': {
    path: '/analytics',
    title: 'Performance & Conversion Analytics',
    subtitle: 'Managerial metrics and operational reports',
    requiredRole: 'manager',
    isProtected: true,
  },
  '/admin/dashboard': {
    path: '/admin/dashboard',
    title: 'Admin Command Center',
    subtitle: 'System health, global offer traffic, and administration',
    requiredRole: 'admin',
    isProtected: true,
  },
  '/admin/users': {
    path: '/admin/users',
    title: 'Admin User Management',
    subtitle: 'Role assignment, account activation, and RBAC control',
    requiredRole: 'admin',
    isProtected: true,
  },
  '/admin/offers': {
    path: '/admin/offers',
    title: 'Offer Moderation',
    subtitle: 'Approve, pause, or audit user-submitted campaigns',
    requiredRole: 'admin',
    isProtected: true,
  },
  '/admin/audit': {
    path: '/admin/audit',
    title: 'System Security Audit Logs',
    subtitle: 'Immutable record of security events and actions',
    requiredRole: 'admin',
    isProtected: true,
  },
  '/settings': {
    path: '/settings',
    title: 'Account & Preference Configuration',
    subtitle: 'User profile settings and system notifications',
    requiredRole: 'user',
    isProtected: true,
  },
  '/auth/signin': {
    path: '/auth/signin',
    title: 'Supabase Authentication',
    subtitle: 'Sign in to access BdSmartLeadX-02 architecture',
    isProtected: false,
  },
  '/auth/signup': {
    path: '/auth/signup',
    title: 'Account Registration',
    subtitle: 'Register new user account with Supabase',
    isProtected: false,
  },
};
