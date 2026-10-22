import React, { useState } from 'react';
import { useAppStore } from '../context/AppContext.tsx';
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
  const [avatarUrl, setAvatarUrl] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  if (!isLoginModalOpen) return null;

  // Simple local auth (no Supabase)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('ইমেইল ও পাসওয়ার্ড দিন।');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessNotice('');

    const trimmedEmail = email.trim().toLowerCase();
    const isAdmin = trimmedEmail === 'admin@appstore.com';

    try {
      if (isSignUp) {
        // Create local user account
        const newUser = {
          id: `usr_${Date.now()}`,
          email: trimmedEmail,
          name: name.trim() || (isAdmin ? 'Admin Developer' : trimmedEmail.split('@')[0]),
          is_admin: isAdmin,
          avatar_url: avatarUrl || '',
        };
        setUserDirectly(newUser);
        setSuccessNotice('অ্যাকাউন্ট তৈরি সফল হয়েছে! App Store এ স্বাগতম।');
        setTimeout(() => setIsLoginModalOpen(false), 1200);
      } else {
        // Simple local sign-in (any password works for demo)
        const newUser = {
          id: `usr_${Date.now()}`,
          email: trimmedEmail,
          name: name.trim() || (isAdmin ? 'Admin Developer' : trimmedEmail.split('@')[0]),
          is_admin: isAdmin,
          avatar_url: avatarUrl || '',
        };
        setUserDirectly(newUser);
        setIsLoginModalOpen(false);
      }
    } catch (err: any) {
      setError(err?.message || 'একটি ত্রুটি ঘটেছে।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-[#1c1c1e] rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10 dark:border-white/10 space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => setIsLoginModalOpen(false)}
          className="absolute right-5 top-5 p-2 rounded-full text-white/40 hover:text-white bg-white/10 dark:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* LOGGED IN USER PROFILE VIEW */}
        {user ? (
          <div className="space-y-6 pt-2">
            <div className="text-center space-y-3">
              {/* Profile Avatar */}
              <div className="relative mx-auto w-24 h-24 rounded-full overflow-hidden shadow-lg border-2 border-[#0071e3]/30 group">
                <img
                  src={user.avatar_url || ''}
                  alt={user.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {(e.target as HTMLImageElement).src = '';}}
                />
                {user.avatar_url && (
                  <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="w-5 h-5 mb-0.5" />
                    <span className="text-[10px] font-medium">পরিবर्तन করুন</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          updateUserAvatar(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }}
                      className="hidden"
                    />
                  </label>
                )}
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

              {/* Account statistics */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3.5 rounded-2xl bg-white/5 dark:bg-white/5">
                  <span className="text-xs text-black/50 dark:text-white/50 block">ইনস্টলড অ্যাপ</span>
                  <span className="text-lg font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    {installedAppIds.length}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 dark:bg-white/5">
                  <span className="text-xs text-black/50 dark:text-white/50 block">অ্যাকাউন্ট স্ট্যাটাস</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 inline-block">
                    {user.is_admin ? 'অ্যাডমিন ডেভেলপার' : 'সक्रিয়Apple ID'}
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
                    <span>ডেভেলপার কনসোল (অ্যাডমিন)</span>
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
                  <span>অ্যাপল আইডি থেকে সাইন আউট করুন</span>
                </button>
              </div>
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
                {isSignUp ? 'অ্যাপল আইডি তৈরি করুন' : 'অ্যাপল আইডি দিয়ে সাইন ইন করুন'}
              </h2>
              <p className="text-xs text-black/50 dark:text-white/50">
                {isSignUp
                  ? 'একটি অ্যাকাউন্টে 앱 کشف করুন, ডাউনলোড করুন এবং পরিচালনা করুন।'
                  : 'আপনার App Store প্রোফাইলে প্রবেশ করতে লগইন অনুমোদন দিন।'}
              </p>
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
                      পূর্ণ নাম
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40 dark:text-white/40" />
                      <input
                        type="text"
                        required
                        placeholder="যেমন: স্টিভ জবস"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] outline-none focus:border-[#0071e3] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Profile Picture in Sign Up */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-black/60 dark:text-white/60">
                      প্রোফাইল ছবি বেছে নিন
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="w-8 h-8 rounded-full border border-dashed border-white/30 dark:border-white/30 flex items-center justify-center cursor-pointer hover:border-[#0071e3] text-black/50 dark:text-white/50">
                        <Camera className="w-3.5 h-3.5" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = () => setAvatarUrl(reader.result as string);
                            reader.readAsDataURL(file);
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-black/60 dark:text-white/60 mb-1">
                  অ্যাপল আইডি / ইমেইল
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40 dark:text-white/40" />
                  <input
                    type="email"
                    required
                    placeholder="নাম@উদাহরণ.কম"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] outline-none focus:border-[#0071e3] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-black/60 dark:text-white/60 mb-1">
                  পাসওয়ার্ড
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40 dark:text-white/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] outline-none focus:border-[#0071e3] transition-colors"
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
                <span>{isSignUp ? 'অ্যাপল আইডি তৈরি করুন' : 'সাইন ইন করুন'}</span>
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
                className="text-xs text-[#0071e3] dark:text-[#2997ff] hover:underline font-medium"
              >
                {isSignUp
                  ? 'একটি অ্যাপল আইডি আছে? সাইন ইন করুন'
                  : "অ্যাপল আইডি নেই? একটা তৈরি করুন"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
