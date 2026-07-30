export interface Offer {
  id: string;
  title: string;
  description: string;
  targetAppUrl?: string;
  payout: number;
  category: string;
  status: 'active' | 'paused' | 'archived';
  createdBy: string;
  creatorEmail?: string;
  creatorName?: string;
  maxCompletions?: number;
  currentCompletions?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskSubmission {
  id: string;
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
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  payoutAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserWallet {
  id: string;
  userId: string;
  balance: number;
  pendingBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  currency: string;
}
