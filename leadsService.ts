import { getSupabaseClient } from '../lib/supabase/client';
import { Lead, LeadFilter, LeadActivity } from '../types/leads';

export class LeadsService {
  private static client = getSupabaseClient();

  static async fetchLeads(filter?: LeadFilter): Promise<Lead[]> {
    let query = LeadsService.client.from('leads').select('*');

    if (filter?.status) {
      query = query.eq('status', filter.status);
    }
    if (filter?.priority) {
      query = query.eq('priority', filter.priority);
    }
    if (filter?.assignedTo) {
      query = query.eq('assigned_to', filter.assignedTo);
    }
    if (filter?.searchQuery) {
      query = query.or(`contact_name.ilike.%${filter.searchQuery}%,company_name.ilike.%${filter.searchQuery}%,title.ilike.%${filter.searchQuery}%`);
    }

    if (filter?.limit) {
      query = query.limit(filter.limit);
    }
    if (filter?.offset) {
      query = query.range(filter.offset, filter.offset + (filter.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[BdSmartLeadX-02] Fetch leads error:', error.message);
      return [];
    }

    return (data || []).map((row) => ({
      id: row.id,
      title: row.title,
      companyName: row.company_name || null,
      contactName: row.contact_name,
      email: row.email || null,
      phone: row.phone || null,
      status: row.status,
      priority: row.priority,
      score: row.score || 0,
      assignedTo: row.assigned_to || null,
      createdBy: row.created_by,
      notes: row.notes || null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  static async createLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead | null> {
    const { data, error } = await LeadsService.client
      .from('leads')
      .insert([
        {
          title: leadData.title,
          company_name: leadData.companyName,
          contact_name: leadData.contactName,
          email: leadData.email,
          phone: leadData.phone,
          status: leadData.status,
          priority: leadData.priority,
          score: leadData.score,
          assigned_to: leadData.assignedTo,
          created_by: leadData.createdBy,
          notes: leadData.notes,
        },
      ])
      .select()
      .single();

    if (error || !data) {
      console.error('[BdSmartLeadX-02] Create lead error:', error?.message);
      return null;
    }

    return {
      id: data.id,
      title: data.title,
      companyName: data.company_name,
      contactName: data.contact_name,
      email: data.email,
      phone: data.phone,
      status: data.status,
      priority: data.priority,
      score: data.score,
      assignedTo: data.assigned_to,
      createdBy: data.created_by,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  static async updateLead(id: string, updates: Partial<Lead>): Promise<boolean> {
    const payload: Record<string, unknown> = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.companyName !== undefined) payload.company_name = updates.companyName;
    if (updates.contactName !== undefined) payload.contact_name = updates.contactName;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.priority !== undefined) payload.priority = updates.priority;
    if (updates.score !== undefined) payload.score = updates.score;
    if (updates.assignedTo !== undefined) payload.assigned_to = updates.assignedTo;
    if (updates.notes !== undefined) payload.notes = updates.notes;

    const { error } = await LeadsService.client
      .from('leads')
      .update(payload)
      .eq('id', id);

    if (error) {
      console.error('[BdSmartLeadX-02] Update lead error:', error.message);
      return false;
    }

    return true;
  }

  static async deleteLead(id: string): Promise<boolean> {
    const { error } = await LeadsService.client.from('leads').delete().eq('id', id);
    if (error) {
      console.error('[BdSmartLeadX-02] Delete lead error:', error.message);
      return false;
    }
    return true;
  }

  static async fetchActivities(leadId: string): Promise<LeadActivity[]> {
    const { data, error } = await LeadsService.client
      .from('lead_activities')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[BdSmartLeadX-02] Fetch lead activities error:', error.message);
      return [];
    }

    return (data || []).map((act) => ({
      id: act.id,
      leadId: act.lead_id,
      performedBy: act.performed_by,
      activityType: act.activity_type,
      description: act.description,
      createdAt: act.created_at,
    }));
  }
}
