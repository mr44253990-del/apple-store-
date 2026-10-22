import React, { useMemo } from 'react';
import { useAppStore } from '../context/AppContext.tsx';
import { GetButton } from './GetButton.tsx';
import { Search, X, Tag, Sparkles, Filter, Hash } from 'lucide-react';

export const SearchTab: React.FC = () => {
  const {
    apps,
    searchQuery,
    setSearchQuery,
    selectedTag,
    setSelectedTag,
    setSelectedApp,
  } = useAppStore();

  const popularTags = [
    '#productivity',
    '#photoeditor',
    '#drawing',
    '#games',
    '#arcade',
    '#flighttracker',
    '#ai',
    '#notion',
    '#freeapp',
    '#social',
    '#videoeditor',
  ];

  const categories = [
    { name: 'Productivity', count: apps.filter((a) => a.category === 'Productivity').length },
    { name: 'Games', count: apps.filter((a) => a.category === 'Games').length },
    { name: 'Photo & Video', count: apps.filter((a) => a.category === 'Photo & Video').length },
    { name: 'Arcade', count: apps.filter((a) => a.category === 'Arcade').length },
    { name: 'Utilities', count: apps.filter((a) => a.category === 'Utilities').length },
    { name: 'Social', count: apps.filter((a) => a.category === 'Social').length },
    { name: 'Finance', count: apps.filter((a) => a.category === 'Finance').length },
    { name: 'Entertainment', count: apps.filter((a) => a.category === 'Entertainment').length },
  ];

  // Accurate multi-factor search matching
  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      // If a tag is selected
      if (selectedTag) {
        const cleanSelected = selectedTag.toLowerCase().replace('#', '');
        const matchesTag = app.tags.some((t) =>
          t.toLowerCase().replace('#', '').includes(cleanSelected)
        );
        if (!matchesTag) return false;
      }

      // If text query is typed
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = app.name.toLowerCase().includes(q);
        const matchesSubtitle = app.subtitle?.toLowerCase().includes(q);
        const matchesDeveloper = app.developer?.toLowerCase().includes(q);
        const matchesCategory = app.category.toLowerCase().includes(q);
        const matchesDescription = app.description?.toLowerCase().includes(q);
        const matchesTags = app.tags.some((t) => t.toLowerCase().includes(q));

        return (
          matchesName ||
          matchesSubtitle ||
          matchesDeveloper ||
          matchesCategory ||
          matchesDescription ||
          matchesTags
        );
      }

      return true;
    });
  }, [apps, searchQuery, selectedTag]);

  const hasFilterActive = searchQuery.trim().length > 0 || selectedTag !== null;

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
          Search
        </h1>
        <p className="text-xs sm:text-sm text-black/50 dark:text-white/50">
          Search over millions of apps, games, stories, and verified # tags
        </p>
      </div>

      {/* Search Input in Page */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40 dark:text-white/40" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search apps, games, categories, #tags..."
          className="w-full pl-12 pr-12 py-3.5 text-base rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] outline-none focus:border-[#0071e3] transition-all shadow-inner"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Active Filter Pill */}
      {selectedTag && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-black/50 dark:text-white/50 font-medium">Filtered by tag:</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0071e3] text-white text-xs font-semibold shadow-xs">
            <Hash className="w-3.5 h-3.5" />
            <span>{selectedTag}</span>
            <button
              onClick={() => setSelectedTag(null)}
              className="ml-1 hover:bg-white/20 rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        </div>
      )}

      {/* Discover # Tags Strip */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-black/40 dark:text-white/40">
          <Tag className="w-3.5 h-3.5" />
          <span>Discover with # Tags</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {popularTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedTag === tag
                  ? 'bg-[#0071e3] text-white shadow-sm'
                  : 'bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-black/80 dark:text-white/80'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Search Results */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
            {hasFilterActive ? `Search Results (${filteredApps.length})` : 'All Available Applications'}
          </h2>
          {hasFilterActive && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTag(null);
              }}
              className="text-xs text-[#0071e3] hover:underline font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>

        {filteredApps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredApps.map((app) => (
              <div
                key={app.id}
                onClick={() => setSelectedApp(app)}
                className="p-4 rounded-2xl bg-white dark:bg-[#1c1c1e] border border-black/5 dark:border-white/10 hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
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
                      <span className="truncate">{app.category}</span>
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
          <div className="text-center py-12 space-y-3 bg-black/[0.02] dark:bg-white/[0.02] rounded-3xl border border-dashed border-black/10 dark:border-white/10">
            <Search className="w-10 h-10 mx-auto text-black/30 dark:text-white/30" />
            <h3 className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
              No Applications Found
            </h3>
            <p className="text-xs text-black/50 dark:text-white/50 max-w-sm mx-auto">
              We couldn&apos;t find any app matching &ldquo;{searchQuery || selectedTag}&rdquo;. Try another keyword or explore categories below.
            </p>
          </div>
        )}
      </div>

      {/* Explore Categories Grid */}
      <div className="space-y-3 pt-6 border-t border-black/[0.06] dark:border-white/[0.08]">
        <h3 className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
          Browse Categories
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categories.map((c) => (
            <button
              key={c.name}
              onClick={() => setSearchQuery(c.name)}
              className="p-4 rounded-2xl bg-white dark:bg-[#1c1c1e] border border-black/5 dark:border-white/10 hover:border-[#0071e3] transition-all text-left group"
            >
              <div className="text-sm font-bold text-[#1d1d1f] dark:text-[#f5f5f7] group-hover:text-[#0071e3] transition-colors">
                {c.name}
              </div>
              <div className="text-xs text-black/40 dark:text-white/40 mt-1">
                {c.count} applications
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
