import React from 'react';
import {
  Sparkles,
  Gamepad2,
  LayoutGrid,
  Joystick,
  Search,
  Download,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { useAppStore } from '../context/AppContext.tsx';
import { AppleStoreIcon } from './AppleStoreIcon.tsx';

export const Sidebar: React.FC = () => {
  const { currentTab, setCurrentTab, user, logoutUser, installedAppIds } = useAppStore();

  const navItems: Array<{
    id: 'today' | 'games' | 'apps' | 'arcade' | 'search';
    label: string;
    icon: typeof Sparkles;
    badge?: string;
  }> = [
    { id: 'today', label: 'Today', icon: Sparkles },
    { id: 'games', label: 'Games', icon: Gamepad2 },
    { id: 'apps', label: 'Apps', icon: LayoutGrid },
    { id: 'arcade', label: 'Arcade', icon: Joystick, badge: 'NEW' },
    { id: 'search', label: 'Search', icon: Search },
  ];

  return (
    <aside className="hidden md:flex w-64 flex-col justify-between border-r border-white/10 bg-black/60 backdrop-blur-2xl p-5 sticky top-0 h-screen select-none">
      {/* Brand & Logo */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <AppleStoreIcon size={38} />
          <div>
            <h1 className="text-base font-bold tracking-tight text-[#f5f5f7]">
              App Store
            </h1>
            <p className="text-[11px] text-white/50 font-medium">
              Discover & Download
            </p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          <p className="px-3 text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-2">
            Store
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#0071e3] text-white shadow-sm shadow-blue-500/25'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-white/60'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                      isActive ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Installed Apps count */}
        <div className="px-3.5 py-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between text-xs text-white/60 mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Download className="w-3.5 h-3.5 text-[#0071e3]" />
              Installed Apps
            </span>
            <span className="font-semibold text-white">{installedAppIds.length}</span>
          </div>
          <p className="text-[11px] text-white/40">
            Downloaded to this device
          </p>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="space-y-3">
        {user?.is_admin && (
          <button
            onClick={() => setCurrentTab('admin')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              currentTab === 'admin'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/15'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Panel</span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-white/10 rounded">
              Developer
            </span>
          </button>
        )}

        {/* User profile footer */}
        {user && (
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-[#0071e3] text-white flex items-center justify-center text-xs font-semibold shrink-0">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="truncate">
                <p className="text-xs font-medium text-[#f5f5f7] truncate">
                  {user.name}
                </p>
                <p className="text-[10px] text-white/40 truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <button
              onClick={logoutUser}
              title="Sign Out"
              aria-label="Sign Out"
              className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
