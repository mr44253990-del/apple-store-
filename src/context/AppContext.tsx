import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AppItem, ReviewItem, UserProfile, AppSettings } from '../types.ts';
import { INITIAL_APPS, INITIAL_REVIEWS } from '../data/seedApps.ts';
import { getSupabase, signOutFromSupabase } from '../lib/supabase.ts';
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
  // Handlers
  setSelectedApp: (app: AppItem | null) => void;
  setCurrentTab: (tab: 'today' | 'games' | 'apps' | 'arcade' | 'search' | 'admin') => void;
  setSearchQuery: (query: string) => void;
  setSelectedTag: (tag: string | null) => void;
  setIsLoginModalOpen: (open: boolean) => void;
  setUserDirectly: (user: UserProfile | null) => void;
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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load apps: remove previous mock demo apps if present
  const [apps, setApps] = useState<AppItem[]>(() => {
    const saved = localStorage.getItem('appstore_apps_data_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    // Clean start without mock demo data
    localStorage.removeItem('appstore_apps_data');
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
    localStorage.removeItem('appstore_reviews_data');
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
          avatar_url: isAdmin ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' : undefined,
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
          avatar_url: isAdmin ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' : undefined,
        });
      } else {
        // Only clear if not manually stored admin
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

  // Attempt Supabase Apps Fetch on mount
  const refreshFromSupabase = async () => {
    try {
      setIsLoadingCloud(true);
      const client = getSupabase();
      const { data, error } = await client.from('apps').select('*').order('created_at', { ascending: false });
      
      if (!error && data) {
        setApps(data as AppItem[]);
        setCloudSyncStatus('synced');
      } else {
        setCloudSyncStatus('local');
      }
    } catch (err) {
      console.warn('Supabase fetch notice, using active state:', err);
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

    setApps((prev) => [newApp, ...prev]);

    try {
      const client = getSupabase();
      await client.from('apps').insert([newApp]);
    } catch (err) {
      console.warn('Supabase cloud insert queued locally:', err);
    }

    return newApp;
  };

  const updateApp = async (updatedApp: AppItem) => {
    setApps((prev) => prev.map((app) => (app.id === updatedApp.id ? updatedApp : app)));
    if (selectedApp && selectedApp.id === updatedApp.id) {
      setSelectedApp(updatedApp);
    }

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

        setApps((prev) =>
          prev.map((a) => (a.id === app.id ? { ...a, downloads_count: (a.downloads_count || 0) + 1 } : a))
        );

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
        setSelectedApp,
        setCurrentTab,
        setSearchQuery,
        setSelectedTag,
        setIsLoginModalOpen,
        setUserDirectly,
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
