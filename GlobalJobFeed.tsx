import React, { useState, useEffect } from 'react';
import { OffersService } from '../../services/offersService';
import { WalletService } from '../../services/walletService';
import { Offer, UserWallet } from '../../types/offers';
import { useAuth } from '../../hooks/useAuth';
import { TaskSubmissionModal } from './TaskSubmissionModal';
import { PostOfferModal } from './PostOfferModal';
import { 
  Globe, 
  PlusCircle, 
  ExternalLink, 
  CheckCircle2, 
  DollarSign, 
  Search, 
  Clock, 
  Sparkles, 
  RefreshCw, 
  Award,
  Wallet,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export function GlobalJobFeed() {
  const { user, profile } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [recent24hSubmittedIds, setRecent24hSubmittedIds] = useState<string[]>([]);

  // Modal triggers
  const [selectedJobForTask, setSelectedJobForTask] = useState<Offer | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const { offers: activeOffers, recentSubmissionsOfferIds } = await OffersService.fetchActiveOffers(user?.id);
      setOffers(activeOffers);
      setRecent24hSubmittedIds(recentSubmissionsOfferIds);

      if (user) {
        const w = await WalletService.getUserWallet(user.id);
        setWallet(w);
      }
    } catch (err) {
      console.error('[BdSmartLeadX-02] Error loading job feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleTaskSubmittedSuccess = () => {
    showToast('Task submitted successfully! The job has entered 24-hour cooldown and moved to review.');
    loadData();
  };

  const filteredOffers = offers.filter((o) => {
    if (selectedCategory !== 'all' && o.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return o.title.toLowerCase().includes(q) || o.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6" id="global-job-feed-view">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="bg-emerald-950/90 border border-emerald-500 text-emerald-200 px-4 py-3 rounded-xl flex items-center justify-between shadow-xl animate-fade-in">
          <div className="flex items-center space-x-2 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Hero Welcome & Surfing Balance Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950 border border-cyan-800/40 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" /> Approved & Active Worker Access
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30">
              <Clock className="w-3 h-3" /> 24-Hour Job Cooldown Active
            </span>
          </div>

          <h2 className="text-2xl font-bold text-white tracking-tight">Global Sign-Up Exchange Job Feed</h2>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Complete sign-up exchange tasks by submitting the <strong>4 mandatory screenshots</strong>. Earn <strong>+1 Surfing Balance</strong> for each approved job!
          </p>
        </div>

        {/* Balance & Post Campaign CTA */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 text-right min-w-[150px]">
            <p className="text-[10px] text-slate-400 uppercase font-mono">Surfing Balance</p>
            <p className="text-2xl font-bold text-emerald-400 font-mono">
              ${wallet ? wallet.balance.toFixed(2) : '24.50'}
            </p>
          </div>

          <button
            onClick={() => setShowPostModal(true)}
            className="px-5 py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-950 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Offer Campaign</span>
          </button>
        </div>
      </div>

      {/* 24-Hour Cooldown Banner Notice */}
      <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20 shrink-0">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-300">24-Hour Cooldown Rule Enforced</h4>
            <p className="text-[11px] text-slate-300 mt-0.5">
              After submitting 4 screenshots for a job, that job automatically disappears from your feed for 24 hours to prevent duplicate submissions, and reappears after 24 hours.
            </p>
          </div>
        </div>

        {recent24hSubmittedIds.length > 0 && (
          <span className="text-xs font-mono font-semibold text-amber-400 bg-amber-950/60 px-3 py-1.5 rounded-lg border border-amber-800 shrink-0">
            {recent24hSubmittedIds.length} Job(s) currently in 24h cooldown
          </span>
        )}
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search job title or instructions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
          {['all', 'Crypto / Web3', 'Finance & Wallet', 'E-Commerce', 'SaaS & Apps'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-cyan-600 text-white shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}

          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-xs transition-colors cursor-pointer"
            title="Refresh feed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Available Job Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredOffers.length === 0 ? (
          <div className="col-span-full bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
            <Globe className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-300">No active job offers available right now.</p>
            <p className="text-xs text-slate-500 mt-1">
              All available jobs may be in your 24-hour cooldown period or match active filters.
            </p>
          </div>
        ) : (
          filteredOffers.map((job) => (
            <div
              key={job.id}
              className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all rounded-2xl p-6 flex flex-col justify-between space-y-5 shadow-xl group relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase bg-slate-950 text-cyan-400 px-2.5 py-1 rounded-md border border-slate-800">
                    {job.category}
                  </span>
                  <span className="text-sm font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-800/80 flex items-center gap-1 font-mono">
                    +${job.payout.toFixed(2)} Surfing Balance
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {job.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
                  {job.description}
                </p>

                {/* 4 Steps Indicator Badge */}
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span className="text-amber-300 font-semibold font-sans">
                    Requires 4 Bengali Step Screenshots
                  </span>
                  <span className="text-xs font-mono text-cyan-400 font-bold">4 Screenshots</span>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="text-[11px] text-slate-400 font-mono">
                  Completions: <strong className="text-slate-200">{job.currentCompletions} / {job.maxCompletions}</strong>
                </div>

                <button
                  onClick={() => setSelectedJobForTask(job)}
                  className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-950 cursor-pointer"
                >
                  <span>Start Task & Submit Proof</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Task Submission Modal */}
      {selectedJobForTask && (
        <TaskSubmissionModal
          offer={selectedJobForTask}
          onClose={() => setSelectedJobForTask(null)}
          onSuccess={handleTaskSubmittedSuccess}
        />
      )}

      {/* Post Offer Modal */}
      {showPostModal && (
        <PostOfferModal
          onClose={() => setShowPostModal(false)}
          onSuccess={() => {
            showToast('New job offer campaign published successfully!');
            loadData();
          }}
        />
      )}
    </div>
  );
}
