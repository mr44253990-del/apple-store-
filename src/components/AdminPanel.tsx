import React, { useState } from 'react';
import { useAppStore } from '../context/AppContext.tsx';
import type { AppItem } from '../types.ts';
import { generateAutoTags } from '../utils/tagGenerator.ts';
import { generateFakeReviews } from '../utils/fakeReviewGenerator.ts';
import { uploadAppFile, testSupabaseConnection, getSupabaseSchemaSQL, getActiveSupabaseCredentials, resetSupabaseClient } from '../lib/supabase.ts';
import {
  PlusCircle,
  FolderKanban,
  SearchCode,
  Database,
  UploadCloud,
  Sparkles,
  MessageSquare,
  Check,
  Copy,
  Trash2,
  Edit3,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  FileCode,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Video,
  Film,
  Image as ImageIcon,
  Play,
  Plus,
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
    refreshFromSupabase,
    clearAllDemoData,
    supabaseErrorNotice,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'add' | 'manage' | 'seo' | 'supabase' | 'readme'>('add');

  // Add App Form State
  const [formData, setFormData] = useState({
    name: '',
    subtitle: '',
    category: 'Productivity',
    developer: 'Apple Certified Developer',
    developer_email: 'dev@apple.com',
    version: '1.0.0',
    file_size: '45.0 MB',
    price: 0,
    age_rating: '4+',
    download_url: '',
    icon_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=256&auto=format&fit=crop&q=80',
    screenshots: [
      'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1080&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1080&auto=format&fit=crop&q=80',
    ],
    video_url: '',
    description: '',
    whats_new: 'Initial launch with full iOS 18 performance optimizations.',
    tagsText: '#appstore, #ios, #productivity, #trending',
    in_app_purchases: false,
    is_featured: true,
    is_app_of_the_day: false,
    is_editors_choice: true,
    generateFakeReviewsOnSave: true,
    fakeReviewsCount: 3,
  });

  const [screenshotInput, setScreenshotInput] = useState('');
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isUploadingScreenshots, setIsUploadingScreenshots] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState('');
  const [screenshotUploadMessage, setScreenshotUploadMessage] = useState('');
  const [videoUploadMessage, setVideoUploadMessage] = useState('');
  const [formSuccessMessage, setFormSuccessMessage] = useState('');
  const [copiedSQL, setCopiedSQL] = useState(false);
  const [copiedOrigin, setCopiedOrigin] = useState(false);
  const [supabaseTestStatus, setSupabaseTestStatus] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
  } | null>(null);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);

  // Helper to format YouTube or Vimeo URLs into responsive embeds
  const formatEmbedVideoUrl = (rawUrl: string): string => {
    if (!rawUrl) return '';
    const trimmed = rawUrl.trim();
    if (trimmed.includes('youtube.com/watch')) {
      const vid = trimmed.split('v=')[1]?.split('&')[0];
      if (vid) return `https://www.youtube.com/embed/${vid}`;
    }
    if (trimmed.includes('youtu.be/')) {
      const vid = trimmed.split('youtu.be/')[1]?.split('?')[0];
      if (vid) return `https://www.youtube.com/embed/${vid}`;
    }
    if (trimmed.includes('youtube.com/shorts/')) {
      const vid = trimmed.split('youtube.com/shorts/')[1]?.split('?')[0];
      if (vid) return `https://www.youtube.com/embed/${vid}`;
    }
    if (trimmed.includes('vimeo.com/')) {
      const vid = trimmed.split('vimeo.com/')[1]?.split('?')[0];
      if (vid && !isNaN(Number(vid))) return `https://player.vimeo.com/video/${vid}`;
    }
    return trimmed;
  };

  // Auto # tags generator
  const handleGenerateTags = () => {
    const generated = generateAutoTags(
      formData.name || 'Application',
      formData.category,
      formData.subtitle,
      formData.description
    );
    setFormData((prev) => ({
      ...prev,
      tagsText: generated.join(', '),
    }));
  };

  // Direct File Upload handler (uploads to Supabase Storage or local data fallback)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFile(true);
    setUploadSuccessMessage('');
    try {
      const publicUrl = await uploadAppFile(file, 'apps');
      const calculatedSize = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      setFormData((prev) => ({
        ...prev,
        download_url: publicUrl,
        file_size: calculatedSize,
      }));
      setUploadSuccessMessage(`Uploaded file "${file.name}" (${calculatedSize}) successfully!`);
    } catch (err: any) {
      alert(`Upload error: ${err?.message || 'Failed'}`);
    } finally {
      setIsUploadingFile(false);
    }
  };

  // Icon upload handler
  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const iconUrl = await uploadAppFile(file, 'app-assets');
      setFormData((prev) => ({ ...prev, icon_url: iconUrl }));
    } catch (err) {
      console.error(err);
    }
  };

  // Multiple screenshot upload handler
  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingScreenshots(true);
    try {
      const uploaded: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadAppFile(files[i], 'app-assets');
        uploaded.push(url);
      }
      setFormData((prev) => ({
        ...prev,
        screenshots: [...prev.screenshots, ...uploaded],
      }));
      setScreenshotUploadMessage(`Added ${files.length} screenshot image(s)!`);
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

  // Video trailer upload handler
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingVideo(true);
    try {
      const url = await uploadAppFile(file, 'app-assets');
      setFormData((prev) => ({ ...prev, video_url: url }));
      setVideoUploadMessage(`Video "${file.name}" uploaded successfully!`);
      setTimeout(() => setVideoUploadMessage(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploadingVideo(false);
    }
  };

  // Submit App creation
  const handleCreateApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.download_url.trim()) {
      alert('Please fill out app name and direct download URL/file.');
      return;
    }

    const tagsArray = formData.tagsText
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((t) => (t.startsWith('#') ? t : `#${t}`));

    const newApp = await addApp({
      name: formData.name.trim(),
      subtitle: formData.subtitle.trim(),
      description: formData.description.trim() || `${formData.name} is a high-performance application built for iOS and macOS.`,
      icon_url: formData.icon_url,
      download_url: formData.download_url,
      file_size: formData.file_size || '52.0 MB',
      version: formData.version || '1.0.0',
      developer: formData.developer || 'Apple Developer',
      developer_email: formData.developer_email,
      category: formData.category,
      rating: 4.9,
      rating_count: 120,
      price: Number(formData.price) || 0,
      age_rating: formData.age_rating,
      screenshots: formData.screenshots,
      video_url: formData.video_url.trim() ? formatEmbedVideoUrl(formData.video_url.trim()) : undefined,
      tags: tagsArray,
      whats_new: formData.whats_new,
      in_app_purchases: formData.in_app_purchases,
      is_editors_choice: formData.is_editors_choice,
      is_featured: formData.is_featured,
      is_app_of_the_day: formData.is_app_of_the_day,
      compatibility: 'Requires iOS 16.0 or later. Compatible with iPhone, iPad, and Mac.',
      languages: ['English', 'Spanish', 'French', 'Bengali', 'German'],
    });

    // Generate fake reviews if enabled
    if (formData.generateFakeReviewsOnSave) {
      const generatedReviews = generateFakeReviews(newApp.id, formData.fakeReviewsCount);
      const existingReviews = JSON.parse(localStorage.getItem('appstore_reviews_data') || '{}');
      existingReviews[newApp.id] = generatedReviews;
      localStorage.setItem('appstore_reviews_data', JSON.stringify(existingReviews));
    }

    setFormSuccessMessage(`Application "${formData.name}" published successfully! Saved securely.`);
    setTimeout(() => setFormSuccessMessage(''), 5000);

    // Reset Form
    setFormData({
      name: '',
      subtitle: '',
      category: 'Productivity',
      developer: 'Apple Certified Developer',
      developer_email: 'dev@apple.com',
      version: '1.0.0',
      file_size: '45.0 MB',
      price: 0,
      age_rating: '4+',
      download_url: '',
      icon_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=256&auto=format&fit=crop&q=80',
      screenshots: [
        'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1080&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1080&auto=format&fit=crop&q=80',
      ],
      video_url: '',
      description: '',
      whats_new: 'Initial launch with full iOS 18 performance optimizations.',
      tagsText: '#appstore, #ios, #productivity, #trending',
      in_app_purchases: false,
      is_featured: true,
      is_app_of_the_day: false,
      is_editors_choice: true,
      generateFakeReviewsOnSave: true,
      fakeReviewsCount: 3,
    });
  };

  const handleTestSupabase = async () => {
    setIsTestingSupabase(true);
    const result = await testSupabaseConnection();
    setSupabaseTestStatus({
      tested: true,
      success: result.success,
      message: result.message,
    });
    setIsTestingSupabase(false);
  };

  const handleCopySQL = () => {
    const sql = getSupabaseSchemaSQL();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(sql);
      setCopiedSQL(true);
      setTimeout(() => setCopiedSQL(false), 3000);
    }
  };

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

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#0071e3] to-[#2997ff] text-white shadow-xl shadow-blue-500/15">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20">
              App Store Connect
            </span>
            <span className="text-xs text-white/80">Admin Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Developer Console & Application Manager
          </h1>
          <p className="text-xs sm:text-sm text-white/90">
            Logged in as <span className="font-mono underline">{user?.email || 'mr4425390@gmail.com'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refreshFromSupabase()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Supabase</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.05] dark:border-white/[0.08] overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('add')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'add'
              ? 'bg-[#0071e3] text-white shadow-sm'
              : 'text-black/70 dark:text-white/70 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New App</span>
        </button>

        <button
          onClick={() => setActiveTab('manage')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'manage'
              ? 'bg-[#0071e3] text-white shadow-sm'
              : 'text-black/70 dark:text-white/70 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
          }`}
        >
          <FolderKanban className="w-4 h-4" />
          <span>Manage Apps ({apps.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('seo')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'seo'
              ? 'bg-[#0071e3] text-white shadow-sm'
              : 'text-black/70 dark:text-white/70 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
          }`}
        >
          <SearchCode className="w-4 h-4" />
          <span>Google Search Console & SEO</span>
        </button>

        <button
          onClick={() => setActiveTab('supabase')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'supabase'
              ? 'bg-[#0071e3] text-white shadow-sm'
              : 'text-black/70 dark:text-white/70 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Supabase Cloud &amp; Schema</span>
        </button>

        <button
          onClick={() => setActiveTab('readme')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'readme'
              ? 'bg-[#0071e3] text-white shadow-sm'
              : 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
          }`}
        >
          <FileCode className="w-4 h-4 text-amber-500" />
          <span>Supabase Setup Guide (README)</span>
        </button>
      </div>

      {/* TAB 1: ADD APPLICATION */}
      {activeTab === 'add' && (
        <form onSubmit={handleCreateApp} className="space-y-6">
          {formSuccessMessage && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>{formSuccessMessage}</span>
            </div>
          )}

          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1c1c1e] border border-black/5 dark:border-white/10 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
              1. Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-black/60 dark:text-white/60 mb-1">
                  Application Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PixelCraft Studio"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] outline-none focus:border-[#0071e3]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-black/60 dark:text-white/60 mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  placeholder="e.g. Next-gen image synthesis & editing"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] outline-none focus:border-[#0071e3]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-black/60 dark:text-white/60 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] outline-none focus:border-[#0071e3]"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-black/60 dark:text-white/60 mb-1">
                  Developer / Studio Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cupertino Labs"
                  value={formData.developer}
                  onChange={(e) => setFormData({ ...formData, developer: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] outline-none focus:border-[#0071e3]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-black/60 dark:text-white/60 mb-1">
                  Version
                </label>
                <input
                  type="text"
                  placeholder="1.0.0"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] outline-none focus:border-[#0071e3]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-black/60 dark:text-white/60 mb-1">
                  Age Rating
                </label>
                <select
                  value={formData.age_rating}
                  onChange={(e) => setFormData({ ...formData, age_rating: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] outline-none focus:border-[#0071e3]"
                >
                  <option value="4+">4+ (Suitable for everyone)</option>
                  <option value="9+">9+ (Mild fantasy violence)</option>
                  <option value="12+">12+ (Infrequent simulated violence)</option>
                  <option value="17+">17+ (Mature content)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. DIRECT DOWNLOAD FILE & STORAGE */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1c1c1e] border border-black/5 dark:border-white/10 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                2. Direct Download File &amp; Supabase Storage
              </h2>
              <span className="text-xs text-black/50 dark:text-white/50">
                User download click করলে সাথে সাথে file download হবে
              </span>
            </div>

            <div className="space-y-4">
              {/* Option A: Direct File Upload to Supabase */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-black/10 dark:border-white/10 hover:border-[#0071e3] transition-colors bg-black/[0.02] dark:bg-white/[0.02]">
                <div className="flex flex-col items-center justify-center text-center space-y-2">
                  <UploadCloud className="w-8 h-8 text-[#0071e3]" />
                  <div className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    Upload Application File (APK, IPA, ZIP, DMG, EXE, or payload)
                  </div>
                  <p className="text-xs text-black/50 dark:text-white/50">
                    Uploads directly to Supabase storage bucket & generates permanent download link
                  </p>
                  <label className="cursor-pointer px-4 py-2 rounded-xl bg-[#0071e3] text-white text-xs font-semibold hover:bg-[#0077ed] transition-colors inline-block">
                    {isUploadingFile ? 'Uploading to Supabase...' : 'Choose File to Upload'}
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploadingFile}
                    />
                  </label>
                </div>
                {uploadSuccessMessage && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium text-center mt-3">
                    {uploadSuccessMessage}
                  </p>
                )}
              </div>

              {/* Option B: Direct URL */}
              <div>
                <label className="block text-xs font-semibold text-black/60 dark:text-white/60 mb-1">
                  Or Direct Download URL (Raw File / Web Link) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com/downloads/app.zip"
                  value={formData.download_url}
                  onChange={(e) => setFormData({ ...formData, download_url: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] outline-none focus:border-[#0071e3]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-black/60 dark:text-white/60 mb-1">
                  File Size Display (e.g. 84.5 MB)
                </label>
                <input
                  type="text"
                  placeholder="45.0 MB"
                  value={formData.file_size}
                  onChange={(e) => setFormData({ ...formData, file_size: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] outline-none focus:border-[#0071e3]"
                />
              </div>
            </div>
          </div>

          {/* 3. AUTO # TAGS & FAKE REVIEWS GENERATOR */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1c1c1e] border border-black/5 dark:border-white/10 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
              3. Auto # Tags & Fake Reviews Generator
            </h2>

            {/* Tags Generator */}
            <div className="space-y-2 p-4 rounded-2xl bg-[#0071e3]/5 border border-[#0071e3]/10">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#0071e3] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Auto # Tags Generator</span>
                </label>
                <button
                  type="button"
                  onClick={handleGenerateTags}
                  className="px-3 py-1 rounded-lg bg-[#0071e3] text-white text-xs font-semibold hover:bg-[#0077ed] transition-all flex items-center gap-1 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate # Tags Now</span>
                </button>
              </div>
              <input
                type="text"
                value={formData.tagsText}
                onChange={(e) => setFormData({ ...formData, tagsText: e.target.value })}
                placeholder="#productivity, #photo, #ios, #trending"
                className="w-full px-4 py-2.5 text-sm rounded-xl bg-white dark:bg-[#2c2c2e] border border-black/10 dark:border-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] outline-none focus:border-[#0071e3]"
              />
              <p className="text-[11px] text-black/50 dark:text-white/50">
                Comma separated tags. Users can search and filter directly using these tags.
              </p>
            </div>

            {/* Fake Review Generator Toggle */}
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    Auto Fake Reviews Generator
                  </span>
                </div>
                <input
                  type="checkbox"
                  id="chk-fake-reviews"
                  checked={formData.generateFakeReviewsOnSave}
                  onChange={(e) =>
                    setFormData({ ...formData, generateFakeReviewsOnSave: e.target.checked })
                  }
                  className="w-4 h-4 text-[#0071e3] rounded"
                />
              </div>
              <p className="text-xs text-black/60 dark:text-white/60">
                Automatically injects 3-5 verified high-star customer reviews with genuine Apple user handles and testimonials when saved.
              </p>
            </div>

            {/* Description & Release notes */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-black/60 dark:text-white/60 mb-1">
                  Full Application Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe your app's core features, benefits, and workflows..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] outline-none focus:border-[#0071e3]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-black/60 dark:text-white/60 mb-1">
                  What&apos;s New in this Version
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bug fixes and performance improvements."
                  value={formData.whats_new}
                  onChange={(e) => setFormData({ ...formData, whats_new: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] outline-none focus:border-[#0071e3]"
                />
              </div>
            </div>

            {/* Image URLs & upload */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-black/60 dark:text-white/60 mb-1">
                  Icon URL
                </label>
                <input
                  type="text"
                  value={formData.icon_url}
                  onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] outline-none focus:border-[#0071e3]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-black/60 dark:text-white/60 mb-1">
                  Or Upload App Icon
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleIconUpload}
                  className="text-xs file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#0071e3] file:text-white"
                />
              </div>
            </div>

            {/* Badges / Visibility */}
            <div className="flex flex-wrap gap-4 pt-2">
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-4 h-4 rounded text-[#0071e3]"
                />
                <span>Featured App</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_app_of_the_day}
                  onChange={(e) => setFormData({ ...formData, is_app_of_the_day: e.target.checked })}
                  className="w-4 h-4 rounded text-[#0071e3]"
                />
                <span>App of the Day</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_editors_choice}
                  onChange={(e) => setFormData({ ...formData, is_editors_choice: e.target.checked })}
                  className="w-4 h-4 rounded text-[#0071e3]"
                />
                <span>Editors&apos; Choice</span>
              </label>
            </div>
          </div>

          {/* 4. MEDIA STUDIO: SCREENSHOTS & VIDEO TRAILER */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1c1c1e] border border-black/5 dark:border-white/10 shadow-sm space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#0071e3]" />
                <span>4. Media Studio: Multiple Screenshots &amp; Video Trailer</span>
              </h2>
              <p className="text-xs text-black/50 dark:text-white/50">
                Add several example screenshot images and an automatic video trailer for high-converting store presentation.
              </p>
            </div>

            {/* SCREENSHOTS MANAGER */}
            <div className="space-y-4 p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    App Screenshots ({formData.screenshots.length} added)
                  </h3>
                  <p className="text-xs text-black/50 dark:text-white/50">
                    Upload multiple images or paste URLs. These display in the preview gallery.
                  </p>
                </div>
                <label className="cursor-pointer px-4 py-2 rounded-xl bg-[#0071e3] text-white text-xs font-semibold hover:bg-[#0077ed] transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto">
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{isUploadingScreenshots ? 'Uploading...' : 'Upload Multiple Images'}</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleScreenshotUpload}
                    disabled={isUploadingScreenshots}
                    className="hidden"
                  />
                </label>
              </div>

              {screenshotUploadMessage && (
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  {screenshotUploadMessage}
                </div>
              )}

              {/* Add by URL input */}
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Or paste screenshot image URL (https://...)"
                  value={screenshotInput}
                  onChange={(e) => setScreenshotInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddScreenshotUrl();
                    }
                  }}
                  className="flex-1 px-4 py-2 text-xs rounded-xl bg-white dark:bg-[#2c2c2e] border border-black/10 dark:border-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] outline-none focus:border-[#0071e3]"
                />
                <button
                  type="button"
                  onClick={handleAddScreenshotUrl}
                  className="px-4 py-2 rounded-xl bg-black/[0.05] dark:bg-white/[0.08] hover:bg-[#0071e3] hover:text-white text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add URL</span>
                </button>
              </div>

              {/* Screenshots Preview Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2">
                {formData.screenshots.map((src, index) => (
                  <div
                    key={index}
                    className="relative group rounded-xl overflow-hidden aspect-[9/16] bg-black/10 border border-black/10 dark:border-white/10 shadow-xs"
                  >
                    <img
                      src={src}
                      alt={`screenshot ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1080&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[9px] font-bold">
                      #{index + 1}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveScreenshot(index)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      title="Remove screenshot"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* VIDEO TRAILER MANAGER */}
            <div className="space-y-4 p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
                    <Video className="w-4 h-4 text-purple-500" />
                    <span>App Video Trailer / Demo</span>
                  </h3>
                  <p className="text-xs text-black/50 dark:text-white/50">
                    Paste YouTube, Vimeo, MP4 link or upload video file. Plays automatically in App Detail preview!
                  </p>
                </div>
                <label className="cursor-pointer px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto">
                  <Film className="w-3.5 h-3.5" />
                  <span>{isUploadingVideo ? 'Uploading Video...' : 'Upload Video File'}</span>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    onChange={handleVideoUpload}
                    disabled={isUploadingVideo}
                    className="hidden"
                  />
                </label>
              </div>

              {videoUploadMessage && (
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  {videoUploadMessage}
                </div>
              )}

              {/* Video URL Input */}
              <div>
                <label className="block text-xs font-semibold text-black/60 dark:text-white/60 mb-1">
                  Video Link (YouTube, Vimeo, or direct MP4/WebM URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=... or https://example.com/video.mp4"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-white dark:bg-[#2c2c2e] border border-black/10 dark:border-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] outline-none focus:border-[#0071e3]"
                  />
                  {formData.video_url && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, video_url: '' })}
                      className="px-3 py-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-semibold transition-colors"
                      title="Clear video"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* LIVE VIDEO PREVIEW */}
              {formData.video_url && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-semibold text-black/60 dark:text-white/60 flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5 text-purple-500" />
                    <span>Live Video Preview</span>
                  </span>
                  <div className="relative rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-black max-w-lg aspect-video shadow-md">
                    {formatEmbedVideoUrl(formData.video_url).includes('youtube.com/embed') ||
                    formatEmbedVideoUrl(formData.video_url).includes('player.vimeo.com') ? (
                      <iframe
                        src={formatEmbedVideoUrl(formData.video_url)}
                        title="Video Preview"
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={formData.video_url}
                        controls
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SUPABASE STATUS NOTICE */}
          {supabaseErrorNotice && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Notice on Supabase Cloud Sync</span>
              </div>
              <p>
                {supabaseErrorNotice} — However, <strong>your application is permanently saved in your browser storage and will NOT be lost upon refresh</strong>!
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('supabase')}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl text-xs transition-colors inline-block"
              >
                Go to Supabase Cloud &amp; Run SQL Schema
              </button>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-8 py-3 rounded-2xl bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all active:scale-98"
            >
              Publish Application to Store
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: MANAGE APPS */}
      {activeTab === 'manage' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1c1c1e] border border-black/5 dark:border-white/10 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                Live Applications Directory
              </h2>
              <p className="text-xs text-black/50 dark:text-white/50">
                {apps.length} applications published and ready for direct download
              </p>
            </div>
            {apps.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Delete all applications and restore a completely clean store?')) {
                    clearAllDemoData();
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Apps (Clean Store)</span>
              </button>
            )}
          </div>

          <div className="divide-y divide-black/[0.06] dark:divide-white/[0.08] overflow-hidden">
            {apps.map((app) => (
              <div
                key={app.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-[22%] overflow-hidden bg-black/10 shrink-0 shadow-xs">
                    <img src={app.icon_url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
                      <span>{app.name}</span>
                      {app.is_app_of_the_day && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-amber-500 text-white">
                          TODAY
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-black/50 dark:text-white/50">{app.category} • {app.file_size}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        {app.downloads_count.toLocaleString()} downloads
                      </span>
                      <span className="text-[11px] text-black/40 dark:text-white/40">
                        ★ {app.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => setSelectedApp(app)}
                    className="p-2 rounded-xl text-black/60 dark:text-white/60 hover:text-[#0071e3] hover:bg-[#0071e3]/10 transition-colors"
                    title="View App Details"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() =>
                      updateApp({
                        ...app,
                        is_app_of_the_day: !app.is_app_of_the_day,
                      })
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      app.is_app_of_the_day
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        : 'bg-black/[0.04] dark:bg-white/[0.06] text-black/60 dark:text-white/60'
                    }`}
                  >
                    {app.is_app_of_the_day ? '★ App of Day' : 'Make App of Day'}
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete "${app.name}"?`)) {
                        deleteApp(app.id);
                      }
                    }}
                    className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
                    title="Delete App"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: GOOGLE SEARCH CONSOLE & SEO */}
      {activeTab === 'seo' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1c1c1e] border border-black/5 dark:border-white/10 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
              Google Search Console & Automated SEO Indexing
            </h2>
            <p className="text-xs text-black/50 dark:text-white/50">
              Verify ownership in Google Search Console, generate sitemaps, and auto index your applications.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-black/60 dark:text-white/60 mb-1">
                Google Search Console Verification Token / Meta Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. google-site-verification=abcdef1234567890"
                  value={settings.google_search_console_token}
                  onChange={(e) =>
                    updateSettings({ google_search_console_token: e.target.value })
                  }
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] outline-none focus:border-[#0071e3]"
                />
              </div>
              <p className="text-[11px] text-black/40 dark:text-white/40 mt-1">
                Injected automatically into: <code className="text-black/70 dark:text-white/70">&lt;meta name=&quot;google-site-verification&quot; content=&quot;...&quot; /&gt;</code>
              </p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04]">
              <div>
                <div className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  Automatic Google Indexing & Schema.org JSON-LD
                </div>
                <p className="text-xs text-black/50 dark:text-white/50">
                  Embeds SoftwareApplication and ItemList metadata so Google can crawl and index each app page.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.auto_google_index}
                onChange={(e) => updateSettings({ auto_google_index: e.target.checked })}
                className="w-5 h-5 rounded text-[#0071e3]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-black/60 dark:text-white/60 mb-1">
                Store Title (SEO)
              </label>
              <input
                type="text"
                value={settings.site_title}
                onChange={(e) => updateSettings({ site_title: e.target.value })}
                className="w-full px-4 py-2.5 text-sm rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] outline-none focus:border-[#0071e3]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-black/60 dark:text-white/60 mb-1">
                Meta Description (Google Snippet)
              </label>
              <textarea
                rows={2}
                value={settings.site_description}
                onChange={(e) => updateSettings({ site_description: e.target.value })}
                className="w-full px-4 py-2.5 text-sm rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] outline-none focus:border-[#0071e3]"
              />
            </div>

            {/* Sitemap & Google Console Actions */}
            <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <a
                  href="https://search.google.com/search-console"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0071e3] text-white text-xs font-semibold hover:bg-[#0077ed] transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Google Search Console</span>
                </a>
              </div>
              <span className="text-xs text-black/50 dark:text-white/50">
                JSON-LD structured data is active on all pages
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SUPABASE CLOUD & SCHEMA */}
      {activeTab === 'supabase' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1c1c1e] border border-black/5 dark:border-white/10 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                Supabase Database & Storage Configuration
              </h2>
              <p className="text-xs text-black/50 dark:text-white/50">
                Connected to Supabase Project: <code className="text-[#0071e3]">zuztlnyzbymywdpwhtee.supabase.co</code>
              </p>
            </div>
            <button
              onClick={handleTestSupabase}
              disabled={isTestingSupabase}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0071e3] text-white text-xs font-semibold hover:bg-[#0077ed] transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingSupabase ? 'animate-spin' : ''}`} />
              <span>{isTestingSupabase ? 'Testing...' : 'Test Connection'}</span>
            </button>
          </div>

          {supabaseTestStatus && (
            <div
              className={`p-4 rounded-2xl border text-xs font-medium ${
                supabaseTestStatus.success
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400'
              }`}
            >
              <div className="flex items-center gap-2 font-bold mb-1">
                {supabaseTestStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                )}
                <span>Connection Test Result</span>
              </div>
              <p>{supabaseTestStatus.message}</p>
            </div>
          )}

          {/* Schema SQL code block */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-black/60 dark:text-white/60">
                Supabase SQL Table Schema (apps, reviews, settings)
              </span>
              <button
                onClick={handleCopySQL}
                className="flex items-center gap-1 text-xs font-semibold text-[#0071e3] hover:underline"
              >
                {copiedSQL ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500">Copied SQL to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy SQL Schema</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-[#0e0e10] text-[#00ff88] text-xs font-mono overflow-x-auto max-h-64 border border-black/10 dark:border-white/10 select-all">
              {getSupabaseSchemaSQL()}
            </pre>
          </div>

          {/* Email Verification Redirect localhost:3000 Solution */}
          <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#0071e3]" />
              <h3 className="text-sm font-bold text-[#0071e3]">
                ভেরিফিকেশন ইমেইলে &apos;localhost:3000&apos; আসার কারণ ও ১-ক্লিকে সমাধান
              </h3>
            </div>
            <p className="text-xs text-black/70 dark:text-white/70 leading-relaxed">
              Supabase প্রজেক্টে ডিফল্ট <strong>Site URL</strong> হিসেবে <code>http://localhost:3000</code> দেওয়া থাকে। তাই সাইন-আপ ভেরিফিকেশন ইমেইলে <code>redirect_to=http://localhost:3000</code> চলে যায়। এটি ঠিক করতে:
            </p>
            <ol className="list-decimal list-inside text-xs text-black/70 dark:text-white/70 space-y-1.5 pl-1">
              <li>
                Supabase Dashboard এর <a href="https://supabase.com/dashboard/project/zuztlnyzbymywdpwhtee/auth/url-configuration" target="_blank" rel="noreferrer" className="text-[#0071e3] font-semibold underline">Authentication &gt; URL Configuration</a> এ যান।
              </li>
              <li>
                <strong>Site URL</strong> পরিবর্তন করে আপনার বর্তমান লাইভ URL দিন (নিচের বাটন দিয়ে কপি করুন)।
              </li>
              <li>
                অথবা <strong>Authentication &gt; Providers &gt; Email</strong> এ গিয়ে <strong>Confirm email</strong> অপশনটি <strong>OFF</strong> করে দিন, তাহলে ইমেইল ভেরিফিকেশন ছাড়াই সরাসরি লগইন হয়ে যাবে!
              </li>
            </ol>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin);
                  setCopiedOrigin(true);
                  setTimeout(() => setCopiedOrigin(false), 3000);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#0071e3] text-white text-xs font-semibold hover:bg-[#0077ed] transition-colors flex items-center gap-1.5 shadow-xs"
              >
                {copiedOrigin ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedOrigin ? 'Current URL Copied!' : 'Copy Current App Origin URL'}</span>
              </button>
              <span className="text-[11px] font-mono text-black/50 dark:text-white/50">
                {typeof window !== 'undefined' ? window.location.origin : ''}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SUPABASE & ADMIN SETUP GUIDE (README) */}
      {activeTab === 'readme' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1c1c1e] border border-black/5 dark:border-white/10 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                Supabase Real Login &amp; Configuration Guide (README)
              </h2>
              <p className="text-xs text-black/50 dark:text-white/50">
                সহজে Supabase রিয়েল লগইন, স্টোরেজ ও ডাটাবেজ কনফিগার করার সম্পূর্ণ ধাপসমূহ
              </p>
            </div>
            <a
              href="https://supabase.com/dashboard/project/zuztlnyzbymywdpwhtee"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0071e3] text-white text-xs font-semibold hover:bg-[#0077ed] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Supabase Project Dashboard</span>
            </a>
          </div>

          <div className="space-y-6 text-sm text-black/80 dark:text-white/80">
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 space-y-2">
              <h3 className="font-bold text-base text-[#0071e3] flex items-center gap-2">
                <span>1. Admin Account &amp; Real Supabase Login (রিয়েল লগইন)</span>
              </h3>
              <p className="text-xs text-black/60 dark:text-white/60">
                Designated Admin Email: <strong className="font-mono text-black dark:text-white">mr4425390@gmail.com</strong>
              </p>
              <div className="text-xs space-y-1.5 pt-1">
                <div>• <strong>Direct In-App Sign Up:</strong> Click <strong>Sign In</strong> in the header -&gt; <strong>Create one now</strong> with email <code className="bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded">mr4425390@gmail.com</code> and your chosen password.</div>
                <div>• <strong>Supabase Dashboard:</strong> Or visit <a href="https://supabase.com/dashboard/project/zuztlnyzbymywdpwhtee/auth/users" target="_blank" rel="noreferrer" className="text-[#0071e3] underline">Supabase Auth Users</a> and click <strong>Add User</strong>.</div>
                <div>• <strong>Crucial Tip:</strong> In Supabase Dashboard, go to <strong>Authentication -&gt; Providers -&gt; Email</strong> and turn <strong>OFF &quot;Confirm email&quot;</strong>. This allows instant login without waiting for email verification links.</div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 space-y-2">
              <h3 className="font-bold text-base text-[#0071e3] flex items-center gap-2">
                <span>2. Create Database Tables (SQL Editor / ডাটাবেস টেবিল)</span>
              </h3>
              <p className="text-xs text-black/60 dark:text-white/60">
                To create the required <code className="text-[#0071e3]">apps</code>, <code className="text-[#0071e3]">reviews</code>, and <code className="text-[#0071e3]">settings</code> tables:
              </p>
              <div className="text-xs space-y-1.5 pt-1">
                <div>• Open <a href="https://supabase.com/dashboard/project/zuztlnyzbymywdpwhtee/sql" target="_blank" rel="noreferrer" className="text-[#0071e3] underline">Supabase SQL Editor</a>.</div>
                <div>• Switch to the <strong>Supabase Cloud &amp; Schema</strong> tab in this admin panel, click <strong>Copy SQL Schema</strong>, paste it into Supabase SQL editor, and click <strong>RUN</strong>.</div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 space-y-2">
              <h3 className="font-bold text-base text-[#0071e3] flex items-center gap-2">
                <span>3. Direct File Downloads &amp; Storage Buckets (ফাইল ডাউনলোড)</span>
              </h3>
              <p className="text-xs text-black/60 dark:text-white/60">
                For permanent cloud file uploads and instant customer downloads:
              </p>
              <div className="text-xs space-y-1.5 pt-1">
                <div>• Go to <a href="https://supabase.com/dashboard/project/zuztlnyzbymywdpwhtee/storage/buckets" target="_blank" rel="noreferrer" className="text-[#0071e3] underline">Supabase Storage Buckets</a>.</div>
                <div>• Click <strong>New Bucket</strong>, name it <code className="font-mono bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded">apps</code>, and ensure <strong>Public bucket</strong> is toggled <strong>ON</strong>.</div>
                <div>• Also create bucket <code className="font-mono bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded">app-assets</code> (Public ON) for icons and previews.</div>
                <div>• Any files uploaded in the Admin form will be stored in Supabase Storage and will trigger an instant download when users click GET.</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
