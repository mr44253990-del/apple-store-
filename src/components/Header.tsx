import React from 'react';
import { Search, Sun, Moon, Palette, User, ShieldCheck, Database, Cloud } from 'lucide-react';
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

  const colors = [
    { id: 'blue', label: 'Apple Blue', bg: 'bg-[#0071e3]' },
    { id: 'purple', label: 'Purple', bg: 'bg-purple-600' },
    { id: 'emerald', label: 'Emerald', bg: 'bg-emerald-600' },
    { id: 'orange', label: 'Orange', bg: 'bg-orange-500' },
    { id: 'rose', label: 'Rose Gold', bg: 'bg-rose-500' },
  ] as const;

  const toggleTheme = () => {
    const nextTheme = settings.theme_mode === 'dark' ? 'light' : 'dark';
    updateSettings({ theme_mode: nextTheme });
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-black/[0.06] dark:border-white/[0.08] bg-[#f5f5f7]/80 dark:bg-[#000000]/80 backdrop-blur-xl px-4 md:px-8 flex items-center justify-between gap-4 transition-colors">
      {/* Search Input Bar */}
      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40 dark:text-white/40" />
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
          placeholder="Search apps, games, stories & #tags..."
          className="w-full pl-10 pr-4 py-2 text-sm bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] focus:bg-white dark:focus:bg-[#1c1c1e] text-[#1d1d1f] dark:text-[#f5f5f7] placeholder-black/40 dark:placeholder-white/40 rounded-full border border-transparent focus:border-[#0071e3] transition-all outline-none"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Supabase status badge */}
        <div
          title={`Supabase: ${cloudSyncStatus === 'synced' ? 'Connected & Synced' : 'Ready / Active'}`}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-black/[0.04] dark:bg-white/[0.06] text-black/70 dark:text-white/70"
        >
          <Database className="w-3.5 h-3.5 text-[#3ecf8e]" />
          <span>Supabase</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>

        {/* Color Theme Selector */}
        <div className="flex items-center bg-black/[0.04] dark:bg-white/[0.06] p-1 rounded-full">
          {colors.map((c) => (
            <button
              key={c.id}
              onClick={() => updateSettings({ accent_color: c.id })}
              aria-label={`Change accent to ${c.label}`}
              className={`w-4 h-4 rounded-full mx-0.5 transition-transform ${c.bg} ${
                settings.accent_color === c.id ? 'scale-125 ring-2 ring-white dark:ring-black shadow-sm' : 'opacity-60 hover:opacity-100'
              }`}
            />
          ))}
        </div>

        {/* Light / Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Dark / Light Theme"
          className="p-2 rounded-full text-black/70 dark:text-white/70 hover:bg-black/[0.06] dark:hover:bg-white/[0.1] transition-colors"
        >
          {settings.theme_mode === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* User Account / Apple ID */}
        {user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-black/[0.08] dark:border-white/[0.1]">
            <button
              onClick={() => {
                if (user.is_admin) {
                  setCurrentTab('admin');
                } else {
                  setIsLoginModalOpen(true);
                }
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] transition-colors"
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
