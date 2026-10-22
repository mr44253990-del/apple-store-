import React from 'react';
import { Sparkles, Gamepad2, LayoutGrid, Joystick, Search, ShieldCheck } from 'lucide-react';
import { useAppStore } from '../context/AppContext.tsx';

export const BottomNav: React.FC = () => {
  const { currentTab, setCurrentTab, user } = useAppStore();

  const navItems = [
    { id: 'today', label: 'Today', icon: Sparkles },
    { id: 'games', label: 'Games', icon: Gamepad2 },
    { id: 'apps', label: 'Apps', icon: LayoutGrid },
    { id: 'arcade', label: 'Arcade', icon: Joystick },
    { id: 'search', label: 'Search', icon: Search },
  ] as const;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#f5f5f7]/85 dark:bg-[#161618]/85 backdrop-blur-2xl border-t border-black/[0.08] dark:border-white/[0.08] px-2 py-1.5 flex items-center justify-around safe-area-pb">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setCurrentTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors ${
              isActive ? 'text-[#0071e3]' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'
            }`}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium tracking-tight">{item.label}</span>
          </button>
        );
      })}

      {user?.is_admin && (
        <button
          onClick={() => setCurrentTab('admin')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors ${
            currentTab === 'admin' ? 'text-amber-500 font-bold' : 'text-black/50 dark:text-white/50'
          }`}
        >
          <ShieldCheck className="w-5 h-5 mb-0.5 text-amber-500" />
          <span className="text-[10px] font-medium tracking-tight">Admin</span>
        </button>
      )}
    </nav>
  );
};
