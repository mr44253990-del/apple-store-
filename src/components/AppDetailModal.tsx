import React, { useState } from 'react';
import type { AppItem, ReviewItem } from '../types.ts';
import { useAppStore } from '../context/AppContext.tsx';
import { GetButton } from './GetButton.tsx';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Share2,
  Star,
  Download,
  Shield,
  Smartphone,
  Globe,
  Sparkles,
  ThumbsUp,
  MessageSquarePlus,
  Check,
  Play,
  Film,
  Video,
  Maximize2,
  Link,
  Copy,
} from 'lucide-react';

interface AppDetailModalProps {
  app: AppItem;
  onClose: () => void;
}

export const AppDetailModal: React.FC<AppDetailModalProps> = ({ app, onClose }) => {
  const { apps, reviews, addReview, settings, copyAppLink, generateAppLink } = useAppStore();
  const currentApp = apps.find((a) => a.id === app.id) || app;
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [selectedScreenshotIndex, setSelectedScreenshotIndex] = useState<number | null>(null);
  const [reviewForm, setReviewForm] = useState({
    author: '',
    rating: 5,
    title: '',
    comment: '',
  });
  const [copiedLink, setCopiedLink] = useState(false);

  const appReviews = reviews[currentApp.id] || [];

  const handleShare = () => {
    const link = generateAppLink(currentApp);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.author.trim() || !reviewForm.title.trim() || !reviewForm.comment.trim()) {
      return;
    }
    await addReview({
      appId: currentApp.id,
      author: reviewForm.author.trim(),
      rating: reviewForm.rating,
      title: reviewForm.title.trim(),
      comment: reviewForm.comment.trim(),
    });
    setReviewForm({ author: '', rating: 5, title: '', comment: '' });
    setIsWriteReviewOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#1c1c1e] md:rounded-3xl shadow-2xl min-h-screen md:min-h-0 md:max-h-[92vh] overflow-y-auto border border-white/10 dark:border-white/10">
        {/* Top Floating Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-xl border-b border-white/10 dark:border-white/10">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#0071e3] dark:text-[#2997ff] hover:opacity-80 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>ফিরে যান</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-white/10 dark:bg-white/10 hover:bg-white/20 dark:hover:bg-white/20 transition-colors text-black/70 dark:text-white/70"
              title="অ্যাপ শেয়ার করুন"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 dark:bg-white/10 hover:bg-white/20 dark:hover:bg-white/20 transition-colors text-black/70 dark:text-white/70"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content Body */}
        <div className="p-6 md:p-8 space-y-8">
          {/* App Header Info Row */}
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Squircle App Icon */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[22%] overflow-hidden shrink-0 shadow-lg shadow-black/10 border border-white/10 dark:border-white/10 bg-[#2c2c2e] dark:bg-black">
              <img
                src={currentApp.icon_url}
                alt={currentApp.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '';
                }}
              />
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {currentApp.name}
                </h1>
                <p className="text-sm sm:text-base text-black/60 dark:text-white/60 font-medium mt-0.5">
                  {currentApp.subtitle}
                </p>
                <p className="text-xs text-[#0071e3] dark:text-[#2997ff] font-medium mt-1">
                  {currentApp.developer}
                </p>
              </div>

              {/* Action row */}
              <div className="flex items-center gap-4 pt-1">
                <GetButton app={currentApp} size="lg" />
                {currentApp.in_app_purchases && (
                  <span className="text-[11px] text-black/40 dark:text-white/40">
                    In-App Purchases
                  </span>
                )}
                {/* Direct Download Link Info */}
                <span className="text-xs text-black/50 dark:text-white/50 flex items-center gap-1">
                  <Download className="w-3.5 h-3.5 text-black/40 dark:text-white/40" />
                  {currentApp.downloads_count.toLocaleString()} ডাউনলোড
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 py-4 border-y border-white/10 dark:border-white/10 text-center">
            {/* Rating */}
            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-black/40 dark:text-white/40">
                রেটিং
              </span>
              <div className="flex items-center gap-1 font-bold text-lg text-[#1d1d1f] dark:text-[#f5f5f7] my-0.5">
                <span>{currentApp.rating.toFixed(1)}</span>
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              </div>
              <span className="text-[10px] text-black/50 dark:text-white/50">
                {currentApp.rating_count ? `${Math.round(currentApp.rating_count / 1000)}K রিভিউ` : 'ভেরিফাইড'}
              </span>
            </div>

            {/* Age Rating */}
            <div className="flex flex-col items-center justify-center p-2 border-l border-white/10 dark:border-white/10">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-black/40 dark:text-white/40">
                বয়স
              </span>
              <span className="font-bold text-lg text-[#1d1d1f] dark:text-[#f5f5f7] my-0.5">
                {currentApp.age_rating || '4+'}
              </span>
              <span className="text-[10px] text-black/50 dark:text-white/50">বয়সের+\,সিলিং</span>
            </div>

            {/* Chart Rank */}
            <div className="flex flex-col items-center justify-center p-2 border-l border-white/10 dark:border-white/10">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-black/40 dark:text-white/40">
                चार্ট
              </span>
              <span className="font-bold text-lg text-[#1d1d1f] dark:text-[#f5f5f7] my-0.5">
                #1
              </span>
              <span className="text-[10px] text-black/50 dark:text-white/50 truncate max-w-[80px]">
                {currentApp.category}
              </span>
            </div>

            {/* Developer */}
            <div className="flex flex-col items-center justify-center p-2 border-l border-white/10 dark:border-white/10">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-black/40 dark:text-white/40">
                ডেভেলপার
              </span>
              <Shield className="w-5 h-5 text-black/70 dark:text-white/70 my-1" />
              <span className="text-[10px] text-black/50 dark:text-white/50 truncate max-w-[80px]">
                {currentApp.developer.split(' ')[0]}
              </span>
            </div>

            {/* Downloads Metric */}
            <div className="flex flex-col items-center justify-center p-2 border-l border-white/10 dark:border-white/10">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-black/40 dark:text-white/40">
                ডাউনলোড
              </span>
              <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400 my-0.5">
                {currentApp.downloads_count.toLocaleString()}
              </span>
              <span className="text-[10px] text-black/50 dark:text-white/50">ইনস্টলড</span>
            </div>

            {/* File Size */}
            <div className="flex flex-col items-center justify-center p-2 border-l border-white/10 dark:border-white/10">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-black/40 dark:text-white/40">
                সাইজ
              </span>
              <span className="font-bold text-lg text-[#1d1d1f] dark:text-[#f5f5f7] my-0.5">
                {currentApp.file_size || '68 MB'}
              </span>
              <span className="text-[10px] text-black/50 dark:text-white/50">ডিরেক্ট ফাইল</span>
            </div>
          </div>

          {/* Video Trailer / Demo Section (if available) */}
          {currentApp.video_url && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
                  <Film className="w-5 h-5 text-purple-500" />
                  <span>প্রিভিউ ভিডিও ও ট্রেলার</span>
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-purple-500/15 text-purple-600 dark:text-purple-400">
                  ট্রেলার
                </span>
              </div>
              <div className="relative rounded-3xl overflow-hidden border border-white/10 dark:border-white/10 bg-black shadow-xl aspect-video max-w-3xl mx-auto">
                {currentApp.video_url.includes('youtube.com/embed') || currentApp.video_url.includes('player.vimeo.com') ? (
                  <iframe
                    src={currentApp.video_url}
                    title={`${currentApp.name} ট্রেলার`}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={currentApp.video_url}
                    controls
                    playsInline
                    poster={currentApp.screenshots?.[0]}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
          )}

          {/* Screenshots Gallery */}
          {currentApp.screenshots && currentApp.screenshots.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
                  প্রিভিউ ({currentApp.screenshots.length} স্ক্রিনশট)
                </h2>
                <span className="text-xs text-black/40 dark:text-white/40">
                  বড় করতে কোনো ছবিতে ক্লিক করুন
                </span>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x scrollbar-thin">
                {currentApp.screenshots.map((src, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedScreenshotIndex(index)}
                    className="relative shrink-0 w-64 sm:w-72 h-[380px] sm:h-[420px] rounded-2xl overflow-hidden shadow-md border border-white/10 dark:border-white/10 bg-black/10 dark:bg-white/5 snap-center group text-left cursor-zoom-in"
                  >
                    <img
                      src={src}
                      alt={`${currentApp.name} প্রিভিউ ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/30 dark:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1.5 font-medium text-xs">
                      <Maximize2 className="w-4 h-4" />
                      <span>পূর্ণস্ক্রিনে দেখুন</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* What's New */}
          {currentApp.whats_new && (
            <div className="p-5 rounded-2xl bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  নতুন কী আছে
                </h2>
                <span className="text-xs text-black/50 dark:text-white/50">
                  সংস্করণ {currentApp.version}
                </span>
              </div>
              <p className="text-sm text-black/70 dark:text-white/70 leading-relaxed whitespace-pre-line">
                {currentApp.whats_new}
              </p>
            </div>
          )}

          {/* App Description */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
              বিবরণ
            </h2>
            <div
              className={`text-sm text-black/70 dark:text-white/70 leading-relaxed whitespace-pre-line ${
                isDescriptionExpanded ? '' : 'line-clamp-4'
              }`}
            >
              {currentApp.description}
            </div>
            <button
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              className="text-xs font-semibold text-[#0071e3] dark:text-[#2997ff] hover:underline"
            >
              {isDescriptionExpanded ? 'কম দেখান' : 'আরও'}
            </button>
          </div>

          {/* Hashtags Strip */}
          {currentApp.tags && currentApp.tags.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold text-black/40 dark:text-white/40 uppercase tracking-wider">
                সম্পর্কিত #ট্যাগ
              </span>
              <div className="flex flex-wrap gap-2">
                {currentApp.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      // handled by parent via context
                    }}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 dark:bg-white/10 hover:bg-[#0071e3]/10 hover:text-[#0071e3] dark:hover:text-[#2997ff] text-black/70 dark:text-white/70 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ratings & Customer Reviews Section */}
          <div className="space-y-6 pt-4 border-t border-white/10 dark:border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
                  রেটিং ও রিভিউ
                </h2>
                <p className="text-xs text-black/40 dark:text-white/40">
                  বাস্তব যাচাইকৃত ব্যবহারকারী মন্তব্য
                </p>
              </div>
              <button
                onClick={() => setIsWriteReviewOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#0071e3] dark:text-[#2997ff] bg-[#0071e3]/10 dark:bg-[#0071e3]/20 hover:bg-[#0071e3]/20 dark:hover:bg-[#0071e3]/30 transition-colors"
              >
                <MessageSquarePlus className="w-3.5 h-3.5" />
                <span>একটি রিভিউ লিখুন</span>
              </button>
            </div>

            {/* Score Breakdown Bars */}
            <div className="flex flex-col md:flex-row gap-6 items-center p-6 rounded-2xl bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10">
              <div className="text-center md:text-left shrink-0">
                <div className="text-5xl font-extrabold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {currentApp.rating.toFixed(1)}
                </div>
                <div className="flex items-center justify-center md:justify-start gap-1 my-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(currentApp.rating) ? 'fill-current' : 'fill-none stroke-current'}`}
                    />
                  ))}
                </div>
                <div className="text-xs text-black/50 dark:text-white/50">
                  ৫ থেকে
                </div>
              </div>

              {/* Progress bars */}
              <div className="flex-1 w-full space-y-1.5">
                {[
                  { stars: 5, percent: 85 },
                  { stars: 4, percent: 10 },
                  { stars: 3, percent: 3 },
                  { stars: 2, percent: 1 },
                  { stars: 1, percent: 1 },
                ].map((r) => (
                  <div key={r.stars} className="flex items-center gap-2 text-xs">
                    <span className="w-6 text-right font-medium text-black/60 dark:text-white/60">
                      {r.stars} ★
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-white/10 dark:bg-white/10 overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${r.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Reviews List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appReviews.length > 0 ? (
                appReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 rounded-2xl bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-[#1d1d1f] dark:text-[#f5f5f7]">
                        {rev.title}
                      </span>
                      <span className="text-xs text-black/40 dark:text-white/40">{rev.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center text-amber-400">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <span className="text-xs text-black/50 dark:text-white/50 font-medium">
                        দ্বারা {rev.author}
                      </span>
                    </div>
                    <p className="text-xs text-black/70 dark:text-white/70 leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-6 text-sm text-black/50 dark:text-white/50">
                  এখনও কোনো লিখিত রিভিউ নেই। প্রথম রিভিউটি লিখুন!
                </div>
              )}
            </div>
          </div>

          {/* App Information Card */}
          <div className="p-6 rounded-2xl bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10 space-y-3">
            <h3 className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
              তথ্য
            </h3>
            <div className="divide-y divide-white/10 dark:divide-white/10 text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-black/50 dark:text-white/50">প্রদানকারী</span>
                <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{currentApp.developer}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-black/50 dark:text-white/50">সাইজ</span>
                <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{currentApp.file_size}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-black/50 dark:text-white/50">ক্যাটাগরি</span>
                <span className="font-medium text-[#0071e3] dark:text-[#2997ff]">{currentApp.category}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-black/50 dark:text-white/50">সುসঙ্গততা</span>
                <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7] text-right max-w-xs">
                  {currentApp.compatibility || 'iPhone এবং iPad এর সাথে কাজ করে'}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-black/50 dark:text-white/50">ভাষা</span>
                <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {currentApp.languages ? currentApp.languages.join(', ') : 'English, Bengali'}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-black/50 dark:text-white/50">বয়স রেটিং</span>
                <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{currentApp.age_rating || '4+'}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-black/50 dark:text-white/50">ডিরেক্ট ডাউনলোড ফাইল</span>
                <a
                  href={currentApp.download_url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-[#0071e3] dark:text-[#2997ff] hover:underline truncate max-w-xs"
                >
                  {currentApp.download_url}
                </a>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-black/50 dark:text-white/50">কপিরাইট</span>
                <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                  © 2026 {currentApp.developer}. সব অধিকার সংরক্ষিত।
                </span>
              </div>
            </div>
          </div>

          {/* Shareable Link Section */}
          <div className="p-6 rounded-2xl bg-[#0071e3]/10 dark:bg-[#0071e3]/5 border border-[#0071e3]/20 dark:border-[#0071e3]/10 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
                <Link className="w-5 h-5 text-[#0071e3] dark:text-[#2997ff]" />
                <span>শেয়ারযোগ্য লিংক</span>
              </h3>
              <button
                onClick={handleShare}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#0071e3] dark:text-[#2997ff] bg-[#0071e3]/20 dark:bg-[#0071e3]/10 hover:bg-[#0071e3]/30 dark:hover:bg-[#0071e3]/20 transition-colors"
              >
                {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {copiedLink ? 'কপি করা হলো!' : 'লিংক কপি করুন'}
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={generateAppLink(currentApp)}
                readOnly
                className="flex-1 px-3.5 py-2 text-xs font-mono rounded-xl bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10 text-[#0071e3] dark:text-[#2997ff] outline-none"
              />
              <button
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(generateAppLink(currentApp));
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-[#0071e3] dark:bg-[#0071e3] text-white hover:bg-[#0077ed] dark:hover:bg-[#2997ff] text-xs font-bold transition-colors"
              >
                কপি
              </button>
            </div>
          </div>
        </div>

        {/* Write a Review Modal */}
        {isWriteReviewOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white dark:bg-[#242426] rounded-3xl p-6 shadow-2xl border border-white/10 dark:border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  একটি রিভিউ লিখুন
                </h3>
                <button
                  onClick={() => setIsWriteReviewOpen(false)}
                  className="p-1 rounded-full text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-black/60 dark:text-white/60 mb-1">
                    রেটিং
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewForm((f) => ({ ...f, rating: star }))}
                        className="p-1 text-amber-400 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-7 h-7 ${star <= reviewForm.rating ? 'fill-current' : 'fill-none stroke-current'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-black/60 dark:text-white/60 mb-1">
                    আপনার নাম বা হ্যান্ডেল
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: আপল_ইউজার"
                    value={reviewForm.author}
                    onChange={(e) => setReviewForm({ ...reviewForm, author: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] outline-none focus:border-[#0071e3]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-black/60 dark:text-white/60 mb-1">
                    রিভিউ শিরোনাম
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: দারুণ অভিজ্ঞতা ও ডিজাইন"
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] outline-none focus:border-[#0071e3]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-black/60 dark:text-white/60 mb-1">
                    রিভিউ মন্তব্য
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="এই অ্যাপে আপনার অভিজ্ঞতার詳細 লিখুন..."
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] outline-none focus:border-[#0071e3]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsWriteReviewOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-[#0071e3] dark:bg-[#0071e3] text-white text-xs font-semibold hover:bg-[#0077ed] dark:hover:bg-[#2997ff] transition-colors"
                  >
                    রিভিউ জমা দিন
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Screenshot Fullscreen Lightbox Modal */}
        {selectedScreenshotIndex !== null && currentApp.screenshots && currentApp.screenshots[selectedScreenshotIndex] && (
          <div className="fixed inset-0 z-70 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
            <button
              onClick={() => setSelectedScreenshotIndex(null)}
              className="absolute top-5 right-5 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="বंद করুন"
            >
              <X className="w-6 h-6" />
            </button>

            <button
              onClick={() =>
                setSelectedScreenshotIndex((prev) =>
                  prev !== null && prev > 0 ? prev - 1 : currentApp.screenshots.length - 1
                )
              }
              className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="পূর্বের স্ক্রিনশট"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="max-h-[85vh] max-w-[90vw] flex items-center justify-center">
              <img
                src={currentApp.screenshots[selectedScreenshotIndex]}
                alt={`স্ক্রিনশট ${selectedScreenshotIndex + 1}`}
                className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl border border-white/10"
              />
            </div>

            <button
              onClick={() =>
                setSelectedScreenshotIndex((prev) =>
                  prev !== null && prev < currentApp.screenshots.length - 1 ? prev + 1 : 0
                )
              }
              className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="পরবর্তী স্ক্রিনশট"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div className="absolute bottom-6 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-semibold">
              {selectedScreenshotIndex + 1} / {currentApp.screenshots.length}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
