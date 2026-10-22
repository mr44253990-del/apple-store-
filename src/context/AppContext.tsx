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
  // Application Link Generator
  generateAppLink: (app: AppItem) => string;
  copyAppLink: (app: AppItem) => void;
  // SEO Helpers
  updatePageSEO: (app?: AppItem) => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  google_search_console_token: '',
  auto_google_index: true,
  site_title: 'App Store - Discover & Download Apps',
  site_description: 'Discover great apps, games, and stories on the Apple App Store.',
  theme_mode: 'dark',
  custom_download_message: 'Your download has begun. Enjoy your application!',
  auto_black_skin: true,
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

const BASE_ORIGIN = typeof window !== 'undefined' ? window.location.origin : '';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function generateAppCanonicalUrl(app: AppItem): string {
  const slug = app.slug || generateSlug(app.name);
  return `${BASE_ORIGIN}/app/${slug}`;
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

    updatePageSEOImpl();
  }, [settings, apps, selectedApp]);

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
    client.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const email = session.user.email?.toLowerCase() || '';
        const isAdmin = email === 'mr4425390@gmail.com';
        setUser({
          id: session.user.id,
          email,
          name: session.user.user_metadata?.full_name || (isAdmin ? 'Admin Developer' : email.split('@')[0]),
          is_admin: isAdmin,
          avatar_url: session.user.user_metadata?.avatar_url || undefined,
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
          avatar_url: session.user.user_metadata?.avatar_url || undefined,
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
        const mergedMap = new Map<string, AppItem>();
        data.forEach((app: any) => {
          mergedMap.set(app.id, app as AppItem);
        });
        localPublished.forEach((app: AppItem) => {
          if (!mergedMap.has(app.id)) {
            mergedMap.set(app.id, app);
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
    const slug = appData.slug || generateSlug(appData.name);
    const canonicalUrl = appData.canonical_url || `${BASE_ORIGIN}/app/${slug}`;

    const newApp: AppItem = {
      ...appData,
      slug,
      canonical_url: canonicalUrl,
      id: `app_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      downloads_count: 0,
      created_at: new Date().toISOString(),
    };

    const currentLocal = getLocalPublishedApps();
    const updatedLocal = [newApp, ...currentLocal.filter(a => a.id !== newApp.id)];
    localStorage.setItem('appstore_published_apps_v2', JSON.stringify(updatedLocal));

    setApps((prev) => [newApp, ...prev.filter(a => a.id !== newApp.id)]);

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
    const appToSave: AppItem = {
      ...updatedApp,
      slug: updatedApp.slug || generateSlug(updatedApp.name),
      canonical_url: updatedApp.canonical_url || `${BASE_ORIGIN}/app/${updatedApp.slug || generateSlug(updatedApp.name)}`,
    };

    setApps((prev) => prev.map((app) => (app.id === appToSave.id ? appToSave : app)));
    if (selectedApp && selectedApp.id === appToSave.id) {
      setSelectedApp(appToSave);
    }

    const currentLocal = getLocalPublishedApps();
    const updatedLocal = currentLocal.map((a) => (a.id === appToSave.id ? appToSave : a));
    localStorage.setItem('appstore_published_apps_v2', JSON.stringify(updatedLocal));

    try {
      const client = getSupabase();
      await client.from('apps').update(appToSave).eq('id', appToSave.id);
    } catch (err) {
      console.warn('Supabase cloud update queued locally:', err);
    }
  };

  const deleteApp = async (id: string) => {
    setApps((prev) => prev.filter((app) => app.id !== id));
    if (selectedApp && selectedApp.id === id) {
      setSelectedApp(null);
    }

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

        setApps((prev) =>
          prev.map((a) => (a.id === app.id ? { ...a, downloads_count: newDownloadsCount } : a))
        );

        const currentLocal = getLocalPublishedApps();
        const updatedLocal = currentLocal.map((a) =>
          a.id === app.id ? { ...a, downloads_count: newDownloadsCount } : a
        );
        localStorage.setItem('appstore_published_apps_v2', JSON.stringify(updatedLocal));

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

  const updatePageSEOImpl = (app?: AppItem) => {
    if (!settings.auto_google_index) return;

    const titleEl = document.getElementById('page-title') as HTMLTitleElement | null;
    const descEl = document.getElementById('page-meta-desc') as HTMLMetaElement | null;
    const ogTitleEl = document.getElementById('og-title') as HTMLMetaElement | null;
    const ogDescEl = document.getElementById('og-desc') as HTMLMetaElement | null;
    const ogUrlEl = document.getElementById('og-url') as HTMLMetaElement | null;
    const ogImageEl = document.getElementById('og-image') as HTMLMetaElement | null;
    const twitterTitleEl = document.getElementById('twitter-title') as HTMLMetaElement | null;
    const twitterDescEl = document.getElementById('twitter-desc') as HTMLMetaElement | null;

    if (app) {
      const canonicalUrl = generateAppCanonicalUrl(app);
      const seoTitle = app.seo_title || `${app.name} - Download ${app.version} | App Store`;
      const seoDesc = app.seo_description || app.subtitle || `${app.name} by ${app.developer}. ${app.description.slice(0, 160)}`;
      const imageUrl = app.icon_url || '';

      if (titleEl) titleEl.text = seoTitle;
      if (descEl) descEl.setAttribute('content', seoDesc);
      if (ogTitleEl) ogTitleEl.setAttribute('content', seoTitle);
      if (ogDescEl) ogDescEl.setAttribute('content', seoDesc);
      if (ogUrlEl) ogUrlEl.setAttribute('content', canonicalUrl);
      if (ogImageEl) ogImageEl.setAttribute('content', imageUrl);
      if (twitterTitleEl) twitterTitleEl.setAttribute('content', seoTitle);
      if (twitterDescEl) twitterDescEl.setAttribute('content', seoDesc);

      injectJsonLd(app, canonicalUrl);
    } else {
      if (titleEl) titleEl.text = settings.site_title;
      if (descEl) descEl.setAttribute('content', settings.site_description);
      if (ogTitleEl) ogTitleEl.setAttribute('content', settings.site_title);
      if (ogDescEl) ogDescEl.setAttribute('content', settings.site_description);
      if (ogUrlEl) ogUrlEl.setAttribute('content', BASE_ORIGIN);
      if (ogImageEl) ogImageEl.setAttribute('content', '');
      if (twitterTitleEl) twitterTitleEl.setAttribute('content', settings.site_title);
      if (twitterDescEl) twitterDescEl.setAttribute('content', settings.site_description);

      injectSiteJsonLd();
    }
  };

  const injectJsonLd = (app: AppItem, canonicalUrl: string) => {
    let script = document.getElementById('app-json-ld') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'app-json-ld';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: app.seo_title || app.name,
      applicationCategory: app.category,
      operatingSystem: 'iOS, iPadOS, macOS, Android',
      applicationSuite: 'App Store',
      author: {
        '@type': 'Person',
        name: app.developer,
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: app.rating,
        ratingCount: app.rating_count,
      },
      offers: {
        '@type': 'Offer',
        price: app.price || 0,
        priceCurrency: 'USD',
      },
      downloadUrl: app.download_url,
      url: canonicalUrl,
      image: app.icon_url,
      screenshot: app.screenshots,
      description: app.seo_description || app.description,
      version: app.version,
      fileSize: app.file_size,
      ageRange: app.age_rating,
    };
    script.text = JSON.stringify(schema);
  };

  const injectSiteJsonLd = () => {
    const oldApp = document.getElementById('app-json-ld');
    if (oldApp) oldApp.remove();

    let script = document.getElementById('site-json-ld') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'site-json-ld';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: settings.site_title,
      description: settings.site_description,
      url: BASE_ORIGIN,
      itemListElement: apps.slice(0, 50).map((app, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'SoftwareApplication',
          name: app.name,
          applicationCategory: app.category,
          downloadUrl: app.download_url,
          url: generateAppCanonicalUrl(app),
          image: app.icon_url,
        },
      })),
    };
    script.text = JSON.stringify(schema);
  };

  // Application Link Generator
  const generateAppLink = (app: AppItem): string => {
    return generateAppCanonicalUrl(app);
  };

  const copyAppLink = (app: AppItem) => {
    const link = generateAppCanonicalUrl(app);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
    }
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
        generateAppLink,
        copyAppLink,
        updatePageSEO: updatePageSEOImpl,
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
