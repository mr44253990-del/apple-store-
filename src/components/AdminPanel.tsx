import React, { useState, useEffect } from 'react';
import { useAppStore } from '../context/AppContext.tsx';
import type { AppItem } from '../types.ts';
import {
  PlusCircle,
  FolderKanban,
  SearchCode,
  UploadCloud,
  Sparkles,
  MessageSquare,
  Check,
  Copy,
  Trash2,
  Edit3,
  ExternalLink,
  ShieldCheck,
  FileCode,
  CheckCircle2,
  Video,
  Film,
  Image as ImageIcon,
  Play,
  Plus,
  Link,
  Sun,
  Moon,
  Globe,
  Settings,
  RotateCcw,
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const {
    apps,
    addApp,
    updateApp,
    deleteApp,
    settings,
    updateSettings,
    user,
    setSelectedApp,
    clearAllDemoData,
    generateAppLink,
    copyAppLink,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'add' | 'manage' | 'seo' | 'linkgen' | 'theme'>('add');

  // Add / Edit App Form State
  const [formData, setFormData] = useState({
    name: '',
    subtitle: '',
    category: 'Productivity',
    developer: 'Developer',
    developer_email: '',
    version: '1.0.0',
    file_size: '45.0 MB',
    price: 0,
    age_rating: '4+',
    download_url: '',
    icon_url: '',
    screenshots: [] as string[],
    video_url: '',
    description: '',
    whats_new: '',
    tagsText: '',
    seo_title: '',
    seo_description: '',
    slug: '',
    in_app_purchases: false,
    is_featured: false,
    is_app_of_the_day: false,
    is_editors_choice: false,
  });

  const [screenshotInput, setScreenshotInput] = useState('');
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isUploadingScreenshots, setIsUploadingScreenshots] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState('');
  const [screenshotUploadMessage, setScreenshotUploadMessage] = useState('');
  const [videoUploadMessage, setVideoUploadMessage] = useState('');
  const [formSuccessMessage, setFormSuccessMessage] = useState('');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const categories = [
    'Productivity',
    'Games',
    'Photo & Video',
    'Social',
    'Entertainment',
    'Utilities',
    'Finance',
    'Arcade',
  ];

  // Auto-generate slug, seo_title, seo_description from name
  useEffect(() => {
    if (!formData.slug && formData.name.trim()) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData((prev) => ({ ...prev, slug }));
    }
    if (!formData.seo_title && formData.name.trim()) {
      setFormData((prev) => ({ ...prev, seo_title: `${prev.name} - Download | App Store` }));
    }
    if (!formData.seo_description && formData.name.trim()) {
      setFormData((prev) => ({
        ...prev,
        seo_description: `${prev.name} by ${prev.developer}. Download ${prev.version} now.`,
      }));
    }
  }, [formData.name, formData.developer, formData.version]);

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingFile(true);
    setUploadSuccessMessage('');
    try {
      const dataUrl = await fileToDataUrl(file);
      const calculatedSize = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      setFormData((prev) => ({
        ...prev,
        download_url: dataUrl,
        file_size: calculatedSize,
      }));
      setUploadSuccessMessage(`আপলোড সফল: "${file.name}" (${calculatedSize})`);
    } catch (err: any) {
      alert(`আপলোড ত্রুটি: ${err?.message || 'বিফল হলো'}`);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const iconUrl = await fileToDataUrl(file);
      setFormData((prev) => ({ ...prev, icon_url: iconUrl }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingScreenshots(true);
    try {
      const uploaded: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await fileToDataUrl(files[i]);
        uploaded.push(url);
      }
      setFormData((prev) => ({
        ...prev,
        screenshots: [...prev.screenshots, ...uploaded],
      }));
      setScreenshotUploadMessage(`${files.length}টি স্ক্রিনশট যোগ করা হলো!`);
      setTimeout(() => setScreenshotUploadMessage(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploadingScreenshots(false);
    }
  };

  const handleAddScreenshotUrl = () => {
    if (!screenshotInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      screenshots: [...prev.screenshots, screenshotInput.trim()],
    }));
    setScreenshotInput('');
  };

  const handleRemoveScreenshot = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      screenshots: prev.screenshots.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingVideo(true);
    try {
      const url = await fileToDataUrl(file);
      setFormData((prev) => ({ ...prev, video_url: url }));
      setVideoUploadMessage(`ভিডিও আপলোড সফল: "${file.name}"`);
      setTimeout(() => setVideoUploadMessage(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleCreateApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.download_url.trim()) {
      alert('অ্যাপের নাম এবং ডাউনলোড লিংক/ফাইল দিন।');
      return;
    }

    const tagsArray = formData.tagsText
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((t) => (t.startsWith('#') ? t : `#${t}`));

    const finalSlug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
    const canonicalUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/app/${finalSlug}`;

    const newApp = await addApp({
      name: formData.name.trim(),
      subtitle: formData.subtitle.trim(),
      description: formData.description.trim() || `${formData.name} একটি উচ্চ-পারফরম্যান্স অ্যাপ্লিকেশন।`,
      icon_url: formData.icon_url,
      download_url: formData.download_url,
      file_size: formData.file_size || '45.0 MB',
      version: formData.version || '1.0.0',
      developer: formData.developer || 'Developer',
      developer_email: formData.developer_email,
      category: formData.category,
      rating: 4.9,
      rating_count: 0,
      price: Number(formData.price) || 0,
      age_rating: formData.age_rating,
      screenshots: formData.screenshots,
      video_url: formData.video_url.trim() ? formData.video_url.trim() : undefined,
      tags: tagsArray,
      whats_new: formData.whats_new || 'প্রথম সংস্করণ মুক্তি পেয়েছে।',
      in_app_purchases: formData.in_app_purchases,
      is_editors_choice: formData.is_editors_choice,
      is_featured: formData.is_featured,
      is_app_of_the_day: formData.is_app_of_the_day,
      compatibility: 'iOS 16.0 বা তার পরবর্তী। iPhone, iPad এবং Mac এর সাথে সुसঙ্গত।',
      languages: ['English', 'Bengali'],
      slug: finalSlug,
      canonical_url: canonicalUrl,
    });

    setFormSuccessMessage(`অ্যাপলিকেশন "${formData.name}" প্রকাশিত করা হয়েছে।`);
    setTimeout(() => setFormSuccessMessage(''), 5000);

    // Reset form with clean defaults (no demo images)
    setFormData({
      name: '',
      subtitle: '',
      category: 'Productivity',
      developer: 'Developer',
      developer_email: '',
      version: '1.0.0',
      file_size: '45.0 MB',
      price: 0,
      age_rating: '4+',
      download_url: '',
      icon_url: '',
      screenshots: [],
      video_url: '',
      description: '',
      whats_new: '',
      tagsText: '',
      seo_title: '',
      seo_description: '',
      slug: '',
      in_app_purchases: false,
      is_featured: false,
      is_app_of_the_day: false,
      is_editors_choice: false,
    });
  };

  const handleUpdateApp = (app: AppItem) => {
    setFormData({
      name: app.name,
      subtitle: app.subtitle,
      category: app.category,
      developer: app.developer,
      developer_email: app.developer_email || '',
      version: app.version,
      file_size: app.file_size,
      price: app.price,
      age_rating: app.age_rating,
      download_url: app.download_url,
      icon_url: app.icon_url,
      screenshots: app.screenshots,
      video_url: app.video_url || '',
      description: app.description,
      whats_new: app.whats_new || '',
      tagsText: app.tags.join(', '),
      seo_title: app.seo_title || '',
      seo_description: app.seo_description || '',
      slug: app.slug || '',
      in_app_purchases: app.in_app_purchases || false,
      is_featured: app.is_featured || false,
      is_app_of_the_day: app.is_app_of_the_day || false,
      is_editors_choice: app.is_editors_choice || false,
    });
    setSelectedApp(null);
    setActiveTab('add');
  };

  const handleCopyAppLink = (app: AppItem) => {
    copyAppLink(app);
    setCopiedLink(app.id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#000000] to-[#1a1a1a] text-white shadow-xl shadow-black/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20">
              App Store Connect
            </span>
            <span className="text-xs text-white/80">Admin Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            ডেভেলপার কনসোল ও অ্যাপ ম্যানেজার
          </h1>
          <p className="text-xs text-white/90">
            লগ ইন করা ব্যবহারকারী: <span className="font-mono underline">{user?.email || 'admin@appstore.com'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('add')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'add' ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>নতুন অ্যাপ যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('add')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'add'
              ? 'bg-[#0071e3] text-white shadow-sm'
              : 'text-white/70 hover:bg-white/10'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>নতুন অ্যাপ</span>
        </button>

        <button
          onClick={() => setActiveTab('manage')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'manage'
              ? 'bg-[#0071e3] text-white shadow-sm'
              : 'text-white/70 hover:bg-white/10'
          }`}
        >
          <FolderKanban className="w-4 h-4" />
          <span>অ্যাপ পরিচালনা ({apps.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('linkgen')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'linkgen'
              ? 'bg-[#0071e3] text-white shadow-sm'
              : 'text-white/70 hover:bg-white/10'
          }`}
        >
          <Link className="w-4 h-4" />
          <span>অ্যাপ লিংক জেনারেটর</span>
        </button>

        <button
          onClick={() => setActiveTab('seo')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'seo'
              ? 'bg-[#0071e3] text-white shadow-sm'
              : 'text-white/70 hover:bg-white/10'
          }`}
        >
          <SearchCode className="w-4 h-4" />
          <span>গুগল সার্চ কনসোল ও এসইও</span>
        </button>

        <button
          onClick={() => setActiveTab('theme')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'theme'
              ? 'bg-[#0071e3] text-white shadow-sm'
              : 'text-white/70 hover:bg-white/10'
          }`}
        >
          {settings.theme_mode === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          <span>থিম ডার্ক / লাইট</span>
        </button>
      </div>

      {/* TAB 1: ADD / EDIT APPLICATION */}
      {activeTab === 'add' && (
        <form onSubmit={handleCreateApp} className="space-y-6">
          {formSuccessMessage && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>{formSuccessMessage}</span>
            </div>
          )}

          {/* 1. Basic Information */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-[#f5f5f7]">১. মৌলিক তথ্য</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1">অ্যাপলিকেশনের নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ফটো এডিটর প্রো"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-white/5 border border-white/10 text-[#f5f5f7] outline-none focus:border-[#0071e3]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1">উপশিরোনাম</label>
                <input
                  type="text"
                  placeholder="যেমন: নতুন প্রজন্মের ছবি সম্পাদনা"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-white/5 border border-white/10 text-[#f5f5f7] outline-none focus:border-[#0071e3]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1">ক্যাটাগরি</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-white/5 border border-white/10 text-[#f5f5f7] outline-none focus:border-[#0071e3]"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1">ডেভেলপার / স্টুডিও নাম</label>
                <input
                  type="text"
                  placeholder="যেমন: কুপার টিন ল্যাবস"
                  value={formData.developer}
                  onChange={(e) => setFormData({ ...formData, developer: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-white/5 border border-white/10 text-[#f5f5f7] outline-none focus:border-[#0071e3]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1">সংস্করণ</label>
                <input
                  type="text"
                  placeholder="1.0.0"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-white/5 border border-white/10 text-[#f5f5f7] outline-none focus:border-[#0071e3]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1">বয়স রেটিং</label>
                <select
                  value={formData.age_rating}
                  onChange={(e) => setFormData({ ...formData, age_rating: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-white/5 border border-white/10 text-[#f5f5f7] outline-none focus:border-[#0071e3]"
                >
                  <option value="4+">4+ (সবার জন্য উপযুক্ত)</option>
                  <option value="9+">9+ (হালকা কল্পনাগত সহিংসতা)</option>
                  <option value="12+">12+ (দुর্দ্দೃশ্য সহিংসতা)</option>
                  <option value="17+">17+ (পরিপক্ক বিষয়বস্তু)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. Direct Download File */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#f5f5f7]">২. সরাসরি ডাউনলোড ফাইল</h2>
              <span className="text-xs text-white/50">ইউজার ডাউনলোড করলে ফাইল ডাউনলোড শুরু হবে</span>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl border-2 border-dashed border-white/10 hover:border-[#0071e3] transition-colors bg-white/3">
                <div className="flex flex-col items-center justify-center text-center space-y-2">
                  <UploadCloud className="w-8 h-8 text-[#0071e3]" />
                  <div className="text-sm font-semibold text-[#f5f5f7]">অ্যাপলিকেশন ফাইল আপলোড করুন (APK, IPA, ZIP, DMG, EXE)</div>
                  <p className="text-xs text-white/50">স্থায়ী ডাউনলোড লিংক জেনারেট হবে</p>
                  <label className="cursor-pointer px-4 py-2 rounded-xl bg-[#0071e3] text-white text-xs font-semibold hover:bg-[#0077ed] transition-colors inline-block">
                    {isUploadingFile ? 'আপলোড হচ্ছে...' : 'ফাইল বেছে নিন'}
                    <input type="file" onChange={handleFileUpload} className="hidden" disabled={isUploadingFile} />
                  </label>
                </div>
                {uploadSuccessMessage && (
                  <p className="text-xs text-emerald-400 font-medium text-center mt-3">{uploadSuccessMessage}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1">অথবা সরাসরি ডাউনলোড URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com/downloads/app.zip"
                  value={formData.download_url}
                  onChange={(e) => setFormData({ ...formData, download_url: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-white/5 border border-white/10 text-[#f5f5f7] outline-none focus:border-[#0071e3]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1">ফাইলের সাইজ (যেমন: 84.5 MB)</label>
                <input
                  type="text"
                  placeholder="45.0 MB"
                  value={formData.file_size}
                  onChange={(e) => setFormData({ ...formData, file_size: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-white/5 border border-white/10 text-[#f5f5f7] outline-none focus:border-[#0071e3]"
                />
              </div>
            </div>
          </div>

          {/* 3. Media: Icon, Screenshots, Video */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-[#f5f5f7]">৩. মিডিয়া: আইকন, স্ক্রিনশট, ভিডিও</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1">অ্যাপ আইকন URL</label>
                <input
                  type="text"
                  value={formData.icon_url}
                  onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-white/5 border border-white/10 text-[#f5f5f7] outline-none focus:border-[#0071e3]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1">অথবা আইকন ফাইল আপলোড করুন</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleIconUpload}
                  className="text-xs file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#0071e3] file:text-white"
                />
              </div>
            </div>

            <div className="space-y-4 p-5 rounded-2xl bg-white/3 border border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-[#f5f5f7]">অ্যাপ স্ক্রিনশট ({formData.screenshots.length})</h3>
                  <p className="text-xs text-white/50">অনেকে ছবি আপলোড করুন বা URL দিন। প্রিভিউ গ্যালারিতে দেখাবে।</p>
                </div>
                <label className="cursor-pointer px-4 py-2 rounded-xl bg-[#0071e3] text-white text-xs font-semibold hover:bg-[#0077ed] inline-flex items-center gap-1.5 self-start sm:self-auto">
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{isUploadingScreenshots ? 'আপলোড হচ্ছে...' : 'ছবি আপলোড করুন'}</span>
                  <input type="file" multiple accept="image/*" onChange={handleScreenshotUpload} disabled={isUploadingScreenshots} className="hidden" />
                </label>
              </div>
              {screenshotUploadMessage && (
                <div className="text-xs text-emerald-400 font-medium">{screenshotUploadMessage}</div>
              )}
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="স্ক্রিনশট ছবির URL দিন"
                  value={screenshotInput}
                  onChange={(e) => setScreenshotInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddScreenshotUrl(); } }}
                  className="flex-1 px-4 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-[#f5f5f7] outline-none focus:border-[#0071e3]"
                />
                <button type="button" onClick={handleAddScreenshotUrl} className="px-4 py-2 rounded-xl bg-white/10 hover:bg-[#0071e3] hover:text-white text-xs font-semibold transition-colors flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" />
                  <span>URL যোগ করুন</span>
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2">
                {formData.screenshots.map((src, index) => (
                  <div key={index} className="relative rounded-xl overflow-hidden aspect-[9/16] bg-white/10 border border-white/10">
                    <img src={src} alt={`screenshot ${index + 1}`} className="w-full h-full object-cover" onError={(e) => {(e.target as HTMLImageElement).src = '';}} />
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[9px] font-bold">#{index + 1}</div>
                    <button type="button" onClick={() => handleRemoveScreenshot(index)} className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 p-5 rounded-2xl bg-white/3 border border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-[#f5f5f7] flex items-center gap-2"><Video className="w-4 h-4 text-purple-500" /> ভিডিও ট্রেলার / ডেমো</h3>
                  <p className="text-xs text-white/50">ইউটিউব, ভিমিও, বা এমপি-ফোর লিংক দিন। অ্যাপ ডিটেইল পেজে অটোপ্লে হবে।</p>
                </div>
                <label className="cursor-pointer px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 self-start sm:self-auto">
                  <Film className="w-3.5 h-3.5" />
                  <span>{isUploadingVideo ? 'ভিডিও আপলোড হচ্ছে...' : 'ভিডিও ফাইল আপলোড করুন'}</span>
                  <input type="file" accept="video/*" onChange={handleVideoUpload} disabled={isUploadingVideo} className="hidden" />
                </label>
              </div>
              {videoUploadMessage && <div className="text-xs text-emerald-400 font-medium">{videoUploadMessage}</div>}
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1">ভিডিও লিংক (ইউটিউব / ভিমিও / সরাসরি MP4)</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://youtube.com/watch?v=... বা https://example.com/video.mp4"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-white/5 border border-white/10 text-[#f5f5f7] outline-none focus:border-[#0071e3]"
                  />
                  {formData.video_url && (
                    <button type="button" onClick={() => setFormData({ ...formData, video_url: '' })} className="px-3 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-semibold transition-colors">Clear</button>
                  )}
                </div>
              </div>
              {formData.video_url && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-semibold text-white/60 flex items-center gap-1.5"><Play className="w-3.5 h-3.5 text-purple-500" /><span>লাইভ ভিডিও প্রিভিউ</span></span>
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black max-w-lg aspect-video shadow-md">
                    {formData.video_url.includes('youtube.com/embed') || formData.video_url.includes('player.vimeo.com') ? (
                      <iframe src={formData.video_url} title="ভিডিও প্রিভিউ" className="w-full h-full border-0" allowFullScreen />
                    ) : (
                      <video src={formData.video_url} controls playsInline className="w-full h-full object-cover" />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 4. Auto Tags, Description, SEO */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-[#f5f5f7]">৪. অটো #ট্যাগ, বিবরণ ও এসইও</h2>

            <div className="space-y-2 p-4 rounded-2xl bg-[#0071e3]/5 border border-[#0071e3]/10">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#0071e3] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>অটো #ট্যাগ জেনারেটর</span>
                </label>
                <button type="button" onClick={() => {
                  const generated = (formData.name || 'অ্যাপলিকেশন').toLowerCase().split(' ').map(w => `#${w}`).join(', ');
                  setFormData((prev) => ({ ...prev, tagsText: generated }));
                }} className="px-3 py-1 rounded-lg bg-[#0071e3] text-white text-xs font-semibold hover:bg-[#0077ed] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ট্যাগ তৈরি করুন</span>
                </button>
              </div>
              <input
                type="text"
                value={formData.tagsText}
                onChange={(e) => setFormData({ ...formData, tagsText: e.target.value })}
                placeholder="#প্রোডাক্টিভিটি, #ফটো, #ইউটিলিটি"
                className="w-full px-4 py-2.5 text-sm rounded-xl bg-white/3 border border-white/10 text-[#f5f5f7] outline-none focus:border-[#0071e3]"
              />
              <p className="text-[11px] text-white/50">কমা দ্বারা পৃথক ট্যাগ। ইউজার ট্যাগ দিয়ে সার্চ ও ফিল্টার করতে পারবে।</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1">অ্যাপলিকেশ군의 সম্পূর্ণ বিবরণ</label>
                <textarea rows={4} placeholder="অ্যাপের মূল ফিচার, সুবিধা ও কার্যপ্রণালী লিখুন..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2.5 text-sm rounded-xl bg-white/5 border border-white/10 text-[#f5f5f7] outline-none focus:border-[#0071e3]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1">এই সংস্করণে নতুন কী</label>
                <input type="text" placeholder="যেমন: বাগ ফিক্স ও পারফরম্যান্স উন্নতি" value={formData.whats_new} onChange={(e) => setFormData({ ...formData, whats_new: e.target.value })} className="w-full px-4 py-2.5 text-sm rounded-xl bg-white/5 border border-white/10 text-[#f5f5f7] outline-none focus:border-[#0071e3]" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1">এসইও শিরোনাম (গুগল সার্চে দেখাবে)</label>
                <input type="text" value={formData.seo_title} onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })} placeholder="অ্যাপের নাম - ডাউনলোড | App Store" className="w-full px-4 py-2.5 text-sm rounded-xl bg-white/5 border border-white/10 text-[#f5f5f7] outline-none focus:border-[#0071e3]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1">এসইও বিবরণ (গুগল স্নিপেট)</label>
                <textarea rows={2} value={formData.seo_description} onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })} placeholder="গুগল সার্চ রেজাল্টে আপনার অ্যাপের জন্য ছোট বিবরণ" className="w-full px-4 py-2.5 text-sm rounded-xl bg-white/5 border border-white/10 text-[#f5f5f7] outline-none focus:border-[#0071e3]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1">URL স্লাগ (যেমন: my-cool-app)</label>
                <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="my-cool-app" className="w-full px-4 py-2.5 text-sm rounded-xl bg-white/5 border border-white/10 text-[#f5f5f7] outline-none focus:border-[#0071e3]" />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })} className="w-4 h-4 rounded text-[#0071e3]" />
                <span>ফিচারড অ্যাপ</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input type="checkbox" checked={formData.is_app_of_the_day} onChange={(e) => setFormData({ ...formData, is_app_of_the_day: e.target.checked })} className="w-4 h-4 rounded text-[#0071e3]" />
                <span>অ্যাপ অফ দ্য ডে</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input type="checkbox" checked={formData.is_editors_choice} onChange={(e) => setFormData({ ...formData, is_editors_choice: e.target.checked })} className="w-4 h-4 rounded text-[#0071e3]" />
                <span>এডিটর্স চয়েস</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="px-8 py-3 rounded-2xl bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all active:scale-98">
              অ্যাপ প্রকাশ করুন
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: MANAGE APPS (Re-edit from everywhere) */}
      {activeTab === 'manage' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#f5f5f7]">প্রকাশিত অ্যাপলিকেশন ডিরেক্টরি</h2>
              <p className="text-xs text-white/50">{apps.length}টি অ্যাপ প্রকাশিত এবং ডাউনলোডের জন্য প্রস্তুত</p>
            </div>
            {apps.length > 0 && (
              <button type="button" onClick={() => { if (confirm('সব অ্যাপ ডিলিট করতে চান?')) { clearAllDemoData(); } }} className="px-3.5 py-1.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-semibold transition-colors flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5" />
                <span>সব ডিলিট করুন</span>
              </button>
            )}
          </div>

          <div className="divide-y divide-white/10 overflow-hidden">
            {apps.map((app) => (
              <div key={app.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-[22%] overflow-hidden bg-white/5 shrink-0 shadow-xs">
                    <img src={app.icon_url} alt="" className="w-full h-full object-cover" onError={(e) => {(e.target as HTMLImageElement).src = '';}} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#f5f5f7] flex items-center gap-2">
                      <span>{app.name}</span>
                      {app.is_app_of_the_day && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-amber-500 text-black">TODAY</span>}
                    </h3>
                    <p className="text-xs text-white/50">{app.category} • {app.file_size}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] font-medium text-emerald-400">{app.downloads_count.toLocaleString()} ডাউনলোড</span>
                      <span className="text-[11px] text-white/40">★ {app.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button onClick={() => handleUpdateApp(app)} className="p-2 rounded-xl text-white/60 hover:text-[#0071e3] hover:bg-white/10 transition-colors" title="সंपাদন করুন"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => handleCopyAppLink(app)} className={`p-2 rounded-xl text-white/60 hover:text-[#0071e3] hover:bg-white/10 transition-colors`} title="লিংক কপি করুন">{copiedLink === app.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Link className="w-4 h-4" />}</button>
                  <button onClick={() => setSelectedApp(app)} className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors" title="দেখুন"><ExternalLink className="w-4 h-4" /></button>
                  <button onClick={() => { if (confirm(`${app.name} ডিলিট করবেন?`)) { deleteApp(app.id); } }} className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors" title="ডিলিট করুন"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: APPLICATION LINK GENERATOR */}
      {activeTab === 'linkgen' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[#f5f5f7]">অ্যাপলিকেশন লিংক জেনারেটর</h2>
            <p className="text-xs text-white/50">যেকোনো অ্যাপের শেয়ারযোগ্য লিংক তৈরি করুন যেন আপনি কারোকোনো সাথে দিতে পারেন।</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {apps.map((app) => (
              <div key={app.id} className="p-4 rounded-2xl bg-white/3 border border-white/10 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[20%] overflow-hidden bg-white/5">
                    <img src={app.icon_url} alt="" className="w-full h-full object-cover" onError={(e) => {(e.target as HTMLImageElement).src = '';}} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-[#f5f5f7] truncate">{app.name}</h4>
                    <p className="text-[11px] text-white/50 truncate">{app.developer}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-[10px] font-mono text-[#0071e3] break-all">{generateAppLink(app)}</span>
                  <button onClick={() => handleCopyAppLink(app)} className="p-1.5 rounded-lg bg-[#0071e3]/20 text-[#0071e3] hover:bg-[#0071e3]/30 text-[10px] font-semibold transition-colors">
                    {copiedLink === app.id ? 'কপি করা হলো!' : 'কপি'}
                  </button>
                </div>
              </div>
            ))}
            {apps.length === 0 && (
              <div className="col-span-3 text-center py-12 bg-white/3 rounded-3xl border border-dashed border-white/10 space-y-3">
                <Globe className="w-10 h-10 mx-auto text-white/30" />
                <h3 className="text-base font-bold text-[#f5f5f7]">কোনো অ্যাপ নেই</h3>
                <p className="text-xs text-white/50 max-w-sm mx-auto">প্রথমে অ্যাপ চালান প্যানেলে একটি অ্যাপ যোগ করুন, তারপর লিংক জেনারেট করতে পারবেন।</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: GOOGLE SEARCH CONSOLE & SEO */}
      {activeTab === 'seo' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[#f5f5f7]">গুগল সার্চ কনসোল ও অটোমেটেড এসইও ইনডেক্সিং</h2>
            <p className="text-xs text-white/50">গুগল সার্চ কনসোলে মালিকানা যাচাই করুন, সাইটম্যাপ জেনারেট করুন, এবং আপনার সব অ্যাপ অটো-ইনডেক্স করুন।</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/60 mb-1">গুগল সার্চ কনসোল ভেরিফিকেশন টোকেন / মেটা কোড</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="যেমন: google-site-verification=abcdef1234567890"
                  value={settings.google_search_console_token}
                  onChange={(e) => updateSettings({ google_search_console_token: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-white/5 border border-white/10 text-[#f5f5f7] outline-none focus:border-[#0071e3]"
                />
              </div>
              <p className="text-[11px] text-white/50 mt-1">স্বয়ংক্রিয়ভাবে ইনজেক্ট হবে: <code className="text-[#0071e3]">&lt;meta name="google-site-verification" content="..." /&gt;</code></p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/3">
              <div>
                <div className="text-sm font-semibold text-[#f5f5f7]">অটোমেটেড গুগল ইনডেক্সিং ও Schema.org JSON-LD</div>
                <p className="text-xs text-white/50">প্রতিটি অ্যাপের পেজে SoftwareApplication মেটাডেটা এমবেড করা হবে যেন গুগল ক্রল ও ইনডেক্স করতে পারে।</p>
              </div>
              <input type="checkbox" checked={settings.auto_google_index} onChange={(e) => updateSettings({ auto_google_index: e.target.checked })} className="w-5 h-5 rounded text-[#0071e3]" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/60 mb-1">স্টোর শিরোনাম (এসইও)</label>
              <input type="text" value={settings.site_title} onChange={(e) => updateSettings({ site_title: e.target.value })} className="w-full px-4 py-2.5 text-sm rounded-xl bg-white/5 border border-white/10 text-[#f5f5f7] outline-none focus:border-[#0071e3]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 mb-1">মেটা বিবরণ (গুগল স্নিপেট)</label>
              <textarea rows={2} value={settings.site_description} onChange={(e) => updateSettings({ site_description: e.target.value })} className="w-full px-4 py-2.5 text-sm rounded-xl bg-white/5 border border-white/10 text-[#f5f5f7] outline-none focus:border-[#0071e3]" />
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <a href="https://search.google.com/search-console" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0071e3] text-white text-xs font-semibold hover:bg-[#0077ed] transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>গুগল সার্চ কনসোল খুলুন</span>
              </a>
              <span className="text-xs text-white/50">JSON-LD স্ট্রাকচারড ডেটা সব পেজে সক্রিয়</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: THEME DARK / LIGHT */}
      {activeTab === 'theme' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[#f5f5f7]">থিম: ডার্ক ও লাইট</h2>
            <p className="text-xs text-white/50">কোনো রঙ-thème প্রয়োজন নেই। শুধু ডার্ক এবং লাইট মোড কাজ করবে।</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-black border border-white/20">
              <div className="flex items-center gap-3 mb-4">
                <Moon className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-[#f5f5f7]">ডার্ক মোড</span>
              </div>
              <button onClick={() => updateSettings({ theme_mode: 'dark' })} className={`w-full py-3 rounded-2xl font-bold text-sm transition-all ${settings.theme_mode === 'dark' ? 'bg-[#0071e3] text-white shadow-blue-500/25' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
                সক্রিয় করুন
              </button>
            </div>
            <div className="p-6 rounded-3xl bg-[#f5f5f7] border border-black/20">
              <div className="flex items-center gap-3 mb-4">
                <Sun className="w-5 h-5 text-amber-500" />
                <span className="font-bold text-black">লাইট মোড</span>
              </div>
              <button onClick={() => updateSettings({ theme_mode: 'light' })} className={`w-full py-3 rounded-2xl font-bold text-sm transition-all ${settings.theme_mode === 'light' ? 'bg-black text-[#f5f5f7] shadow-lg' : 'bg-black/5 text-black/60 hover:bg-black/10'}`}>
                সক্রিয় করুন
              </button>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white/3 border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">অটো ব্ল্যাক স্কিন ফিক্স</h3>
            <p className="text-xs text-white/50">অ্যাডমিন যখন অ্যাপ আপলোড করবে, তখন অটোমেটিক ব্ল্যাক স্কিন ফিক্স হবে যেন ডার্ক মোডে সঠিকভাবে দেখায়।</p>
            <label className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 cursor-pointer">
              <input type="checkbox" checked={settings.auto_black_skin ?? true} onChange={(e) => updateSettings({ auto_black_skin: e.target.checked })} className="w-4 h-4 rounded text-[#0071e3]" />
              <span className="text-xs font-medium text-[#f5f5f7]">অ্যাপ আপলোডের সময় অটো ব্ল্যাক স্কিন ফিক্স সক্রিয় রাখুন</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
