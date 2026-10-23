import React from 'react';
import { useAppStore } from '../context/AppContext.tsx';
import { GetButton } from './GetButton.tsx';
import { AppleStoreIcon } from './AppleStoreIcon.tsx';
import { AppIcon } from './AppIcon.tsx';
import { Sparkles, Star, Download, ChevronRight, PlusCircle, ShieldCheck, Share2 } from 'lucide-react';

export const TodayTab: React.FC = () => {
  const { apps, setSelectedApp, setSelectedTag, setCurrentTab, user, setIsLoginModalOpen, setSharingApp } = useAppStore();

  const appOfTheDay = apps.find((a) => a.is_app_of_the_day) || apps[0];
  const featuredApps = apps.filter((a) => a.id !== appOfTheDay?.id).slice(0, 6);

  const todayDateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).toUpperCase();

  const trendingTags = [
    '#productivity',
    '#photoeditor',
    '#games',
    '#arcade',
    '#flighttracker',
    '#ai',
    '#drawing',
    '#videoeditor',
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Date Header */}
      <div className="space-y-1">
        <p className="text-xs font-bold uppercase tracking-wider text-black/50 dark:text-white/50">
          {todayDateString}
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
          Today
        </h1>
      </div>

      {/* Trending Tags Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-semibold text-black/40 dark:text-white/40 shrink-0">
          Trending:
        </span>
        {trendingTags.map((tag) => (
          <button
            key={tag}
            onClick={() => {
              setSelectedTag(tag);
              setCurrentTab('search');
            }}
            className="px-3 py-1 rounded-full text-xs font-medium bg-black/[0.04] dark:bg-white/[0.06] hover:bg-[#0071e3]/10 hover:text-[#0071e3] text-black/70 dark:text-white/70 transition-all shrink-0 cursor-pointer active:scale-95"
          >
            {tag}
          </button>
        ))}
      </div>

      {/* When no apps exist yet */}
      {apps.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#1c1c1e] border border-black/5 dark:border-white/10 shadow-sm text-center space-y-5">
          <div className="flex justify-center">
            <AppleStoreIcon size={64} />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h2 className="text-2xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
              Welcome to App Store
            </h2>
            <p className="text-sm text-black/60 dark:text-white/60">
              Demo applications deleted as requested. The store is clean, connected to Supabase, and ready for your real applications.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {user?.is_admin ? (
              <button
                onClick={() => setCurrentTab('admin')}
                className="px-6 py-2.5 rounded-2xl bg-[#0071e3] text-white font-semibold text-sm hover:bg-[#0077ed] transition-all flex items-center gap-2 shadow-md shadow-blue-500/20 active:scale-98"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Publish Your First App in Admin Panel</span>
              </button>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-6 py-2.5 rounded-2xl bg-[#0071e3] text-white font-semibold text-sm hover:bg-[#0077ed] transition-all flex items-center gap-2 shadow-md shadow-blue-500/20 active:scale-98"
              >
                <AppleStoreIcon size={20} />
                <span>Sign in with Apple ID</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* APP OF THE DAY HERO CARD */}
          {appOfTheDay && (
            <div
              onClick={() => setSelectedApp(appOfTheDay)}
              className="group relative rounded-3xl overflow-hidden cursor-pointer shadow-xl shadow-black/10 dark:shadow-black/40 border border-black/5 dark:border-white/10 transition-transform duration-300 hover:scale-[1.01] active:scale-[0.99] bg-[#1c1c1e]"
            >
              <div className="relative h-96 sm:h-[460px] w-full overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
                {appOfTheDay.screenshots && appOfTheDay.screenshots.length > 0 ? (
                  <img
                    src={appOfTheDay.screenshots[0]}
                    alt={appOfTheDay.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-30">
                    <AppIcon name={appOfTheDay.name} size="xl" className="scale-150" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                
                <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider border border-white/10">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>APP OF THE DAY</span>
                </div>

                <div className="absolute top-6 right-6 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSharingApp(appOfTheDay);
                    }}
                    className="p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white text-xs border border-white/10 transition-colors"
                    title="Share App Link & QR Code"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4 text-white">
                  <div className="flex items-center gap-4">
                    <AppIcon name={appOfTheDay.name} iconUrl={appOfTheDay.icon_url} size="lg" className="border border-white/20 shadow-xl" />
                    <div className="space-y-1">
                      <h2 className="text-xl sm:text-2xl font-bold tracking-tight leading-tight">
                        {appOfTheDay.name}
                      </h2>
                      <p className="text-xs sm:text-sm text-white/80 font-medium line-clamp-1">
                        {appOfTheDay.subtitle}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-white/60">
                        <span className="flex items-center gap-1 text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          {appOfTheDay.rating.toFixed(1)}
                        </span>
                        <span>•</span>
                        <span className="text-emerald-400 font-medium">
                          {appOfTheDay.downloads_count.toLocaleString()} downloads
                        </span>
                        <span>•</span>
                        <span>{appOfTheDay.category}</span>
                        {appOfTheDay.video_url && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-300 text-[10px] font-bold">
                            VIDEO
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setSharingApp(appOfTheDay)}
                      className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white transition-colors"
                      title="Share Link"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <GetButton
                      app={appOfTheDay}
                      size="lg"
                      className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-md border border-white/20"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* EDITORS' CHOICE / ESSENTIAL APPS ROW */}
          {featuredApps.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
                    Essential Daily Apps
                  </h2>
                  <p className="text-xs text-black/50 dark:text-white/50">
                    Hand-picked for speed, design, and direct download
                  </p>
                </div>
                <button
                  onClick={() => setCurrentTab('apps')}
                  className="flex items-center gap-1 text-xs font-semibold text-[#0071e3] hover:underline"
                >
                  <span>See All</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredApps.map((app) => (
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
      )}
    </div>
  );
};
