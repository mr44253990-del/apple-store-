import React, { useState } from 'react';
import { useAppStore } from '../context/AppContext.tsx';
import { signInWithSupabase, signUpWithSupabase } from '../lib/supabase.ts';
import { AppleStoreIcon } from './AppleStoreIcon.tsx';
import { X, Lock, Mail, User, Eye, EyeOff, Loader2, CheckCircle2, Shield } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, setIsLoginModalOpen, setUserDirectly } = useAppStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please provide both email and password.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessNotice('');

    const trimmedEmail = email.trim().toLowerCase();
    const isAdmin = trimmedEmail === 'mr4425390@gmail.com';

    try {
      if (isSignUp) {
        // Real Supabase sign-up
        await signUpWithSupabase(trimmedEmail, password, name.trim() || undefined);
        setSuccessNotice('Account created successfully! You are now logged in.');
        setUserDirectly({
          id: `usr_${Date.now()}`,
          email: trimmedEmail,
          name: name.trim() || (isAdmin ? 'Admin Developer' : trimmedEmail.split('@')[0]),
          is_admin: isAdmin,
        });
        setTimeout(() => setIsLoginModalOpen(false), 1200);
      } else {
        // Real Supabase sign-in
        try {
          const authData = await signInWithSupabase(trimmedEmail, password);
          setUserDirectly({
            id: authData.user?.id || `usr_${Date.now()}`,
            email: trimmedEmail,
            name: authData.user?.user_metadata?.full_name || (isAdmin ? 'Admin Developer' : trimmedEmail.split('@')[0]),
            is_admin: isAdmin,
          });
          setIsLoginModalOpen(false);
        } catch (supabaseErr: any) {
          // If Supabase authentication throws an error
          const msg = supabaseErr?.message || '';
          if (msg.includes('Invalid login credentials')) {
            // Check if user wants to create this account or if offline fallback
            setError('Invalid login credentials. If you haven\'t created this user in Supabase yet, switch to "Create one now" below or check README.md.');
          } else if (msg.includes('Email not confirmed')) {
            setError('Email not confirmed in Supabase. Please disable "Confirm email" in Supabase Auth Providers or confirm the email.');
          } else {
            setError(supabaseErr?.message || 'Login failed. Please check credentials.');
          }
        }
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-[#1c1c1e] rounded-3xl p-6 sm:p-8 shadow-2xl border border-black/10 dark:border-white/10 space-y-6">
        {/* Close Button */}
        <button
          onClick={() => setIsLoginModalOpen(false)}
          className="absolute right-5 top-5 p-2 rounded-full text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white bg-black/[0.04] dark:bg-white/[0.06] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Apple ID Brand Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <AppleStoreIcon size={56} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
            {isSignUp ? 'Create Apple ID' : 'Sign In with Apple ID'}
          </h2>
          <p className="text-xs text-black/50 dark:text-white/50">
            {isSignUp
              ? 'One account to discover, download, and manage apps connected to Supabase.'
              : 'Enter your credentials to access your App Store profile.'}
          </p>
        </div>

        {/* Form Alerts */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 font-medium">
            {error}
          </div>
        )}

        {successNotice && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Real Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-black/60 dark:text-white/60 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40 dark:text-white/40" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Steve Jobs"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] outline-none focus:border-[#0071e3] transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-black/60 dark:text-white/60 mb-1">
              Apple ID / Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40 dark:text-white/40" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] outline-none focus:border-[#0071e3] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-black/60 dark:text-white/60 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40 dark:text-white/40" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] outline-none focus:border-[#0071e3] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/20 active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isSignUp ? 'Create Apple ID' : 'Sign In'}</span>
          </button>
        </form>

        {/* Toggle sign in / sign up */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setSuccessNotice('');
            }}
            className="text-xs text-[#0071e3] hover:underline font-medium"
          >
            {isSignUp ? 'Already have an Apple ID? Sign In' : "Don't have an Apple ID? Create one now"}
          </button>
        </div>
      </div>
    </div>
  );
};
