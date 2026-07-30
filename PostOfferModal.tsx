import React, { useState } from 'react';
import { OffersService } from '../../services/offersService';
import { useAuth } from '../../hooks/useAuth';
import { X, PlusCircle, AlertCircle, Globe, Link2, DollarSign } from 'lucide-react';

interface PostOfferModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function PostOfferModal({ onClose, onSuccess }: PostOfferModalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAppUrl, setTargetAppUrl] = useState('');
  const [category, setCategory] = useState('Crypto / Web3');
  const [payout, setPayout] = useState<number>(1.00);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMsg('You must be signed in to post an offer.');
      return;
    }

    if (!title.trim() || !description.trim()) {
      setErrorMsg('Please fill in job title and instructions.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      await OffersService.createOffer({
        title,
        description,
        targetAppUrl,
        payout,
        category,
        createdBy: user.id,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to post job offer campaign.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 text-slate-100">
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PlusCircle className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Post New Job / Offer Campaign</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Campaign / Offer Title</label>
            <input
              type="text"
              placeholder="e.g. Crypto Wallet App Download & Registration Exchange"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="Crypto / Web3">Crypto / Web3</option>
                <option value="Finance & Wallet">Finance & Wallet</option>
                <option value="E-Commerce">E-Commerce</option>
                <option value="SaaS & Apps">SaaS & Apps</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Worker Payout Reward</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
                <input
                  type="number"
                  step="0.10"
                  min="0.50"
                  value={payout}
                  onChange={(e) => setPayout(Number(e.target.value))}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Application or Landing Page URL</label>
            <div className="relative">
              <Link2 className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="url"
                placeholder="https://play.google.com/store/apps/details?id=com.example.app"
                value={targetAppUrl}
                onChange={(e) => setTargetAppUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Task Instructions for Workers</label>
            <textarea
              rows={3}
              placeholder="Explain the required steps (Workers will be prompted to submit the 4 mandatory screenshots: Chrome Beta Data Clear, Landing Page, Download, and Registration)."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-cyan-950 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Publishing...' : 'Publish Offer Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
