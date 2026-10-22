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
  const { apps, reviews, addReview, settings, copyAppLink, generateAppLink, setSelectedTag, setCurrentTab } = useAppStore();
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

  // Ratings calculation for histogram
  const totalReviewsCount = (currentApp.rating_count || 100) + appReviews.length;
  const ratingDistribution = [
    { stars: 5, percent: 85 },
    { stars: 4, percent: 10 },
    { stars: 3, percent: 3 },
    { stars: 2, percent: 1 },
    { stars: 1, percent: 1 },
  ];

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyAppLink = () => {
    copyAppLink(currentApp);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 bg-black/60 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#1c1c1e] md:rounded-3xl shadow-2xl min-h-screen md:min-h-0 md:max-h-[92vh] overflow-y-auto border border-black/5 dark:border-white/10">
        {/* Top Floating Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl border-b border-black/[0.06] dark:border-white/[0.08]">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#0071e3] hover:opacity-80 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAppLink}
              className="p-2 rounded-full bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] transition-colors text-black/70 dark:text-white/70"
              title="Copy App Link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Link className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] transition-colors text-black/70 dark:text-white/70"
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
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[22%] overflow-hidden shrink-0 shadow-lg shadow-black/10 border border-black/5 dark:border-white/10 bg-[#2c2c2e]">
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
                <p className="text-xs text-[#0071e3] font-medium mt-1">
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
                  {currentApp.downloads_count.toLocaleString()} downloads
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 py-4 border-y border-black/[0.06] dark:border-white/[0.08] text-center">
            {/* Rating */}
            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-black/40 dark:text-white/40">
                RATINGS
              </span>
              <div className="flex items-center gap-1 font-bold text-lg text-[#1d1d1f] dark:text-[#f5f5f7] my-0.5">
                <span>{currentApp.rating.toFixed(1)}</span>
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              </div>
              <span className="text-[10px] text-black/50 dark:text-white/50">
                {currentApp.rating_count ? `${Math.round(currentApp.rating_count / 1000)}K Reviews` : 'Verified'}
              </span>
            </div>

            {/* Age Rating */}
            <div className="flex flex-col items-center justify-center p-2 border-l border-black/[0.06] dark:border-white/[0.08]">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-black/40 dark:text-white/40">
                AGE
              </span>
              <span className="font-bold text-lg text-[#1d1d1f] dark:text-[#f5f5f7] my-0.5">
                {currentApp.age_rating || '4+'}
              </span>
              <span className="text-[10px] text-black/50 dark:text-white/50">
                Years Old
              </span>
            </div>

            {/* Chart Rank */}
            <div className="flex flex-col items-center justify-center p-2 border-l border-black/[0.06] dark:border-white/[0.08]">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-black/40 dark:text-white/40">
                CHART
              </span>
              <span className="font-bold text-lg text-[#1d1d1f] dark:text-[#f5f5f7] my-0.5">
                #1
              </span>
              <span className="text-[10px] text-black/50 dark:text-white/50 truncate max-w-[80px]">
                {currentApp.category}
              </span>
            </div>

            {/* Developer */}
            <div className="flex flex-col items-center justify-center p-2 border-l border-black/[0.06] dark:border-white/[0.08]">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-black/40 dark:text-white/40">
                DEVELOPER
              </span>
              <Shield className="w-5 h-5 text-black/70 dark:text-white/70 my-1" />
              <span className="text-[10px] text-black/50 dark:text-white/50 truncate max-w-[80px]">
                {currentApp.developer.split(' ')[0]}
              </span>
            </div>

            {/* Downloads Metric */}
            <div className="flex flex-col items-center justify-center p-2 border-l border-black/[0.06] dark:border-white/[0.08]">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-black/40 dark:text-white/40">
                DOWNLOADS
              </span>
              <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400 my-0.5">
                {currentApp.downloads_count.toLocaleString()}
              </span>
              <span className="text-[10px] text-black/50 dark:text-white/50">
                Installed
              </span>
            </div>

            {/* File Size */}
            <div className="flex flex-col items-center justify-center p-2 border-l border-black/[0.06] dark:border-white/[0.08]">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-black/40 dark:text-white/40">
                SIZE
              </span>
              <span className="font-bold text-lg text-[#1d1d1f] dark:text-[#f5f5f7] my-0.5">
                {currentApp.file_size || '68 MB'}
              </span>
              <span className="text-[10px] text-black/50 dark:text-white/50">
                Direct File
              </span>
            </div>
          </div>

          {/* Video Trailer / Demo Section (if available) */}
          {currentApp.video_url && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
                  <Film className="w-5 h-5 text-purple-500" />
                  <span>Preview Video & Trailer</span>
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-purple-500/15 text-purple-600 dark:text-purple-400">
                  Trailer
                </span>
              </div>
              <div className="relative rounded-3xl overflow-hidden border border-black/10 dark:border-white/10 bg-black shadow-xl aspect-video max-w-3xl mx-auto">
                {currentApp.video_url.includes('youtube.com/embed') || currentApp.video_url.includes('player.vimeo.com') ? (
                  <iframe
                    src={currentApp.video_url}
                    title={`${currentApp.name} Trailer`}
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
                  Preview ({currentApp.screenshots.length} Screenshots)
                </h2>
                <span className="text-xs text-black/40 dark:text-white/40">
                  Click any image to enlarge
                </span>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x scrollbar-thin">
                {currentApp.screenshots.map((src, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedScreenshotIndex(index)}
                    className="relative shrink-0 w-64 sm:w-72 h-[380px] sm:h-[420px] rounded-2xl overflow-hidden shadow-md border border-black/10 dark:border-white/10 bg-black/10 dark:bg-white/5 snap-center group text-left cursor-zoom-in"
                  >
                    <img
                      src={src}
                      alt={`${currentApp.name} preview ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1080&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1.5 font-medium text-xs">
                      <Maximize2 className="w-4 h-4" />
                      <span>View Fullscreen</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* What's New */}
          {currentApp.whats_new && (
            <div className="p-5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  What's New
                </h2>
                <span className="text-xs text-black/50 dark:text-white/50">
                  Version {currentApp.version}
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
              Description
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
              className="text-xs font-semibold text-[#0071e3] hover:underline"
            >
              {isDescriptionExpanded ? 'Show Less' : 'more'}
            </button>
          </div>

          {/* Hashtags Strip */}
          {currentApp.tags && currentApp.tags.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold text-black/40 dark:text-white/40 uppercase tracking-wider">
                Related #Tags
              </span>
              <div className="flex flex-wrap gap-2">
                {currentApp.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSelectedTag(tag);
                      setCurrentTab('search');
                      onClose();
                    }}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-black/[0.05] dark:bg-white/[0.08] hover:bg-[#0071e3]/10 hover:text-[#0071e3] text-black/70 dark:text-white/70 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ratings & Customer Reviews Section */}
          <div className="space-y-6 pt-4 border-t border-black/[0.06] dark:border-white/[0.08]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
                  Ratings & Reviews
                </h2>
                <p className="text-xs text-black/40 dark:text-white/40">
                  Real verified user feedback
                </p>
              </div>
              <button
                onClick={() => setIsWriteReviewOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#0071e3] bg-[#0071e3]/10 hover:bg-[#0071e3]/20 transition-colors"
              >
                <MessageSquarePlus className="w-3.5 h-3.5" />
                <span>Write a Review</span>
              </button>
            </div>

            {/* Score Breakdown Bars */}
            <div className="flex flex-col md:flex-row gap-6 items-center p-6 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05]">
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
                  out of 5 stars
                </div>
              </div>

              {/* Progress bars */}
              <div className="flex-1 w-full space-y-1.5">
                {ratingDistribution.map((r) => (
                  <div key={r.stars} className="flex items-center gap-2 text-xs">
                    <span className="w-6 text-right font-medium text-black/60 dark:text-white/60">
                      {r.stars} ★
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-black/[0.06] dark:bg-white/[0.1] overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${r.percent}%` }}
                      />
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
                    className="p-5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] space-y-2"
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
                        by {rev.author}
                      </span>
                    </div>
                    <p className="text-xs text-black/70 dark:text-white/70 leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-6 text-sm text-black/50 dark:text-white/50">
                  No written reviews yet. Be the first to write a review!
                </div>
              )}
            </div>
          </div>

          {/* App Information Card */}
          <div className="p-6 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05] space-y-3">
            <h3 className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
              Information
            </h3>
            <div className="divide-y divide-black/[0.06] dark:divide-white/[0.08] text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-black/50 dark:text-white/50">Provider</span>
                <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{currentApp.developer}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-black/50 dark:text-white/50">Size</span>
                <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{currentApp.file_size}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-black/50 dark:text-white/50">Category</span>
                <span className="font-medium text-[#0071e3]">{currentApp.category}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-black/50 dark:text-white/50">Compatibility</span>
                <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7] text-right max-w-xs">
                  {currentApp.compatibility || 'Works on iPhone and iPad'}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-black/50 dark:text-white/50">Languages</span>
                <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {currentApp.languages ? currentApp.languages.join(', ') : 'English, Spanish, French, German'}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-black/50 dark:text-white/50">Age Rating</span>
                <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{currentApp.age_rating || '4+'}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-black/50 dark:text-white/50">Direct Download File</span>
                <a
                  href={currentApp.download_url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-[#0071e3] hover:underline truncate max-w-xs"
                >
                  {currentApp.download_url}
                </a>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-black/50 dark:text-white/50">Copyright</span>
                <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                  © 2026 {currentApp.developer}. All rights reserved.
                </span>
              </div>
            </div>
          </div>

          {/* Shareable Link Section */}
          <div className="p-6 rounded-2xl bg-[#0071e3]/10 dark:bg-[#0071e3]/5 border border-[#0071e3]/20 dark:border-[#0071e3]/10 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
                <Link className="w-5 h-5 text-[#0071e3] dark:text-[#2997ff]" />
                <span>Shareable Link</span>
              </h3>
              <button
                onClick={handleCopyAppLink}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#0071e3] dark:text-[#2997ff] bg-[#0071e3]/20 dark:bg-[#0071e3]/10 hover:bg-[#0071e3]/30 dark:hover:bg-[#0071e3]/20 transition-colors"
              >
                {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {copiedLink ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={generateAppLink(currentApp)}
                readOnly
                className="flex-1 px-3.5 py-2 text-xs font-mono rounded-xl bg-white/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#0071e3] dark:text-[#2997ff] outline-none"
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
                Copy
              </button>
            </div>
          </div>
        </div>

        {/* Write a Review Modal */}
        {isWriteReviewOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white dark:bg-[#242426] rounded-3xl p-6 shadow-2xl border border-black/10 dark:border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  Write a Review
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
                    Rating
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
                          className={`w-7 h-7 ${
                            star <= reviewForm.rating ? 'fill-current' : 'fill-none stroke-current'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-black/60 dark:text-white/60 mb-1">
                    Your Name or Handle
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex_AppleUser"
                    value={reviewForm.author}
                    onChange={(e) => setReviewForm({ ...reviewForm, author: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] outline-none focus:border-[#0071e3]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-black/60 dark:text-white/60 mb-1">
                    Review Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fantastic experience and design"
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] outline-none focus:border-[#0071e3]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-black/60 dark:text-white/60 mb-1">
                    Review Comment
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Share details of your experience with this app..."
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] outline-none focus:border-[#0071e3]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsWriteReviewOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-[#0071e3] text-white text-xs font-semibold hover:bg-[#0077ed] transition-colors"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Screenshot Fullscreen Lightbox Modal */}
        {selectedScreenshotIndex !== null && app.screenshots && app.screenshots[selectedScreenshotIndex] && (
          <div className="fixed inset-0 z-70 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
            <button
              onClick={() => setSelectedScreenshotIndex(null)}
              className="absolute top-5 right-5 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Close preview"
            >
              <X className="w-6 h-6" />
            </button>

            <button
              onClick={() =>
                setSelectedScreenshotIndex((prev) =>
                  prev !== null && prev > 0 ? prev - 1 : app.screenshots.length - 1
                )
              }
              className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Previous screenshot"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="max-h-[85vh] max-w-[90vw] flex items-center justify-center">
              <img
                src={app.screenshots[selectedScreenshotIndex]}
                alt={`Screenshot ${selectedScreenshotIndex + 1}`}
                className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl border border-white/10"
              />
            </div>

            <button
              onClick={() =>
                setSelectedScreenshotIndex((prev) =>
                  prev !== null && prev < app.screenshots.length - 1 ? prev + 1 : 0
                )
              }
              className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Next screenshot"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div className="absolute bottom-6 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-semibold">
              {selectedScreenshotIndex + 1} / {app.screenshots.length}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
