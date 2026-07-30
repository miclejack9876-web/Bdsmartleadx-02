import { getSupabaseClient } from '../lib/supabase/client';
import { Offer } from '../types/offers';

const INITIAL_DEMO_OFFERS: Offer[] = [
  {
    id: 'off-demo-101',
    title: 'Bkash / Nagad Wallet App Reg & KYC',
    description: 'Complete registration on Bkash/Nagad app with valid identity verification.',
    targetAppUrl: 'https://play.google.com/store/apps/details?id=com.bKash.customerapp',
    payout: 1.00,
    category: 'Finance & Wallet',
    status: 'active',
    createdBy: 'system-admin',
    creatorName: 'SmartLeadX Admin',
    maxCompletions: 200,
    currentCompletions: 48,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'off-demo-102',
    title: 'Crypto Trading App Signup Exchange',
    description: 'Sign up for the crypto app, verify email and submit registration screenshot.',
    targetAppUrl: 'https://crypto-app-signup.example.com',
    payout: 1.00,
    category: 'Crypto / Web3',
    status: 'active',
    createdBy: 'system-admin',
    creatorName: 'CryptoPartner BD',
    maxCompletions: 150,
    currentCompletions: 92,
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
  },
  {
    id: 'off-demo-103',
    title: 'E-commerce Shopping App Download & Register',
    description: 'Download Chrome Beta or browser, paste link, download app and register new account.',
    targetAppUrl: 'https://shopping-bd-app.example.com',
    payout: 1.00,
    category: 'E-Commerce',
    status: 'active',
    createdBy: 'system-admin',
    creatorName: 'ShopBD Digital',
    maxCompletions: 300,
    currentCompletions: 120,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'off-demo-104',
    title: 'SaaS Productivity Tool Free Account Creation',
    description: 'Create a free workspace on the productivity app and verify account email.',
    targetAppUrl: 'https://productivity-cloud.example.com',
    payout: 1.00,
    category: 'SaaS & Apps',
    status: 'active',
    createdBy: 'system-admin',
    creatorName: 'TechCorp LeadX',
    maxCompletions: 500,
    currentCompletions: 215,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

export class OffersService {
  private static client = getSupabaseClient();
  private static LOCAL_STORAGE_KEY = 'bdsmartleadx_local_offers_v1';
  private static LOCAL_SUBMISSIONS_KEY = 'bdsmartleadx_local_submissions_v1';

  /**
   * Fetches active offers for a worker user with the 24-hour cooldown rule:
   * "After a user successfully completes/submits a job, that specific job must disappear for that user for 24 hours, and reappear after 24 hours."
   */
  static async fetchActiveOffers(userId?: string): Promise<{ offers: Offer[]; recentSubmissionsOfferIds: string[] }> {
    let rawOffers: Offer[] = [];
    const submitted24hOfferIds = new Set<string>();

    try {
      // 1. Fetch offers from Supabase
      const { data, error } = await OffersService.client
        .from('offers')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        rawOffers = data.map((o: any) => ({
          id: o.id,
          title: o.title,
          description: o.description || '',
          targetAppUrl: o.target_app_url || '',
          payout: Number(o.payout) || 1.00,
          category: o.category || 'General',
          status: o.status || 'active',
          createdBy: o.created_by,
          maxCompletions: o.max_completions || 100,
          currentCompletions: o.current_completions || 0,
          createdAt: o.created_at,
          updatedAt: o.updated_at,
        }));
      } else {
        // Fallback to local storage / demo offers
        const localData = localStorage.getItem(OffersService.LOCAL_STORAGE_KEY);
        if (localData) {
          rawOffers = JSON.parse(localData);
        } else {
          rawOffers = INITIAL_DEMO_OFFERS;
          localStorage.setItem(OffersService.LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_OFFERS));
        }
      }

      // 2. Fetch submissions made by this user in the last 24 hours to enforce 24-hour cooldown
      if (userId) {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        // Check Supabase submissions table
        const { data: subData } = await OffersService.client
          .from('submissions')
          .select('offer_id, created_at')
          .eq('user_id', userId)
          .gte('created_at', twentyFourHoursAgo);

        if (subData) {
          subData.forEach((s: any) => {
            submitted24hOfferIds.add(s.offer_id);
          });
        }

        // Also check local storage submissions fallback
        const localSubs = localStorage.getItem(OffersService.LOCAL_SUBMISSIONS_KEY);
        if (localSubs) {
          const parsed = JSON.parse(localSubs);
          parsed.forEach((s: any) => {
            if (s.userId === userId && new Date(s.createdAt).getTime() >= Date.now() - 24 * 60 * 60 * 1000) {
              submitted24hOfferIds.add(s.offerId);
            }
          });
        }
      }

      // 3. Filter out offers completed/submitted in the last 24 hours
      const availableOffers = rawOffers.filter((offer) => !submitted24hOfferIds.has(offer.id));

      return {
        offers: availableOffers,
        recentSubmissionsOfferIds: Array.from(submitted24hOfferIds),
      };
    } catch (err) {
      console.error('[BdSmartLeadX-02] Error fetching active offers:', err);
      // Fallback
      const localData = localStorage.getItem(OffersService.LOCAL_STORAGE_KEY);
      const fallbackOffers: Offer[] = localData ? JSON.parse(localData) : INITIAL_DEMO_OFFERS;
      return {
        offers: fallbackOffers.filter((o) => !submitted24hOfferIds.has(o.id)),
        recentSubmissionsOfferIds: Array.from(submitted24hOfferIds),
      };
    }
  }

  /**
   * Posts a new job offer campaign
   */
  static async createOffer(offerData: {
    title: string;
    description: string;
    targetAppUrl?: string;
    payout?: number;
    category?: string;
    createdBy: string;
  }): Promise<Offer | null> {
    const payload = {
      title: offerData.title,
      description: offerData.description,
      target_app_url: offerData.targetAppUrl || '',
      payout: offerData.payout || 1.00,
      category: offerData.category || 'General',
      status: 'active',
      created_by: offerData.createdBy,
      max_completions: 100,
      current_completions: 0,
    };

    try {
      const { data, error } = await OffersService.client
        .from('offers')
        .insert(payload)
        .select()
        .single();

      if (!error && data) {
        return {
          id: data.id,
          title: data.title,
          description: data.description,
          targetAppUrl: data.target_app_url,
          payout: Number(data.payout) || 1.00,
          category: data.category,
          status: data.status,
          createdBy: data.created_by,
          maxCompletions: data.max_completions,
          currentCompletions: data.current_completions,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    } catch (err) {
      console.error('[BdSmartLeadX-02] Error creating offer on Supabase:', err);
    }

    // Fallback to local storage
    const newOffer: Offer = {
      id: `off-local-${Date.now()}`,
      title: offerData.title,
      description: offerData.description,
      targetAppUrl: offerData.targetAppUrl || '',
      payout: offerData.payout || 1.00,
      category: offerData.category || 'General',
      status: 'active',
      createdBy: offerData.createdBy,
      maxCompletions: 100,
      currentCompletions: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const existing = localStorage.getItem(OffersService.LOCAL_STORAGE_KEY);
    const list: Offer[] = existing ? JSON.parse(existing) : INITIAL_DEMO_OFFERS;
    list.unshift(newOffer);
    localStorage.setItem(OffersService.LOCAL_STORAGE_KEY, JSON.stringify(list));

    return newOffer;
  }
}
