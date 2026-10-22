import React, { useState } from 'react';
import { useAppStore } from '../context/AppContext.tsx';
import { GetButton } from './GetButton.tsx';
import { Gamepad2, Trophy, Star } from 'lucide-react';

export const GamesTab: React.FC = () => {
  const { apps, setSelectedApp } = useAppStore();
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('All');

  const gameApps = apps.filter((a) => a.category === 'Games' || a.category === 'Arcade');
  const allSubCategories = ['All', 'Action', 'RPG', 'Strategy', 'Casual', 'Adventure'];

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
          Games
        </h1>
        <p className="text-xs sm:text-sm text-black/50 dark:text-white/50">
          World-class mobile gaming with direct installation
        </p>
      </div>

      {/* Categories chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {allSubCategories.map((sub) => (
          <button
            key={sub}
            onClick={() => setSelectedSubCategory(sub)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
              selectedSubCategory === sub
                ? 'bg-[#0071e3] text-white shadow-sm'
                : 'bg-black/[0.04] dark:bg-white/[0.06] text-black/70 dark:text-white/70 hover:bg-black/[0.08]'
            }`}
          >
            {sub}
          </button>
        ))}
      </div>

      {/* Top Charts Ranked list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
              Top Charts
            </h2>
          </div>
        </div>

        {gameApps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gameApps.map((app, index) => (
              <div
                key={app.id}
                onClick={() => setSelectedApp(app)}
                className="p-4 rounded-2xl bg-white dark:bg-[#1c1c1e] border border-black/5 dark:border-white/10 hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3.5 overflow-hidden">
                  <span className="text-lg font-black text-black/30 dark:text-white/30 w-5 text-center shrink-0">
                    {index + 1}
                  </span>
                  <div className="w-14 h-14 rounded-[22%] overflow-hidden bg-black/5 dark:bg-white/5 shrink-0 shadow-xs border border-black/5 dark:border-white/10">
                    <img
                      src={app.icon_url}
                      alt={app.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="text-sm font-bold text-[#1d1d1f] dark:text-[#f5f5f7] truncate">
                      {app.name}
                    </h3>
                    <p className="text-xs text-black/50 dark:text-white/50 truncate">
                      {app.subtitle}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-black/40 dark:text-white/40">
                      <span className="flex items-center gap-0.5 text-amber-500 font-medium">
                        ★ {app.rating.toFixed(1)}
                      </span>
                      <span>•</span>
                      <span>{app.file_size}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                  <GetButton app={app} size="sm" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 p-8 bg-white dark:bg-[#1c1c1e] rounded-3xl border border-black/5 dark:border-white/10 space-y-3">
            <Gamepad2 className="w-10 h-10 mx-auto text-black/30 dark:text-white/30" />
            <h3 className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
              No Games Published Yet
            </h3>
            <p className="text-xs text-black/50 dark:text-white/50 max-w-sm mx-auto">
              Publish games via App Store Connect Admin with direct download file links.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
