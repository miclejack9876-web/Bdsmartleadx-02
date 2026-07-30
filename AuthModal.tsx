import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
  User, 
  Mail, 
  Lock, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  LogIn, 
  UserPlus, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface AuthModalProps {
  onSuccess?: () => void;
  defaultTab?: 'signin' | 'register';
}

export function AuthModal({ onSuccess, defaultTab = 'signin' }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>(defaultTab);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();

  const handleTabChange = (tab: 'signin' | 'register') => {
    setActiveTab(tab);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (activeTab === 'register') {
        if (!username.trim()) {
          throw new Error('Please enter a username.');
        }
        if (!email.trim() || !password) {
          throw new Error('Please fill in both email address and password.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }

        await signUp({ email, password, fullName: username });
        
        setSuccessMsg('Worker account registered successfully! You can now sign in.');
        setTimeout(() => {
          setActiveTab('signin');
        }, 1500);
      } else {
        if (!email.trim() || !password) {
          throw new Error('Please enter your email address and password.');
        }
        await signIn({ email, password });
        setSuccessMsg('Signed in successfully!');
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      console.error('[BdSmartLeadX-02] Auth action error:', err);
      setErrorMsg(err?.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-6" id="auth-card-container">
      {/* Centered White Card Container */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden p-8 text-slate-800">
        
        {/* Branding Header */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center space-x-2.5 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-600 tracking-tight">
              BdSmartLeadX-02
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 tracking-wide">
            Sign-up to Sign-up Exchange Platform
          </p>
        </div>

        {/* Segmented Control Tabs */}
        <div className="bg-slate-100 p-1.5 rounded-xl flex items-center mb-6 border border-slate-200/60">
          <button
            type="button"
            onClick={() => handleTabChange('signin')}
            className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'signin'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 font-semibold'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('register')}
            className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'register'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 font-semibold'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register Worker</span>
          </button>
        </div>

        {/* Feedback Banners */}
        {errorMsg && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start space-x-2.5 shadow-sm">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start space-x-2.5 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-900">Success</p>
              <p className="mt-0.5 text-emerald-700">{successMsg}</p>
            </div>
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="e.g. worker_john"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required={activeTab === 'register'}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all font-medium"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Email address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                placeholder="worker@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all font-medium"
              />
            </div>
          </div>

          {activeTab === 'register' && (
            <div className="p-3 bg-blue-50/80 border border-blue-200/80 rounded-xl text-[11px] text-blue-900 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Registered workers get access to sign-up exchange jobs, 4-step screenshot submission verification, and Surfing Balance rewards.
              </span>
            </div>
          )}

          {/* Prominent Blue Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-600/25 hover:shadow-lg hover:shadow-blue-600/35 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>Processing...</span>
            ) : activeTab === 'register' ? (
              <>
                <span>Register & Earn +10 Pts</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Sign In to Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer info / quick switch */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            {activeTab === 'register' ? (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleTabChange('signin')}
                  className="font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                Need a worker account?{' '}
                <button
                  type="button"
                  onClick={() => handleTabChange('register')}
                  className="font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  Register Worker
                </button>
              </>
            )}
          </p>
        </div>

      </div>
    </div>
  );
}
