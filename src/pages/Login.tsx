import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, ENV } from '../config';
import { Scissors, Lock, Mail, AlertCircle, KeyRound, Sparkles } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Check if session already exists
  useEffect(() => {
    const checkSession = async () => {
      const sessionKey = `sb-${ENV.CLIENT_ID}-auth-token`;
      const token = localStorage.getItem(sessionKey) || localStorage.getItem('supabase.auth.token');
      if (token) {
        navigate('/dashboard');
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (!ENV.SUPABASE_URL || ENV.SUPABASE_URL.includes('placeholder')) {
        throw new Error('Supabase is not configured yet. Please use the Demo Workspace Bypass to evaluate the owner dashboard.');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      window.dispatchEvent(
        new CustomEvent('app_toast', {
          detail: { message: 'Signed in successfully as administrator.', type: 'success' },
        })
      );
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoBypass = () => {
    setErrorMsg(null);
    setLoading(true);

    // Simulate standard Supabase Session object in local storage
    const fakeSession = {
      currentSession: {
        access_token: 'fake-jwt-token-vance-and-co-barbershop-admin',
        token_type: 'bearer',
        expires_in: 3600,
        user: {
          id: 'admin-uuid-1111',
          email: email || 'nkostaled@gmail.com',
          role: 'authenticated',
        },
      },
    };

    localStorage.setItem(`sb-${ENV.CLIENT_ID}-auth-token`, JSON.stringify(fakeSession));
    localStorage.setItem('supabase.auth.token', JSON.stringify(fakeSession.currentSession));

    setTimeout(() => {
      setLoading(false);
      window.dispatchEvent(
        new CustomEvent('app_toast', {
          detail: { message: 'Demo Mode Activated. Welcome back, Vance Admin!', type: 'success' },
        })
      );
      navigate('/dashboard');
    }, 800);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-slate-950">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent pointer-events-none"></div>

      <div className="max-w-md w-full bg-slate-900/40 border border-slate-900 rounded-3xl p-8 space-y-8 relative shadow-2xl">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto h-12 w-12 bg-amber-500 text-slate-950 rounded-xl flex items-center justify-center shadow-lg">
            <Scissors className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl tracking-wider text-white uppercase">VANCE & CO.</h1>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold text-amber-500">Staff Portal Login</p>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-4 rounded-xl flex items-start gap-2.5 text-xs text-left">
            <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-500 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5 text-left">
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-600" />
              <input
                type="email"
                id="login-email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@vanceandco.com"
                className="w-full bg-slate-950 border border-slate-900 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="login-password" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Secure Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-600" />
              <input
                type="password"
                id="login-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950 border border-slate-900 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                Signing in...
              </>
            ) : (
              <>
                <KeyRound className="h-4 w-4" />
                Sign In to Dashboard
              </>
            )}
          </button>
        </form>

        {/* Demo bypass container */}
        <div className="pt-6 border-t border-slate-900/80 space-y-3">
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Evaluating the Application?</p>
          <button
            type="button"
            onClick={handleDemoBypass}
            className="w-full bg-slate-900 hover:bg-slate-800 text-amber-500 font-bold py-3 rounded-xl text-xs transition-colors border border-slate-800 hover:border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Activate Demo Workspace Bypass
          </button>
        </div>
      </div>
    </div>
  );
};
