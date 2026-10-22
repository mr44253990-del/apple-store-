/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
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
  const { currentTab, selectedApp, setSelectedApp, apps, settings, user } = useAppStore();

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
