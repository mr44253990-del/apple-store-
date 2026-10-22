import React from 'react';
import type { AppItem } from '../types.ts';
import { useAppStore } from '../context/AppContext.tsx';
import { Check } from 'lucide-react';

interface GetButtonProps {
  app: AppItem;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const GetButton: React.FC<GetButtonProps> = ({ app, size = 'md', className = '' }) => {
  const { downloadingAppId, downloadProgress, installedAppIds, triggerDownload } = useAppStore();

  const isDownloading = downloadingAppId === app.id;
  const isInstalled = installedAppIds.includes(app.id);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerDownload(app);
  };

  const sizeClasses = {
    sm: 'px-3 py-1 text-xs font-semibold',
    md: 'px-4 py-1.5 text-xs font-bold uppercase tracking-wider',
    lg: 'px-6 py-2.5 text-sm font-bold tracking-wide',
  };

  if (isDownloading) {
    const radius = size === 'lg' ? 16 : 12;
    const stroke = 2.5;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (downloadProgress / 100) * circumference;

    return (
      <div
        className={`relative flex items-center justify-center ${
          size === 'lg' ? 'w-10 h-10' : 'w-8 h-8'
        } ${className}`}
        title={`ডাউনলোড ${downloadProgress}%`}
      >
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90 origin-center">
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={stroke}
            className="text-white/20 dark:text-black/20"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            className="text-[#0071e3] transition-all duration-150"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <div className="absolute w-2 h-2 rounded-xs bg-[#0071e3]" />
      </div>
    );
  }

  if (isInstalled) {
    return (
      <button
        onClick={handleClick}
        className={`rounded-full bg-[#0071e3]/10 dark:bg-[#0071e3]/20 text-[#0071e3] dark:text-[#2997ff] hover:bg-[#0071e3]/20 dark:hover:bg-[#0071e3]/30 transition-all active:scale-95 flex items-center justify-center gap-1.5 ${sizeClasses[size]} ${className}`}
      >
        <Check className="w-3.5 h-3.5" />
        <span>ওপেন করুন</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`rounded-full bg-white/10 dark:bg-white/10 hover:bg-white/20 dark:hover:bg-white/20 text-[#0071e3] dark:text-[#2997ff] active:scale-95 transition-all text-center flex items-center justify-center shadow-xs ${sizeClasses[size]} ${className}`}
    >
      {app.price && app.price > 0 ? `$${app.price.toFixed(2)}` : 'নিন'}
    </button>
  );
};
