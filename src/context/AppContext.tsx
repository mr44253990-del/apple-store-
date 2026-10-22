import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AppItem, ReviewItem, UserProfile, AppSettings } from '../types.ts';
import { INITIAL_APPS, INITIAL_REVIEWS } from '../data/seedApps.ts';

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
  cloudErrorNotice: string | null;
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
  refreshFromCloud: () => Promise<void>;
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
  site_title: 'App Store - Discover & Download Real Apps',
  site_description: 'Discover, download, and manage real applications. Publish your own apps with direct file links. Dark & Light theme support.',
  theme_mode: 'dark',
  custom_download_message: 'Your download has begun. Enjoy your application!',
  auto_black_skin: true,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to get local custom published apps safely
function getLocalPublishedApps(): AppItem[] {
  try {
    const saved = localStorage.getItem('appstore_published_apps_v3');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error reading local published apps:', e);
  }
  return [];
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
  const [apps, setApps] = useState<AppItem[]>(() => {
    const published = getLocalPublishedApps();
    if (published.length > 0) return published;
    const saved = localStorage.getItem('appstore_apps_data_v3');
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
    const saved = localStorage.getItem('appstore_reviews_data_v3');
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
    const saved = localStorage.getItem('appstore_settings_data_v3');
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
    const saved = localStorage.getItem('appstore_user_data_v3');
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
    const saved = localStorage.getItem('appstore_installed_apps_v3');
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
  const [cloudErrorNotice, setCloudErrorNotice] = useState<string | null>(null);

  // Persistence: apps
  useEffect(() => {
    localStorage.setItem('appstore_apps_data_v3', JSON.stringify(apps));
    const published = getLocalPublishedApps();
    const merged = [...new Map([...published, ...apps].map(a => [a.id, a])).values()];
    localStorage.setItem('appstore_published_apps_v3', JSON.stringify(merged));
  }, [apps]);

  // Persistence: reviews
  useEffect(() => {
    localStorage.setItem('appstore_reviews_data_v3', JSON.stringify(reviews));
  }, [reviews]);

  // Persistence: settings + theme + SEO meta
  useEffect(() => {
    localStorage.setItem('appstore_settings_data_v3', JSON.stringify(settings));

    // Apply theme class
    if (settings.theme_mode === 'dark' || (settings.theme_mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Inject Google Search Console verification meta tag
    const meta = document.getElementById('gsc-verification') as HTMLMetaElement | null;
    if (meta && settings.google_search_console_token) {
      meta.setAttribute('content', settings.google_search_console_token);
    }

    // Update page SEO based on current context
    updatePageSEOImpl();
  }, [settings, apps, selectedApp]);

  // Persistence: user
  useEffect(() => {
    if (user) {
      localStorage.setItem('appstore_user_data_v3', JSON.stringify(user));
    } else {
      localStorage.removeItem('appstore_user_data_v3');
    }
  }, [user]);

  // Persistence: installed apps
  useEffect(() => {
    localStorage.setItem('appstore_installed_apps_v3', JSON.stringify(installedAppIds));
  }, [installedAppIds]);

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

      // Inject JSON-LD SoftwareApplication schema
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

      // Remove per-app JSON-LD, keep site-level ItemList
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
    let script = document.getElementById('site-json-ld') as HTMLScriptElement | null;
    // Remove old per-app schema if present
    const oldApp = document.getElementById('app-json-ld');
    if (oldApp) oldApp.remove();

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
    localStorage.setItem('appstore_user_data_v3', JSON.stringify(updated));
  };

  const logoutUser = async () => {
    setUser(null);
    localStorage.removeItem('appstore_user_data_v3');
    if (currentTab === 'admin') {
      setCurrentTab('today');
    }
  };

  const clearAllDemoData = () => {
    setApps([]);
    setReviews({});
    localStorage.removeItem('appstore_apps_data_v3');
    localStorage.removeItem('appstore_apps_data_v2');
    localStorage.removeItem('appstore_published_apps_v3');
    localStorage.removeItem('appstore_published_apps_v2');
    localStorage.removeItem('appstore_reviews_data_v3');
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

    // Save to local published apps list
    const currentLocal = getLocalPublishedApps();
    const updatedLocal = [newApp, ...currentLocal.filter(a => a.id !== newApp.id)];
    localStorage.setItem('appstore_published_apps_v3', JSON.stringify(updatedLocal));

    // Update reactive state
    setApps((prev) => [newApp, ...prev.filter(a => a.id !== newApp.id)]);

    return newApp;
  };

  const updateApp = async (updatedApp: AppItem) => {
    // Ensure slug & canonical url are kept in sync
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
    localStorage.setItem('appstore_published_apps_v3', JSON.stringify(updatedLocal));
  };

  const deleteApp = async (id: string) => {
    setApps((prev) => prev.filter((app) => app.id !== id));
    if (selectedApp && selectedApp.id === id) {
      setSelectedApp(null);
    }

    const currentLocal = getLocalPublishedApps();
    const updatedLocal = currentLocal.filter((a) => a.id !== id);
    localStorage.setItem('appstore_published_apps_v3', JSON.stringify(updatedLocal));
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
        localStorage.setItem('appstore_published_apps_v3', JSON.stringify(updatedLocal));

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

  const refreshFromCloud = async () => {
    // Cloud/Supabase removed as requested; data stays in localStorage
    setCloudSyncStatus('local');
    setCloudErrorNotice(null);
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
        cloudErrorNotice,
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
        refreshFromCloud,
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
