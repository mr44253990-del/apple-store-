import React from 'react';
import { Search, Sun, Moon, User, ShieldCheck } from 'lucide-react';
import { useAppStore } from '../context/AppContext.tsx';

export const Header: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    setCurrentTab,
    settings,
    updateSettings,
    user,
    setIsLoginModalOpen,
    cloudSyncStatus,
  } = useAppStore();

  const toggleTheme = () => {
    const nextTheme = settings.theme_mode === 'dark' ? 'light' : 'dark';
    updateSettings({ theme_mode: nextTheme });
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-white/10 bg-black/80 backdrop-blur-xl px-4 md:px-8 flex items-center justify-between gap-4 transition-colors duration-300">
      {/* Search Input Bar */}
      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (e.target.value.trim().length > 0) {
              setCurrentTab('search');
            }
          }}
          onFocus={() => {
            if (searchQuery.trim().length > 0) {
              setCurrentTab('search');
            }
          }}
          placeholder="অ্যাপলিকেশন নাম লিখে সার্চ করুন / Search apps..."
          className="w-full pl-10 pr-4 py-2 text-sm bg-white/10 hover:bg-white/20 focus:bg-white/30 text-[#f5f5f7] placeholder-white/40 rounded-full border border-transparent focus:border-[#0071e3] transition-all outline-none"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Light / Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="ডার্ক / লাইট থিম টগল করুন / Toggle Dark / Light Theme"
          className="p-2 rounded-full text-white/70 hover:bg-white/10 transition-colors"
        >
          {settings.theme_mode === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-300" />
          )}
        </button>

        {/* User Account / Apple ID */}
        {user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <button
              onClick={() => {
                if (user.is_admin) {
                  setCurrentTab('admin');
                } else {
                  setIsLoginModalOpen(true);
                }
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-[#0071e3] text-white flex items-center justify-center text-xs font-semibold overflow-hidden">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <span className="text-xs font-medium max-w-[100px] truncate hidden md:inline">
                {user.name}
              </span>
              {user.is_admin && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-[#0071e3] text-white">
                  Admin
                </span>
              )}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0071e3] text-white hover:bg-[#0077ed] text-xs font-semibold shadow-sm transition-all active:scale-95"
          >
            <User className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
