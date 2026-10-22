/** @license SPDX-License-Identifier: Apache-2.0 */

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { AppProvider, useAppStore } from './context/AppContext.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { Header } from './components/Header.tsx';
import { BottomNav } from './components/BottomNav.tsx';
import { TodayTab } from './components/TodayTab.tsx';
import { GamesTab } from './components/GamesTab.tsx';
import { AppsTab } from './components/AppsTab.tsx';
import { ArcadeTab } from './components/ArcadeTab.tsx';
import { SearchTab } from './components/SearchTab.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { AppDetailModal } from './components/AppDetailModal.tsx';
import { LoginModal } from './components/LoginModal.tsx';

const StoreContent: React.FC = () => {
  const { currentTab, selectedApp, setSelectedApp, apps, settings, user, generateAppLink, copyAppLink } = useAppStore();
  const [pwaInstallPrompt, setPwaInstallPrompt] = useState<any>(null);
  const [showPwaBanner, setShowPwaBanner] = useState(false);

  // Handle direct URL access to app pages (e.g. /app/convo-chat)
  useEffect(() => {
    const handleRoute = () => {
      const path = window.location.pathname;
      const match = path.match(/^\/app\/([^/]+)$/);
      if (match) {
        const slug = match[1];
        const app = apps.find((a) => a.slug === slug || generateAppLink(a).endsWith(`/app/${slug}`));
        if (app) {
          setSelectedApp(app);
        }
      }
    };

    handleRoute();

    // Listen for popstate (browser back/forward)
    window.addEventListener('popstate', handleRoute);
    return () => window.removeEventListener('popstate', handleRoute);
  }, [apps, setSelectedApp, generateAppLink]);

  // PWA install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setPwaInstallPrompt(e as any);
      setShowPwaBanner(true);
      // Auto-hide banner after 10 seconds
      setTimeout(() => setShowPwaBanner(false), 10000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handlePwaInstall = async () => {
    if (pwaInstallPrompt) {
      const result = await pwaInstallPrompt.prompt();
      const choice = result.outcome;
      if (choice === 'accepted') {
        console.log('PWA installed');
      }
      setPwaInstallPrompt(null);
      setShowPwaBanner(false);
    }
  };

  // Dynamic Google SEO Structured Data (JSON-LD)
  useEffect(() => {
    if (settings.auto_google_index) {
      let scriptTag = document.getElementById('app-store-jsonld') as HTMLScriptElement | null;
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'app-store-jsonld';
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }

      const schema = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: settings.site_title,
        description: settings.site_description,
        itemListElement: apps.slice(0, 15).map((app, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'SoftwareApplication',
            name: app.name,
            operatingSystem: 'iOS, iPadOS, macOS',
            applicationCategory: app.category,
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
          },
        })),
      };

      scriptTag.text = JSON.stringify(schema);
    }
  }, [apps, settings]);

  return (
    <div className="flex min-h-screen bg-[#f5f5f7] dark:bg-[#000000] text-[#1d1d1f] dark:text-[#f5f5f7] font-sans transition-colors duration-200">
      {/* PWA Install Banner */}
      {showPwaBanner && pwaInstallPrompt && (
        <div className="fixed bottom-6 left-4 right-4 md:bottom-8 md:left-1/2 md:right-1/2 md:-translate-x-1/2 z-50 flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#1c1c1e] shadow-2xl border border-black/10 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[22%] bg-black/10 shrink-0">
              <svg className="w-full h-full object-cover" viewBox="0 0 120 120" fill="none">
                <rect width="120" height="120" rx="27" fill="#2ba3ff" />
                <line x1="32" y1="94" x2="60" y2="27" stroke="white" strokeWidth="11" strokeLinecap="round" />
                <line x1="25" y1="68" x2="95" y2="68" stroke="white" strokeWidth="11" strokeLinecap="round" />
                <line x1="60" y1="27" x2="88" y2="94" stroke="white" strokeWidth="11" strokeLinecap="round" />
                <circle cx="60" cy="27" r="5.5" fill="white" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">Install App Store</h3>
              <p className="text-xs text-black/60 dark:text-white/60">Add App Store to your home screen for quick access.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePwaInstall}
              className="px-4 py-2 rounded-xl bg-[#0071e3] text-white text-xs font-semibold hover:bg-[#0077ed] transition-colors"
            >
              Install
            </button>
            <button
              onClick={() => setShowPwaBanner(false)}
              className="px-2 py-2 rounded-full text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 md:py-8">
          {currentTab === 'today' && <TodayTab />}
          {currentTab === 'games' && <GamesTab />}
          {currentTab === 'apps' && <AppsTab />}
          {currentTab === 'arcade' && <ArcadeTab />}
          {currentTab === 'search' && <SearchTab />}
          {currentTab === 'admin' && (user?.is_admin ? <AdminPanel /> : <TodayTab />)}
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </div>

      {/* Full App Detail View / Modal */}
      {selectedApp && (
        <AppDetailModal app={selectedApp} onClose={() => setSelectedApp(null)} />
      )}

      {/* Apple ID Login Modal */}
      <LoginModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <StoreContent />
    </AppProvider>
  );
}
