import { getSupabaseClient } from '../lib/supabase/client';
import { UserWallet } from '../types/offers';

export class WalletService {
  private static client = getSupabaseClient();
  private static LOCAL_WALLET_PREFIX = 'bdsmartleadx_wallet_';

  static async getUserWallet(userId: string): Promise<UserWallet> {
    try {
      const { data, error } = await WalletService.client
        .from('user_wallets')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!error && data) {
        return {
          id: data.id,
          userId: data.user_id,
          balance: Number(data.balance) || 0,
          pendingBalance: Number(data.pending_balance) || 0,
          totalEarned: Number(data.total_earned) || 0,
          totalWithdrawn: Number(data.total_withdrawn) || 0,
          currency: data.currency || 'USD',
        };
      }
    } catch (e) {
      console.warn('[BdSmartLeadX-02] Supabase wallet fetch error:', e);
    }

    // Local Storage fallback
    const key = `${WalletService.LOCAL_WALLET_PREFIX}${userId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }

    const defaultWallet: UserWallet = {
      id: `w-${userId.slice(0, 8)}`,
      userId,
      balance: 10.00,
      pendingBalance: 0.00,
      totalEarned: 10.00,
      totalWithdrawn: 0.00,
      currency: 'USD',
    };

    localStorage.setItem(key, JSON.stringify(defaultWallet));
    return defaultWallet;
  }

  static async creditSurfingBalance(userId: string, amount: number = 1.00, referenceId?: string): Promise<UserWallet> {
    const wallet = await WalletService.getUserWallet(userId);
    const newBalance = Number((wallet.balance + amount).toFixed(2));
    const newTotalEarned = Number((wallet.totalEarned + amount).toFixed(2));

    try {
      // Attempt DB Update
      const { data, error } = await WalletService.client
        .from('user_wallets')
        .upsert({
          user_id: userId,
          balance: newBalance,
          total_earned: newTotalEarned,
          currency: 'USD',
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (!error && data) {
        // Record transaction
        await WalletService.client.from('wallet_transactions').insert({
          wallet_id: data.id,
          user_id: userId,
          type: 'credit',
          amount,
          balance_after: newBalance,
          reference_id: referenceId,
          description: `Task Approval Reward (+${amount.toFixed(2)} Surfing Balance)`,
          status: 'completed',
        });

        return {
          id: data.id,
          userId: data.user_id,
          balance: Number(data.balance),
          pendingBalance: Number(data.pending_balance) || 0,
          totalEarned: Number(data.total_earned),
          totalWithdrawn: Number(data.total_withdrawn) || 0,
          currency: data.currency || 'USD',
        };
      }
    } catch (e) {
      console.error('[BdSmartLeadX-02] Credit wallet error on DB:', e);
    }

    // Local Storage Fallback
    const updatedWallet: UserWallet = {
      ...wallet,
      balance: newBalance,
      totalEarned: newTotalEarned,
    };

    const key = `${WalletService.LOCAL_WALLET_PREFIX}${userId}`;
    localStorage.setItem(key, JSON.stringify(updatedWallet));
    return updatedWallet;
  }
}
