import { useState, useCallback } from 'react';
import { Lead, LeadFilter } from '../types/leads';
import { LeadsService } from '../services/leadsService';

export function useLead() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(async (filter?: LeadFilter) => {
    setLoading(true);
    setError(null);
    try {
      const data = await LeadsService.fetchLeads(filter);
      setLeads(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  }, []);

  const createLead = useCallback(async (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    try {
      const newLead = await LeadsService.createLead(leadData);
      if (newLead) {
        setLeads((prev) => [newLead, ...prev]);
      }
      return newLead;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create lead');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLead = useCallback(async (id: string, updates: Partial<Lead>) => {
    try {
      const success = await LeadsService.updateLead(id, updates);
      if (success) {
        setLeads((prev) =>
          prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
        );
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update lead');
      return false;
    }
  }, []);

  const deleteLead = useCallback(async (id: string) => {
    try {
      const success = await LeadsService.deleteLead(id);
      if (success) {
        setLeads((prev) => prev.filter((item) => item.id !== id));
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete lead');
      return false;
    }
  }, []);

  return {
    leads,
    loading,
    error,
    fetchLeads,
    createLead,
    updateLead,
    deleteLead,
  };
}
