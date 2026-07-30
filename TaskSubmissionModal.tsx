import React, { useState } from 'react';
import { Offer } from '../../types/offers';
import { SubmissionsService } from '../../services/submissionsService';
import { useAuth } from '../../hooks/useAuth';
import { 
  X, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Image as ImageIcon, 
  Sparkles, 
  ShieldCheck, 
  FileText,
  DollarSign
} from 'lucide-react';

interface TaskSubmissionModalProps {
  offer: Offer;
  onClose: () => void;
  onSuccess: () => void;
}

interface ScreenshotState {
  file: File | null;
  previewUrl: string;
  inputUrl: string;
}

export function TaskSubmissionModal({ offer, onClose, onSuccess }: TaskSubmissionModalProps) {
  const { user, profile } = useAuth();

  const [screenshots, setScreenshots] = useState<Record<number, ScreenshotState>>({
    1: { file: null, previewUrl: '', inputUrl: '' },
    2: { file: null, previewUrl: '', inputUrl: '' },
    3: { file: null, previewUrl: '', inputUrl: '' },
    4: { file: null, previewUrl: '', inputUrl: '' },
  });

  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Bengali requirements for each of the 4 mandatory screenshots
  const screenshotRequirements = [
    {
      step: 1,
      bengaliTitle: 'Chrome Beta ব্রাউজার এ গিয়ে ডাটা ক্লিয়ার করে তার একটা স্কিনশট নিয়ে জমা দিবেন।',
      shortLabel: 'Screenshot 1: Chrome Beta Data Clear',
      placeholderUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    },
    {
      step: 2,
      bengaliTitle: 'লিংক নিয়ে ব্রাউজারে পেস্ট করে যেই ল্যান্ডিং পেইজ আসবে সেটার একটা স্কিনশট নিয়ে জমা দিবেন।',
      shortLabel: 'Screenshot 2: App Landing Page Opened',
      placeholderUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80',
    },
    {
      step: 3,
      bengaliTitle: 'এপস ডাউনলোড এর সময় একটা স্কিনশট নিয়ে জমা দিবেন।',
      shortLabel: 'Screenshot 3: App Downloading Process',
      placeholderUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=400&q=80',
    },
    {
      step: 4,
      bengaliTitle: 'এপস এ ঢুকে রেজিষ্ট্রেশন করে সেই পেজের একটা স্কিনশট জমা দিবেন।',
      shortLabel: 'Screenshot 4: Successful App Registration Page',
      placeholderUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80',
    },
  ];

  const handleFileChange = (step: number, file: File | null) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshots((prev) => ({
        ...prev,
        [step]: {
          file,
          previewUrl: reader.result as string,
          inputUrl: '',
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (step: number, url: string) => {
    setScreenshots((prev) => ({
      ...prev,
      [step]: {
        file: null,
        previewUrl: url,
        inputUrl: url,
      },
    }));
  };

  const isStepComplete = (step: number) => {
    const s = screenshots[step];
    return Boolean(s.previewUrl && s.previewUrl.trim() !== '');
  };

  const allComplete = isStepComplete(1) && isStepComplete(2) && isStepComplete(3) && isStepComplete(4);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!user) {
      setErrorMsg('You must be logged in to submit a task.');
      return;
    }

    if (!allComplete) {
      setErrorMsg('All 4 screenshot submissions are strictly mandatory before submitting.');
      return;
    }

    setSubmitting(true);

    try {
      await SubmissionsService.submitTask({
        offerId: offer.id,
        offerTitle: offer.title,
        userId: user.id,
        userEmail: user.email,
        userName: profile?.fullName || user.email,
        screenshot1Url: screenshots[1].previewUrl,
        screenshot2Url: screenshots[2].previewUrl,
        screenshot3Url: screenshots[3].previewUrl,
        screenshot4Url: screenshots[4].previewUrl,
        notes,
        payoutAmount: offer.payout || 1.00,
      });

      setSubmittedSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to submit task. Please check all screenshot fields.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 text-slate-100">
        
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between sticky top-0 z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase tracking-wider mb-1">
              4-Step Screenshot Verification Required
            </div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>{offer.title}</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Target Offer Details & Reward Banner */}
          <div className="bg-slate-950/80 border border-cyan-800/40 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-400 font-medium">Task Target Link & Instructions:</p>
              <p className="text-xs text-slate-200 mt-1">{offer.description}</p>
              {offer.targetAppUrl && (
                <a
                  href={offer.targetAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-mono font-semibold mt-2 underline"
                >
                  <span>Open Target Application / Offer Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            <div className="bg-emerald-950/60 border border-emerald-800 px-4 py-2.5 rounded-xl text-center shrink-0">
              <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-mono block">Reward Upon Approval</span>
              <span className="text-lg font-bold text-emerald-300 flex items-center justify-center gap-0.5">
                <DollarSign className="w-4 h-4" />+1.00 Surfing Balance
              </span>
            </div>
          </div>

          {/* 24-Hour Cooldown Notice */}
          <div className="bg-amber-950/30 border border-amber-800/40 rounded-lg p-3 text-xs text-amber-300 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-200">24-Hour Cooldown Rule Active</p>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Once you submit this task, this job offer will disappear from your feed for 24 hours to prevent duplicate spam. It will automatically reappear after 24 hours.
              </p>
            </div>
          </div>

          {/* Success Banner */}
          {submittedSuccess && (
            <div className="p-4 bg-emerald-950/90 border border-emerald-500 rounded-xl text-xs text-emerald-200 flex items-center space-x-3 shadow-xl animate-fade-in">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-emerald-300 text-sm">Task Submitted Successfully!</p>
                <p className="text-slate-300">
                  Your 4 screenshots have been submitted to the offer owner for review. Upon approval, <strong>+1 Surfing Balance</strong> will be credited to your wallet immediately.
                </p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center justify-between">
              <span>Mandatory 4-Screenshot Proof Submissions</span>
              <span className="text-xs font-mono text-cyan-400">
                Completed: {Object.keys(screenshots).filter((k) => isStepComplete(Number(k))).length} / 4
              </span>
            </h3>

            {/* 4 Mandatory Screenshot Upload Cards */}
            <div className="space-y-5">
              {screenshotRequirements.map((req) => {
                const stepState = screenshots[req.step];
                const completed = isStepComplete(req.step);

                return (
                  <div
                    key={req.step}
                    className={`p-4 rounded-xl border transition-all ${
                      completed
                        ? 'bg-slate-950 border-emerald-500/50 shadow-md shadow-emerald-950/20'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Bengali Instruction Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-2.5">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          completed ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {req.step}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-amber-300 font-sans leading-relaxed">
                            {req.bengaliTitle}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">{req.shortLabel}</p>
                        </div>
                      </div>

                      {completed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800 shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Attached
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono uppercase bg-rose-950 text-rose-300 px-2 py-0.5 rounded border border-rose-800 shrink-0">
                          Mandatory
                        </span>
                      )}
                    </div>

                    {/* Input Controls & Preview Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center pt-2">
                      {/* File Drag & Drop / Input */}
                      <div className="sm:col-span-2 space-y-2">
                        <label className="block text-[11px] font-semibold text-slate-400">Option A: Upload Screenshot File</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(req.step, e.target.files?.[0] || null)}
                          className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
                        />

                        <div className="pt-1">
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Option B: Or Paste Direct Image URL</label>
                          <input
                            type="url"
                            placeholder="https://example.com/screenshot.jpg"
                            value={stepState.inputUrl}
                            onChange={(e) => handleUrlChange(req.step, e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      </div>

                      {/* Preview Box */}
                      <div className="flex flex-col items-center justify-center">
                        {stepState.previewUrl ? (
                          <div className="relative group w-full h-28 bg-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow">
                            <img
                              src={stepState.previewUrl}
                              alt={`Step ${req.step} Preview`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <a
                                href={stepState.previewUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-cyan-300 underline font-mono"
                              >
                                View Full Size
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-28 bg-slate-900 border border-dashed border-slate-800 rounded-lg flex flex-col items-center justify-center text-slate-600 p-2 text-center">
                            <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
                            <span className="text-[10px]">No screenshot attached</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Additional Worker Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Additional Notes or Username Proof (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Write your registered username, phone number or remarks for the offer owner..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Footer Action Buttons */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting || !allComplete || submittedSuccess}
                className={`px-6 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all shadow-lg ${
                  allComplete && !submittedSuccess
                    ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-950 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>
                  {submitting ? 'Submitting Screenshots...' : allComplete ? 'Submit All 4 Screenshots' : 'Complete All 4 Screenshots'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
