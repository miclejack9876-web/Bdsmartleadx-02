import { getSupabaseClient } from '../lib/supabase/client';
import { TaskSubmission } from '../types/offers';
import { WalletService } from './walletService';

export class SubmissionsService {
  private static client = getSupabaseClient();
  private static LOCAL_SUBMISSIONS_KEY = 'bdsmartleadx_local_submissions_v1';

  /**
   * Submit a task with 4 mandatory screenshots
   */
  static async submitTask(data: {
    offerId: string;
    offerTitle?: string;
    userId: string;
    userEmail?: string;
    userName?: string;
    screenshot1Url: string;
    screenshot2Url: string;
    screenshot3Url: string;
    screenshot4Url: string;
    notes?: string;
    payoutAmount?: number;
  }): Promise<TaskSubmission> {
    if (
      !data.screenshot1Url ||
      !data.screenshot2Url ||
      !data.screenshot3Url ||
      !data.screenshot4Url
    ) {
      throw new Error('All 4 screenshot submissions are mandatory.');
    }

    const payload = {
      offer_id: data.offerId,
      user_id: data.userId,
      screenshot_1_url: data.screenshot1Url,
      screenshot_2_url: data.screenshot2Url,
      screenshot_3_url: data.screenshot3Url,
      screenshot_4_url: data.screenshot4Url,
      notes: data.notes || '',
      status: 'pending',
      payout_amount: data.payoutAmount || 1.00,
    };

    try {
      const { data: dbRes, error } = await SubmissionsService.client
        .from('submissions')
        .insert(payload)
        .select()
        .single();

      if (!error && dbRes) {
        const newSub: TaskSubmission = {
          id: dbRes.id,
          offerId: dbRes.offer_id,
          offerTitle: data.offerTitle || 'Job Offer Task',
          userId: dbRes.user_id,
          userEmail: data.userEmail,
          userName: data.userName,
          screenshot1Url: dbRes.screenshot_1_url,
          screenshot2Url: dbRes.screenshot_2_url,
          screenshot3Url: dbRes.screenshot_3_url,
          screenshot4Url: dbRes.screenshot_4_url,
          notes: dbRes.notes,
          status: dbRes.status,
          payoutAmount: Number(dbRes.payout_amount) || 1.00,
          createdAt: dbRes.created_at,
          updatedAt: dbRes.updated_at,
        };

        // Sync to local storage
        SubmissionsService.saveToLocalStorage(newSub);
        return newSub;
      }
    } catch (err) {
      console.warn('[BdSmartLeadX-02] Supabase submission insert warning:', err);
    }

    // Local Storage Fallback
    const localSub: TaskSubmission = {
      id: `sub-local-${Date.now()}`,
      offerId: data.offerId,
      offerTitle: data.offerTitle || 'Job Offer Task',
      userId: data.userId,
      userEmail: data.userEmail,
      userName: data.userName,
      screenshot1Url: data.screenshot1Url,
      screenshot2Url: data.screenshot2Url,
      screenshot3Url: data.screenshot3Url,
      screenshot4Url: data.screenshot4Url,
      notes: data.notes,
      status: 'pending',
      payoutAmount: data.payoutAmount || 1.00,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    SubmissionsService.saveToLocalStorage(localSub);
    return localSub;
  }

  /**
   * Fetch submissions for offer owners / admins to review
   */
  static async fetchSubmissions(filter?: {
    offerOwnerId?: string;
    workerUserId?: string;
    status?: 'all' | 'pending' | 'approved' | 'rejected';
  }): Promise<TaskSubmission[]> {
    let list: TaskSubmission[] = [];

    try {
      let query = SubmissionsService.client
        .from('submissions')
        .select('*, offers(title, created_by), profiles(email, full_name)')
        .order('created_at', { ascending: false });

      if (filter?.workerUserId) {
        query = query.eq('user_id', filter.workerUserId);
      }
      if (filter?.status && filter.status !== 'all') {
        query = query.eq('status', filter.status);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        list = data.map((item: any) => ({
          id: item.id,
          offerId: item.offer_id,
          offerTitle: item.offers?.title || 'Sign-Up Task',
          userId: item.user_id,
          userEmail: item.profiles?.email || 'worker@example.com',
          userName: item.profiles?.full_name || 'Worker',
          screenshot1Url: item.screenshot_1_url || '',
          screenshot2Url: item.screenshot_2_url || '',
          screenshot3Url: item.screenshot_3_url || '',
          screenshot4Url: item.screenshot_4_url || '',
          notes: item.notes || '',
          status: item.status || 'pending',
          rejectionReason: item.rejection_reason || '',
          payoutAmount: Number(item.payout_amount) || 1.00,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        }));
      }
    } catch (e) {
      console.warn('[BdSmartLeadX-02] Fetch submissions DB warning:', e);
    }

    // Merge/Fallback with local storage
    const localData = localStorage.getItem(SubmissionsService.LOCAL_SUBMISSIONS_KEY);
    if (localData) {
      const localList: TaskSubmission[] = JSON.parse(localData);
      // Combine avoiding duplicates
      const dbIds = new Set(list.map((s) => s.id));
      localList.forEach((s) => {
        if (!dbIds.has(s.id)) {
          if (!filter?.workerUserId || s.userId === filter.workerUserId) {
            if (!filter?.status || filter.status === 'all' || s.status === filter.status) {
              list.push(s);
            }
          }
        }
      });
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Approve a task submission & reward worker with +1 Surfing Balance
   */
  static async approveSubmission(
    submissionId: string,
    workerUserId: string,
    reviewerId: string,
    payoutAmount: number = 1.00
  ): Promise<boolean> {
    try {
      // 1. Try DB RPC or Update
      const { error } = await SubmissionsService.client
        .from('submissions')
        .update({
          status: 'approved',
          updated_at: new Date().toISOString(),
        })
        .eq('id', submissionId);

      if (error) {
        console.warn('[BdSmartLeadX-02] Approve submission DB update error:', error.message);
      }

      // 2. Reward worker with +1 Surfing Balance
      await WalletService.creditSurfingBalance(workerUserId, payoutAmount, submissionId);

      // 3. Update local storage record if present
      SubmissionsService.updateLocalStatus(submissionId, 'approved');
      return true;
    } catch (err) {
      console.error('[BdSmartLeadX-02] Error approving submission:', err);
      // Fallback: Reward worker locally
      await WalletService.creditSurfingBalance(workerUserId, payoutAmount, submissionId);
      SubmissionsService.updateLocalStatus(submissionId, 'approved');
      return true;
    }
  }

  /**
   * Reject a task submission
   */
  static async rejectSubmission(
    submissionId: string,
    rejectionReason?: string
  ): Promise<boolean> {
    try {
      const { error } = await SubmissionsService.client
        .from('submissions')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason || 'Requirements not met in mandatory screenshots',
          updated_at: new Date().toISOString(),
        })
        .eq('id', submissionId);

      if (error) {
        console.warn('[BdSmartLeadX-02] Reject submission DB update error:', error.message);
      }

      SubmissionsService.updateLocalStatus(submissionId, 'rejected', rejectionReason);
      return true;
    } catch (err) {
      console.error('[BdSmartLeadX-02] Error rejecting submission:', err);
      SubmissionsService.updateLocalStatus(submissionId, 'rejected', rejectionReason);
      return true;
    }
  }

  private static saveToLocalStorage(submission: TaskSubmission) {
    const raw = localStorage.getItem(SubmissionsService.LOCAL_SUBMISSIONS_KEY);
    const list: TaskSubmission[] = raw ? JSON.parse(raw) : [];
    list.unshift(submission);
    localStorage.setItem(SubmissionsService.LOCAL_SUBMISSIONS_KEY, JSON.stringify(list));
  }

  private static updateLocalStatus(
    submissionId: string,
    status: 'approved' | 'rejected',
    reason?: string
  ) {
    const raw = localStorage.getItem(SubmissionsService.LOCAL_SUBMISSIONS_KEY);
    if (!raw) return;
    const list: TaskSubmission[] = JSON.parse(raw);
    const updated = list.map((item) => {
      if (item.id === submissionId) {
        return {
          ...item,
          status,
          rejectionReason: reason || item.rejectionReason,
          updatedAt: new Date().toISOString(),
        };
      }
      return item;
    });
    localStorage.setItem(SubmissionsService.LOCAL_SUBMISSIONS_KEY, JSON.stringify(updated));
  }
}
