import React, { useState, useEffect } from 'react';
import { SubmissionsService } from './submissionsService';
import { TaskSubmission } from './offers';
import { useAuth } from './useAuth';
import { 
  FileCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCw, 
  Image as ImageIcon, 
  User, 
  ExternalLink,
  MessageSquare,
  Sparkles,
  ShieldAlert,
  Search,
  DollarSign
} from 'lucide-react';

export function SubmissionsReview() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedSubmission, setSelectedSubmission] = useState<TaskSubmission | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingSubId, setRejectingSubId] = useState<string | null>(null);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const data = await SubmissionsService.fetchSubmissions({
        status: activeTab,
      });
      setSubmissions(data);
    } catch (e) {
      console.error('[BdSmartLeadX-02] Error loading submissions:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, [activeTab]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleApprove = async (sub: TaskSubmission) => {
    if (!user) return;
    setActionLoadingId(sub.id);
    try {
      const success = await SubmissionsService.approveSubmission(
        sub.id,
        sub.userId,
        user.id,
        sub.payoutAmount || 1.00
      );

      if (success) {
        showToast(`Approved submission from ${sub.userName || sub.userEmail}! +${(sub.payoutAmount || 1.00).toFixed(2)} Surfing Balance credited to worker.`);
        await loadSubmissions();
        if (selectedSubmission?.id === sub.id) {
          setSelectedSubmission(null);
        }
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenRejectModal = (subId: string) => {
    setRejectingSubId(subId);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectingSubId) return;
    setActionLoadingId(rejectingSubId);
    try {
      const success = await SubmissionsService.rejectSubmission(
        rejectingSubId,
        rejectionReason || 'Requirements not met in mandatory 4 screenshots.'
      );

      if (success) {
        showToast('Submission marked as rejected.');
        setShowRejectModal(false);
        setRejectingSubId(null);
        await loadSubmissions();
        if (selectedSubmission?.id === rejectingSubId) {
          setSelectedSubmission(null);
        }
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const screenshotBengaliTitles = [
    '1. Chrome Beta ব্রাউজার এ গিয়ে ডাটা ক্লিয়ার করে তার একটা স্কিনশট নিয়ে জমা দিবেন।',
    '2. লিংক নিয়ে ব্রাউজারে পেস্ট করে যেই ল্যান্ডিং পেইজ আসবে সেটার একটা স্কিনশট নিয়ে জমা দিবেন।',
    '3. এপস ডাউনলোড এর সময় একটা স্কিনশট নিয়ে জমা দিবেন।',
    '4. এপস এ ঢুকে রেজিষ্ট্রেশন করে সেই পেজের একটা স্কিনশট জমা দিবেন।',
  ];

  return (
    <div className="space-y-6" id="submissions-review-view">
      {/* Toast Feedback Banner */}
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

      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 mb-2">
            <FileCheck className="w-3.5 h-3.5" /> Offer Owner & Admin Verification Console
          </div>
          <h2 className="text-xl font-bold text-white">4-Screenshot Task Submissions Review</h2>
          <p className="text-xs text-slate-400 mt-1">
            Review worker submissions, verify all 4 required screenshots, and click Approve to automatically credit <strong>+1 Surfing Balance</strong> to the worker's wallet.
          </p>
        </div>

        <button
          onClick={loadSubmissions}
          disabled={loading}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Submissions</span>
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center space-x-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-950'
              : 'text-amber-400 hover:bg-amber-950/40'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pending Review</span>
        </button>

        <button
          onClick={() => setActiveTab('approved')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'approved'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
              : 'text-emerald-400 hover:bg-emerald-950/40'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Approved</span>
        </button>

        <button
          onClick={() => setActiveTab('rejected')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'rejected'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'text-rose-400 hover:bg-rose-950/40'
          }`}
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Rejected</span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>All Submissions</span>
        </button>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {submissions.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
            <FileCheck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-300">No submissions found in this tab.</p>
            <p className="text-xs text-slate-500 mt-1">
              New task submissions with 4 mandatory screenshots will appear here for verification.
            </p>
          </div>
        ) : (
          submissions.map((sub) => {
            const isPending = sub.status === 'pending';
            const isApproved = sub.status === 'approved';
            const isRejected = sub.status === 'rejected';

            const screenshotsList = [
              sub.screenshot1Url,
              sub.screenshot2Url,
              sub.screenshot3Url,
              sub.screenshot4Url,
            ];

            return (
              <div
                key={sub.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 space-y-5 transition-all shadow-xl"
              >
                {/* Header Info */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200 text-sm">
                      {sub.userName ? sub.userName.charAt(0).toUpperCase() : 'W'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{sub.userName || sub.userEmail}</span>
                        <span className="text-xs font-mono text-slate-400">({sub.userEmail})</span>
                      </div>
                      <p className="text-xs text-cyan-400 font-medium mt-0.5">
                        Submitted for: <strong className="text-slate-200">{sub.offerTitle}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-mono text-slate-400">
                      {new Date(sub.createdAt).toLocaleString()}
                    </span>

                    {isApproved && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Approved (+1 Surfing Balance)
                      </span>
                    )}

                    {isPending && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-950 text-amber-300 border border-amber-800 animate-pulse">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        Pending Review
                      </span>
                    )}

                    {isRejected && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-950 text-rose-300 border border-rose-800">
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        Rejected
                      </span>
                    )}
                  </div>
                </div>

                {/* The 4 Screenshots Grid */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                    <span>Submitted 4 Screenshots Verification Proofs</span>
                    <span className="text-emerald-400 font-mono text-[11px]">4 / 4 Mandatory Images Attached</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {screenshotsList.map((url, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col justify-between space-y-2"
                      >
                        <p className="text-[11px] font-semibold text-amber-300 line-clamp-2 h-8">
                          {screenshotBengaliTitles[idx]}
                        </p>

                        <div className="relative group w-full h-36 bg-slate-900 rounded-lg overflow-hidden border border-slate-800">
                          {url ? (
                            <>
                              <img
                                src={url}
                                alt={`Step ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center">
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs text-cyan-300 font-semibold underline flex items-center gap-1"
                                >
                                  <span>Inspect Full Size</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-rose-400 text-xs p-2 text-center">
                              <XCircle className="w-6 h-6 mb-1" />
                              <span>Missing Screenshot</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Worker Notes */}
                {sub.notes && (
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-200">Worker Notes / Registration Details: </span>
                      <span>{sub.notes}</span>
                    </div>
                  </div>
                )}

                {/* Action Controls */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-xs text-slate-400 font-mono">
                    Payout Reward: <span className="font-bold text-emerald-400">+${(sub.payoutAmount || 1.00).toFixed(2)} Surfing Balance</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    {isPending && (
                      <>
                        <button
                          onClick={() => handleOpenRejectModal(sub.id)}
                          disabled={actionLoadingId === sub.id}
                          className="px-4 py-2 bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
                        >
                          <XCircle className="w-4 h-4 text-rose-400" />
                          <span>Reject</span>
                        </button>

                        <button
                          onClick={() => handleApprove(sub)}
                          disabled={actionLoadingId === sub.id}
                          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-950 cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{actionLoadingId === sub.id ? 'Approving...' : 'Approve & Credit +1 Surfing Balance'}</span>
                        </button>
                      </>
                    )}

                    {isApproved && (
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Reward Delivered To Wallet
                      </span>
                    )}

                    {isRejected && (
                      <span className="text-xs text-rose-400 font-semibold flex items-center gap-1">
                        <XCircle className="w-4 h-4" /> Marked as Rejected
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reject Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-400" />
              <span>Reject Submission</span>
            </h3>
            <p className="text-xs text-slate-400">
              Please specify the rejection reason for the worker (e.g. invalid registration screenshot or data not cleared).
            </p>
            <textarea
              rows={3}
              placeholder="e.g. Screenshot 1 did not show Chrome Beta data clear confirmation..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-500"
            />
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-rose-950 cursor-pointer"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
    }
