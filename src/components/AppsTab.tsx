import React from 'react';
import { useAppStore } from '../context/AppContext.tsx';
import { GetButton } from './GetButton.tsx';
import { AppIcon } from './AppIcon.tsx';
import { Sparkles, Layers, ShieldCheck, Share2 } from 'lucide-react';

export const AppsTab: React.FC = () => {
  const { apps, setSelectedApp, setSharingApp } = useAppStore();

  const productivityApps = apps.filter(
    (a) => a.category === 'Productivity' || a.category === 'Utilities'
  );
  const mediaApps = apps.filter(
    (a) => a.category === 'Photo & Video' || a.category === 'Social' || a.category === 'Entertainment'
  );

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
          Apps
        </h1>
        <p className="text-xs sm:text-sm text-black/50 dark:text-white/50">
          Transform the way you create, organize, and get things done
        </p>
      </div>

      {productivityApps.length > 0 || mediaApps.length > 0 ? (
        <>
          {productivityApps.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
                  Work Smarter & Faster
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {productivityApps.map((app) => (
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
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            {app.downloads_count.toLocaleString()} dl
                          </span>
                          {app.video_url && (
                            <span className="text-purple-500 font-bold text-[10px]">VIDEO</span>
                          )}
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
            </div>
          )}

          {mediaApps.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
                  Creativity & Media Tools
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mediaApps.map((app) => (
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
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            {app.downloads_count.toLocaleString()} dl
                          </span>
                          {app.video_url && (
                            <span className="text-purple-500 font-bold text-[10px]">VIDEO</span>
                          )}
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
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 p-8 bg-white dark:bg-[#1c1c1e] rounded-3xl border border-black/5 dark:border-white/10 space-y-3">
          <Layers className="w-10 h-10 mx-auto text-black/30 dark:text-white/30" />
          <h3 className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
            No Applications Published Yet
          </h3>
          <p className="text-xs text-black/50 dark:text-white/50 max-w-sm mx-auto">
            Add productivity, photography, and utility apps in App Store Connect Admin.
          </p>
        </div>
      )}
    </div>
  );
};
