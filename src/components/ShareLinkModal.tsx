import React, { useState } from 'react';
import type { AppItem } from '../types.ts';
import { QRCode } from './QRCode.tsx';
import { AppIcon } from './AppIcon.tsx';
import {
  X,
  Copy,
  Check,
  Share2,
  Download,
  ExternalLink,
  Smartphone,
  Send,
  MessageCircle,
} from 'lucide-react';

interface ShareLinkModalProps {
  app: AppItem;
  isOpen?: boolean;
  onClose: () => void;
}

export const ShareLinkModal: React.FC<ShareLinkModalProps> = ({ app, isOpen = true, onClose }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedFileUrl, setCopiedFileUrl] = useState(false);
  const [activeShareTab, setActiveShareTab] = useState<'link' | 'qr'>('link');

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = `${origin}/?app=${app.id}`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyFileUrl = () => {
    if (navigator.clipboard && app.download_url) {
      navigator.clipboard.writeText(app.download_url);
      setCopiedFileUrl(true);
      setTimeout(() => setCopiedFileUrl(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${app.name} on App Store`,
          text: `Download ${app.name} (${app.category}) on Apple App Store:`,
          url: shareUrl,
        });
      } catch (err) {
        // Share cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `Download ${app.name} on Apple App Store: ${shareUrl}`
  )}`;

  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(
    `Download ${app.name} on Apple App Store`
  )}`;

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-[#1c1c1e] rounded-3xl p-6 shadow-2xl border border-black/10 dark:border-white/10 space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#0071e3]" />
            <h3 className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
              Share &amp; Link Generator
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white bg-black/[0.04] dark:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* App Quick Glance */}
        <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.06]">
          <AppIcon name={app.name} iconUrl={app.icon_url} size="sm" />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-[#1d1d1f] dark:text-[#f5f5f7] truncate">
              {app.name}
            </h4>
            <p className="text-xs text-black/50 dark:text-white/50 truncate">
              {app.subtitle || app.developer}
            </p>
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#0071e3]/10 text-[#0071e3]">
            {app.category}
          </span>
        </div>

        {/* Share Tabs: Link vs QR Code */}
        <div className="flex rounded-xl bg-black/[0.04] dark:bg-white/[0.06] p-1 text-xs font-semibold">
          <button
            onClick={() => setActiveShareTab('link')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeShareTab === 'link'
                ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] shadow-xs'
                : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'
            }`}
          >
            Deep Link URL
          </button>
          <button
            onClick={() => setActiveShareTab('qr')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeShareTab === 'qr'
                ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] shadow-xs'
                : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile QR Code</span>
          </button>
        </div>

        {activeShareTab === 'link' ? (
          <div className="space-y-4">
            {/* Direct Deep Link */}
            <div>
              <label className="block text-xs font-semibold text-black/60 dark:text-white/60 mb-1.5">
                Direct Store Link (Auto-opens this app for anyone)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 px-3.5 py-2.5 text-xs rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] font-mono outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-4 py-2.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 shrink-0"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Direct File Download link */}
            {app.download_url && (
              <div>
                <label className="block text-xs font-semibold text-black/60 dark:text-white/60 mb-1.5">
                  Direct Binary / Payload Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={app.download_url}
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-black/60 dark:text-white/60 font-mono outline-none truncate"
                  />
                  <button
                    type="button"
                    onClick={handleCopyFileUrl}
                    className="px-3.5 py-2 rounded-xl bg-black/[0.06] dark:bg-white/[0.08] hover:bg-black/[0.1] text-black/80 dark:text-white/80 text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    {copiedFileUrl ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Download className="w-3.5 h-3.5" />}
                    <span>{copiedFileUrl ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Instant Social Channels */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-black/60 dark:text-white/60 mb-2">
                Quick Share via
              </label>
              <div className="grid grid-cols-3 gap-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 text-xs font-semibold transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Telegram</span>
                </a>
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#0071e3]/10 hover:bg-[#0071e3]/20 text-[#0071e3] text-xs font-semibold transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>More...</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Mobile QR Code View */
          <div className="flex flex-col items-center justify-center space-y-4 py-2 text-center">
            <QRCode value={shareUrl} size={180} />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                Scan with any Phone Camera or Scanner
              </p>
              <p className="text-[11px] text-black/50 dark:text-white/50 max-w-xs">
                Instantly opens {app.name} on mobile device for direct downloading.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-4 py-2 rounded-xl bg-[#0071e3] text-white text-xs font-semibold hover:bg-[#0077ed] transition-colors flex items-center gap-1.5"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Link Instead'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
