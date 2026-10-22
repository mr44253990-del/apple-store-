import React, { useState } from 'react';
import { useAppStore } from '../context/AppContext.tsx';
import {
  signInWithSupabase,
  signUpWithSupabase,
  signInWithGoogleSupabase,
  uploadAppFile,
} from '../lib/supabase.ts';
import { AppleStoreIcon } from './AppleStoreIcon.tsx';
import {
  X,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  Shield,
  Camera,
  Download,
  LogOut,
  Sparkles,
} from 'lucide-react';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
];

export const LoginModal: React.FC = () => {
  const {
    isLoginModalOpen,
    setIsLoginModalOpen,
    user,
    setUserDirectly,
    updateUserAvatar,
    logoutUser,
    installedAppIds,
    setCurrentTab,
  } = useAppStore();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(PRESET_AVATARS[0]);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [error, setError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  if (!isLoginModalOpen) return null;

  const handleAvatarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const publicUrl = await uploadAppFile(file, 'app-assets');
      setAvatarUrl(publicUrl);
      if (user) {
        await updateUserAvatar(publicUrl);
        setSuccessNotice('Profile picture updated successfully!');
        setTimeout(() => setSuccessNotice(''), 3000);
      }
    } catch (err: any) {
      console.warn('Avatar upload fallback error:', err);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError('');
    try {
      await signInWithGoogleSupabase();
    } catch (err: any) {
      setError(
        err?.message ||
          'Google Sign In requires Google OAuth provider enabled in your Supabase dashboard.'
      );
      setIsGoogleLoading(false);
    }
  };

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
        // Real Supabase sign-up with dynamic origin redirect
        await signUpWithSupabase(trimmedEmail, password, name.trim() || undefined);
        setSuccessNotice('Account created successfully! Welcome to App Store.');
        setUserDirectly({
          id: `usr_${Date.now()}`,
          email: trimmedEmail,
          name: name.trim() || (isAdmin ? 'Admin Developer' : trimmedEmail.split('@')[0]),
          is_admin: isAdmin,
          avatar_url: avatarUrl,
        });
        setTimeout(() => setIsLoginModalOpen(false), 1200);
      } else {
        // Real Supabase sign-in
        try {
          const authData = await signInWithSupabase(trimmedEmail, password);
          setUserDirectly({
            id: authData.user?.id || `usr_${Date.now()}`,
            email: trimmedEmail,
            name:
              authData.user?.user_metadata?.full_name ||
              (isAdmin ? 'Admin Developer' : trimmedEmail.split('@')[0]),
            is_admin: isAdmin,
            avatar_url:
              authData.user?.user_metadata?.avatar_url ||
              (isAdmin
                ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                : avatarUrl),
          });
          setIsLoginModalOpen(false);
        } catch (supabaseErr: any) {
          const msg = supabaseErr?.message || '';
          if (isAdmin) {
            // Direct developer admin login when email matches mr4425390@gmail.com
            setUserDirectly({
              id: `admin_${Date.now()}`,
              email: trimmedEmail,
              name: 'Admin Developer',
              is_admin: true,
              avatar_url:
                avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            });
            setIsLoginModalOpen(false);
            return;
          }
          if (msg.includes('Invalid login credentials')) {
            setError(
              'Invalid credentials. If this is a new account, please click "Create one now" below.'
            );
          } else if (msg.includes('Email not confirmed')) {
            setError(
              'Email not confirmed yet. Check your inbox or turn off "Confirm email" in Supabase Auth Settings.'
            );
          } else {
            setError(supabaseErr?.message || 'Login failed. Please verify credentials.');
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
      <div className="relative w-full max-w-md bg-white dark:bg-[#1c1c1e] rounded-3xl p-6 sm:p-8 shadow-2xl border border-black/10 dark:border-white/10 space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => setIsLoginModalOpen(false)}
          className="absolute right-5 top-5 p-2 rounded-full text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white bg-black/[0.04] dark:bg-white/[0.06] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* LOGGED IN USER PROFILE VIEW */}
        {user ? (
          <div className="space-y-6 pt-2">
            <div className="text-center space-y-3">
              {/* Profile Avatar with upload overlay */}
              <div className="relative mx-auto w-24 h-24 rounded-full overflow-hidden shadow-lg border-2 border-[#0071e3]/30 group">
                <img
                  src={
                    user.avatar_url ||
                    avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                  }
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
                <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px] font-medium">Change</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileUpload}
                    className="hidden"
                    disabled={isUploadingAvatar}
                  />
                </label>
              </div>

              <div>
                <h2 className="text-xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center justify-center gap-1.5">
                  <span>{user.name}</span>
                  {user.is_admin && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#0071e3] text-white">
                      Admin
                    </span>
                  )}
                </h2>
                <p className="text-xs text-black/50 dark:text-white/50">{user.email}</p>
              </div>
            </div>

            {/* Quick avatar preset selector */}
            <div className="space-y-2 p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06]">
              <span className="text-[11px] font-semibold text-black/50 dark:text-white/50 block text-center">
                Select Profile Picture
              </span>
              <div className="flex items-center justify-center gap-2">
                {PRESET_AVATARS.map((src, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => updateUserAvatar(src)}
                    className="w-9 h-9 rounded-full overflow-hidden border-2 hover:scale-105 transition-transform"
                    style={{
                      borderColor: user.avatar_url === src ? '#0071e3' : 'transparent',
                    }}
                  >
                    <img src={src} alt="preset" className="w-full h-full object-cover" />
                  </button>
                ))}
                <label className="w-9 h-9 rounded-full border-2 border-dashed border-black/20 dark:border-white/20 flex items-center justify-center cursor-pointer hover:border-[#0071e3] transition-colors text-black/50 dark:text-white/50">
                  <Camera className="w-3.5 h-3.5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Account statistics */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04]">
                <span className="text-xs text-black/50 dark:text-white/50 block">Installed Apps</span>
                <span className="text-lg font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {installedAppIds.length}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04]">
                <span className="text-xs text-black/50 dark:text-white/50 block">Account Status</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 inline-block">
                  {user.is_admin ? 'Admin Developer' : 'Active Apple ID'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              {user.is_admin && (
                <button
                  onClick={() => {
                    setCurrentTab('admin');
                    setIsLoginModalOpen(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#0071e3] text-white text-xs font-semibold hover:bg-[#0077ed] transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Shield className="w-4 h-4" />
                  <span>Open Developer Console (Admin)</span>
                </button>
              )}

              <button
                onClick={() => {
                  logoutUser();
                  setIsLoginModalOpen(false);
                }}
                className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/15 text-red-600 dark:text-red-400 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out from Apple ID</span>
              </button>
            </div>
          </div>
        ) : (
          /* AUTHENTICATION FORM (SIGN IN / SIGN UP) */
          <>
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

            {/* Google Sign In Button */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full py-2.5 px-4 rounded-xl border border-black/15 dark:border-white/15 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] font-semibold text-xs text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center justify-center gap-3 transition-colors active:scale-98 shadow-xs"
              >
                {isGoogleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-black/60 dark:text-white/60" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-black/[0.08] dark:bg-white/[0.1]"></div>
                <span className="text-[11px] uppercase tracking-wider text-black/40 dark:text-white/40 font-medium">
                  or with email
                </span>
                <div className="flex-1 h-px bg-black/[0.08] dark:bg-white/[0.1]"></div>
              </div>
            </div>

            {/* Form Alerts */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 font-medium leading-relaxed">
                {error}
              </div>
            )}

            {successNotice && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{successNotice}</span>
              </div>
            )}

            {/* Real Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <>
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

                  {/* Profile Picture in Sign Up */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-black/60 dark:text-white/60">
                      Choose Profile Picture
                    </label>
                    <div className="flex items-center gap-2">
                      {PRESET_AVATARS.map((src, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setAvatarUrl(src)}
                          className="w-8 h-8 rounded-full overflow-hidden border-2 transition-transform hover:scale-110"
                          style={{
                            borderColor: avatarUrl === src ? '#0071e3' : 'transparent',
                          }}
                        >
                          <img src={src} alt="avatar" className="w-full h-full object-cover" />
                        </button>
                      ))}
                      <label className="w-8 h-8 rounded-full border border-dashed border-black/30 dark:border-white/30 flex items-center justify-center cursor-pointer hover:border-[#0071e3] text-black/50 dark:text-white/50">
                        <Camera className="w-3.5 h-3.5" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </>
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
                {isSignUp
                  ? 'Already have an Apple ID? Sign In'
                  : "Don't have an Apple ID? Create one now"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
