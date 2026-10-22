import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AppItem, ReviewItem, UserProfile, AppSettings } from '../types.ts';
import { INITIAL_APPS, INITIAL_REVIEWS } from '../data/seedApps.ts';
import {
  getSupabase,
  signOutFromSupabase,
  incrementAppDownloadInSupabase,
  updateUserProfileMetadata,
} from '../lib/supabase.ts';
import confetti from 'canvas-confetti';

interface AppContextType {
  apps: AppItem[];
  reviews: Record<string, ReviewItem[]>;
  selectedApp: AppItem | null;
  currentTab: 'today' | 'games' | 'apps' | 'arcade' | 'search' | 'admin';
  searchQuery: string;
  selectedTag: string | null;
  user: UserProfile | null;
  settings: AppSettings;
  isLoginModalOpen: boolean;
  downloadingAppId: string | null;
  downloadProgress: number;
  installedAppIds: string[];
  isLoadingCloud: boolean;
  cloudSyncStatus: 'synced' | 'local' | 'error';
  supabaseErrorNotice: string | null;
  // Handlers
  setSelectedApp: (app: AppItem | null) => void;
  setCurrentTab: (tab: 'today' | 'games' | 'apps' | 'arcade' | 'search' | 'admin') => void;
  setSearchQuery: (query: string) => void;
  setSelectedTag: (tag: string | null) => void;
  setIsLoginModalOpen: (open: boolean) => void;
  setUserDirectly: (user: UserProfile | null) => void;
  updateUserAvatar: (avatarUrl: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  addApp: (appData: Omit<AppItem, 'id' | 'created_at' | 'downloads_count'>) => Promise<AppItem>;
  updateApp: (app: AppItem) => Promise<void>;
  deleteApp: (id: string) => Promise<void>;
  addReview: (reviewData: { appId: string; author: string; rating: number; title: string; comment: string }) => Promise<void>;
  triggerDownload: (app: AppItem) => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  refreshFromSupabase: () => Promise<void>;
  clearAllDemoData: () => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  google_search_console_token: '',
  auto_google_index: true,
  site_title: 'App Store - Discover & Download Apps',
  site_description: 'Discover great apps, games, and stories on the Apple App Store.',
  accent_color: 'blue',
  theme_mode: 'dark',
  custom_download_message: 'Your download has begun. Enjoy your application!',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to get local custom published apps safely
function getLocalPublishedApps(): AppItem[] {
  try {
    const saved = localStorage.getItem('appstore_published_apps_v2');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error reading local published apps:', e);
  }
  return [];
}

// Resilient remote Supabase insertion helper that falls back gracefully if remote schema is missing newly added columns
async function resilientInsertApp(client: any, app: AppItem): Promise<{ ok: boolean; error?: any }> {
  try {
    const { error } = await client.from('apps').insert([app]);
    if (!error) return { ok: true };

    const errMsg = (error.message || '').toLowerCase();
    if (errMsg.includes('column') || errMsg.includes('schema') || errMsg.includes('does not exist')) {
      // Retry without newer columns in case user hasn't run the latest migration SQL yet
      const { video_url, compatibility, languages, downloads_count, release_notes, ...fallbackApp } = app as any;
      const retry = await client.from('apps').insert([fallbackApp]);
      if (!retry.error) return { ok: true };
      return { ok: false, error: retry.error };
    }

    return { ok: false, error };
  } catch (err) {
    return { ok: false, error: err };
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial apps from persistent local published apps storage first
  const [apps, setApps] = useState<AppItem[]>(() => {
    const published = getLocalPublishedApps();
    if (published.length > 0) {
      return published;
    }
    const saved = localStorage.getItem('appstore_apps_data_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_APPS;
  });

  const [reviews, setReviews] = useState<Record<string, ReviewItem[]>>(() => {
    const saved = localStorage.getItem('appstore_reviews_data_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_REVIEWS;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('appstore_settings_data');
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('appstore_user_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  });

  const [installedAppIds, setInstalledAppIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('appstore_installed_apps');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);
  const [currentTab, setCurrentTab] = useState<'today' | 'games' | 'apps' | 'arcade' | 'search' | 'admin'>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [downloadingAppId, setDownloadingAppId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isLoadingCloud, setIsLoadingCloud] = useState(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'local' | 'error'>('local');
  const [supabaseErrorNotice, setSupabaseErrorNotice] = useState<string | null>(null);

  // Persistence to local storage
  useEffect(() => {
    localStorage.setItem('appstore_apps_data_v2', JSON.stringify(apps));
  }, [apps]);

  useEffect(() => {
    localStorage.setItem('appstore_reviews_data_v2', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('appstore_settings_data', JSON.stringify(settings));
    if (settings.theme_mode === 'dark' || (settings.theme_mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (settings.google_search_console_token) {
      let meta = document.querySelector('meta[name="google-site-verification"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'google-site-verification');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', settings.google_search_console_token);
    }
  }, [settings]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('appstore_user_data', JSON.stringify(user));
    } else {
      localStorage.removeItem('appstore_user_data');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('appstore_installed_apps', JSON.stringify(installedAppIds));
  }, [installedAppIds]);

  // Real Supabase Auth Listener
  useEffect(() => {
    const client = getSupabase();
    // Check active session
    client.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const email = session.user.email?.toLowerCase() || '';
        const isAdmin = email === 'mr4425390@gmail.com';
        setUser({
          id: session.user.id,
          email,
          name: session.user.user_metadata?.full_name || (isAdmin ? 'Admin Developer' : email.split('@')[0]),
          is_admin: isAdmin,
          avatar_url: session.user.user_metadata?.avatar_url || (isAdmin ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' : undefined),
        });
      }
    }).catch(err => {
      console.warn('Supabase getSession notice:', err);
    });

    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const email = session.user.email?.toLowerCase() || '';
        const isAdmin = email === 'mr4425390@gmail.com';
        setUser({
          id: session.user.id,
          email,
          name: session.user.user_metadata?.full_name || (isAdmin ? 'Admin Developer' : email.split('@')[0]),
          is_admin: isAdmin,
          avatar_url: session.user.user_metadata?.avatar_url || (isAdmin ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' : undefined),
        });
      } else {
        const stored = localStorage.getItem('appstore_user_data');
        if (!stored) {
          setUser(null);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Resilient Supabase Apps Fetch & Merge on mount
  const refreshFromSupabase = async () => {
    try {
      setIsLoadingCloud(true);
      const client = getSupabase();
      const { data, error } = await client.from('apps').select('*').order('created_at', { ascending: false });
      
      const localPublished = getLocalPublishedApps();

      if (!error && data && Array.isArray(data)) {
        // Build deduplicated merge map: Supabase remote data + locally published data
        const mergedMap = new Map<string, AppItem>();
        // Add remote apps
        data.forEach((app: any) => {
          mergedMap.set(app.id, app as AppItem);
        });
        // Preserve local published apps that might not have reached Supabase yet
        localPublished.forEach((app: AppItem) => {
          if (!mergedMap.has(app.id)) {
            mergedMap.set(app.id, app);
            // Attempt to background insert into remote Supabase with automatic schema fallback
            resilientInsertApp(client, app).then(({ ok, error: syncErr }) => {
              if (!ok && syncErr) {
                console.warn('Background sync of local app to Supabase notice:', syncErr?.message || syncErr);
              }
            });
          }
        });

        const finalMerged = Array.from(mergedMap.values()).sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setApps(finalMerged);
        setCloudSyncStatus('synced');
        setSupabaseErrorNotice(null);
      } else {
        // If Supabase query failed or table doesn't exist yet, NEVER wipe out published apps!
        console.warn('Supabase fetch returned error or empty, keeping local apps:', error?.message);
        if (localPublished.length > 0) {
          setApps(localPublished);
        }
        setCloudSyncStatus('local');
        if (error) {
          setSupabaseErrorNotice(error.message);
        }
      }
    } catch (err: any) {
      console.warn('Supabase fetch exception, keeping active state:', err);
      const localPublished = getLocalPublishedApps();
      if (localPublished.length > 0) {
        setApps(localPublished);
      }
      setCloudSyncStatus('local');
    } finally {
      setIsLoadingCloud(false);
    }
  };

  useEffect(() => {
    refreshFromSupabase();
  }, []);

  const setUserDirectly = (newUser: UserProfile | null) => {
    setUser(newUser);
    if (newUser?.is_admin) {
      setCurrentTab('admin');
    }
  };

  const updateUserAvatar = async (avatarUrl: string) => {
    if (!user) return;
    const updated = { ...user, avatar_url: avatarUrl };
    setUser(updated);
    localStorage.setItem('appstore_user_data', JSON.stringify(updated));
    await updateUserProfileMetadata({ avatar_url: avatarUrl });
  };

  const logoutUser = async () => {
    try {
      await signOutFromSupabase();
    } catch (e) {
      // ignore
    }
    setUser(null);
    localStorage.removeItem('appstore_user_data');
    if (currentTab === 'admin') {
      setCurrentTab('today');
    }
  };

  const clearAllDemoData = () => {
    setApps([]);
    setReviews({});
    localStorage.removeItem('appstore_apps_data');
    localStorage.removeItem('appstore_apps_data_v2');
    localStorage.removeItem('appstore_published_apps_v2');
    localStorage.removeItem('appstore_reviews_data');
    localStorage.removeItem('appstore_reviews_data_v2');
  };

  const addApp = async (appData: Omit<AppItem, 'id' | 'created_at' | 'downloads_count'>): Promise<AppItem> => {
    const newApp: AppItem = {
      ...appData,
      id: `app_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      downloads_count: 0,
      created_at: new Date().toISOString(),
    };

    // 1. Immediately save to local published apps list to guarantee zero loss on reload
    const currentLocal = getLocalPublishedApps();
    const updatedLocal = [newApp, ...currentLocal.filter(a => a.id !== newApp.id)];
    localStorage.setItem('appstore_published_apps_v2', JSON.stringify(updatedLocal));

    // 2. Update reactive state
    setApps((prev) => [newApp, ...prev.filter(a => a.id !== newApp.id)]);

    // 3. Save to Supabase remote database with resilient schema fallback
    try {
      const client = getSupabase();
      const { ok, error } = await resilientInsertApp(client, newApp);
      if (!ok && error) {
        console.warn('Supabase remote insert notice:', error);
        setSupabaseErrorNotice(`Saved to browser store! Remote Supabase notice: ${error.message || 'Check connection'}. Run SQL Schema from Admin tab if table is not yet created.`);
      } else {
        setCloudSyncStatus('synced');
        setSupabaseErrorNotice(null);
      }
    } catch (err: any) {
      console.warn('Supabase cloud insert exception, safely queued locally:', err);
      setSupabaseErrorNotice(`Saved locally! Supabase error: ${err?.message || 'Network error'}`);
    }

    return newApp;
  };

  const updateApp = async (updatedApp: AppItem) => {
    setApps((prev) => prev.map((app) => (app.id === updatedApp.id ? updatedApp : app)));
    if (selectedApp && selectedApp.id === updatedApp.id) {
      setSelectedApp(updatedApp);
    }

    // Update in local published apps
    const currentLocal = getLocalPublishedApps();
    const updatedLocal = currentLocal.map((a) => (a.id === updatedApp.id ? updatedApp : a));
    localStorage.setItem('appstore_published_apps_v2', JSON.stringify(updatedLocal));

    try {
      const client = getSupabase();
      await client.from('apps').update(updatedApp).eq('id', updatedApp.id);
    } catch (err) {
      console.warn('Supabase cloud update queued locally:', err);
    }
  };

  const deleteApp = async (id: string) => {
    setApps((prev) => prev.filter((app) => app.id !== id));
    if (selectedApp && selectedApp.id === id) {
      setSelectedApp(null);
    }

    // Remove from local published apps
    const currentLocal = getLocalPublishedApps();
    const updatedLocal = currentLocal.filter((a) => a.id !== id);
    localStorage.setItem('appstore_published_apps_v2', JSON.stringify(updatedLocal));

    try {
      const client = getSupabase();
      await client.from('apps').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase cloud delete queued locally:', err);
    }
  };

  const addReview = async (reviewData: { appId: string; author: string; rating: number; title: string; comment: string }) => {
    const newRev: ReviewItem = {
      id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      app_id: reviewData.appId,
      author: reviewData.author,
      rating: reviewData.rating,
      title: reviewData.title,
      comment: reviewData.comment,
      date: 'Just now',
      helpful_count: 0,
    };

    setReviews((prev) => {
      const appReviews = prev[reviewData.appId] || [];
      return {
        ...prev,
        [reviewData.appId]: [newRev, ...appReviews],
      };
    });

    setApps((prev) =>
      prev.map((app) => {
        if (app.id === reviewData.appId) {
          const currentCount = app.rating_count || 0;
          const currentTotal = app.rating * currentCount;
          const newCount = currentCount + 1;
          const newRating = Number(((currentTotal + reviewData.rating) / newCount).toFixed(1));
          return { ...app, rating: newRating, rating_count: newCount };
        }
        return app;
      })
    );

    try {
      const client = getSupabase();
      await client.from('reviews').insert([newRev]);
    } catch (err) {
      console.warn('Supabase review insert queued locally:', err);
    }
  };

  const triggerDownload = (app: AppItem) => {
    if (downloadingAppId === app.id) return;

    setDownloadingAppId(app.id);
    setDownloadProgress(5);

    let progress = 5;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 20) + 15;
      if (progress >= 100) {
        clearInterval(interval);
        setDownloadProgress(100);

        setInstalledAppIds((prev) => (prev.includes(app.id) ? prev : [...prev, app.id]));

        const newDownloadsCount = (app.downloads_count || 0) + 1;

        // Update in state
        setApps((prev) =>
          prev.map((a) => (a.id === app.id ? { ...a, downloads_count: newDownloadsCount } : a))
        );

        // Update in local published apps
        const currentLocal = getLocalPublishedApps();
        const updatedLocal = currentLocal.map((a) =>
          a.id === app.id ? { ...a, downloads_count: newDownloadsCount } : a
        );
        localStorage.setItem('appstore_published_apps_v2', JSON.stringify(updatedLocal));

        // Sync download count to Supabase
        incrementAppDownloadInSupabase(app.id, newDownloadsCount);

        try {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#0071e3', '#30b0c7', '#34c759', '#ff9500', '#af52de'],
          });
        } catch (e) {
          // ignore
        }

        try {
          const link = document.createElement('a');
          link.href = app.download_url;
          link.download = `${app.name.toLowerCase().replace(/\s+/g, '-')}-app`;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (err) {
          console.error('Download execution error:', err);
        }

        setTimeout(() => {
          setDownloadingAppId(null);
          setDownloadProgress(0);
        }, 800);
      } else {
        setDownloadProgress(progress);
      }
    }, 200);
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <AppContext.Provider
      value={{
        apps,
        reviews,
        selectedApp,
        currentTab,
        searchQuery,
        selectedTag,
        user,
        settings,
        isLoginModalOpen,
        downloadingAppId,
        downloadProgress,
        installedAppIds,
        isLoadingCloud,
        cloudSyncStatus,
        supabaseErrorNotice,
        setSelectedApp,
        setCurrentTab,
        setSearchQuery,
        setSelectedTag,
        setIsLoginModalOpen,
        setUserDirectly,
        updateUserAvatar,
        logoutUser,
        addApp,
        updateApp,
        deleteApp,
        addReview,
        triggerDownload,
        updateSettings,
        refreshFromSupabase,
        clearAllDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
}
