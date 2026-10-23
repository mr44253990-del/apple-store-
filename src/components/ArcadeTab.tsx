import React from 'react';
import { useAppStore } from '../context/AppContext.tsx';
import { GetButton } from './GetButton.tsx';
import { AppIcon } from './AppIcon.tsx';
import { Joystick, Flame, Shield, Play, Share2 } from 'lucide-react';

export const ArcadeTab: React.FC = () => {
  const { apps, setSelectedApp, setSharingApp } = useAppStore();

  const arcadeApps = apps.filter((a) => a.category === 'Arcade' || a.category === 'Games');

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Apple Arcade Branding Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 bg-gradient-to-br from-[#e52d27] to-[#b31217] text-white shadow-xl shadow-red-500/20">
        <div className="max-w-xl space-y-4 relative z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md">
              <Joystick className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-black tracking-widest uppercase">
              Apple Arcade
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Unlimited Play. Zero Ads. No In-App Purchases.
          </h1>
          <p className="text-sm sm:text-base text-white/90 font-medium">
            Discover extraordinary games crafted by the world’s most innovative developers.
          </p>
        </div>

        {/* Decorative circle */}
        <div className="absolute -right-12 -bottom-12 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      </div>

      {/* Featured Arcade Titles */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
          Arcade Originals &amp; Greats
        </h2>

        {arcadeApps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {arcadeApps.map((app) => (
              <div
                key={app.id}
                onClick={() => setSelectedApp(app)}
                className="p-4 rounded-2xl bg-white dark:bg-[#1c1c1e] border border-black/5 dark:border-white/10 hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <AppIcon name={app.name} iconUrl={app.icon_url} size="md" />
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
                      <span className="text-red-500 font-semibold">Arcade</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => setSharingApp(app)}
                    className="p-1.5 rounded-xl hover:bg-black/[0.06] dark:hover:bg-white/[0.1] text-black/50 dark:text-white/50 hover:text-sky-500 transition-colors"
                    title="Share App Link & QR"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                  <GetButton app={app} size="sm" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 p-8 bg-white dark:bg-[#1c1c1e] rounded-3xl border border-black/5 dark:border-white/10 space-y-3">
            <Joystick className="w-10 h-10 mx-auto text-red-500/50" />
            <h3 className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
              No Arcade Games Published Yet
            </h3>
            <p className="text-xs text-black/50 dark:text-white/50 max-w-sm mx-auto">
              Add games in the Arcade category from the App Store Connect Admin panel.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
