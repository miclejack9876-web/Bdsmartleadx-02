export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
export type LeadPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Lead {
  id: string;
  title: string;
  companyName: string | null;
  contactName: string;
  email: string | null;
  phone: string | null;
  status: LeadStatus;
  priority: LeadPriority;
  score: number;
  assignedTo: string | null;
  createdBy: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadFilter {
  status?: LeadStatus;
  priority?: LeadPriority;
  assignedTo?: string;
  searchQuery?: string;
  limit?: number;
  offset?: number;
}

export interface LeadActivity {
  id: string;
  leadId: string;
  performedBy: string;
  activityType: 'note' | 'status_change' | 'call' | 'email' | 'meeting';
  description: string;
  createdAt: string;
}
