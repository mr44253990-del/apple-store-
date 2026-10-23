import React, { useState } from 'react';

interface AppIconProps {
  name: string;
  iconUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const GRADIENTS = [
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-pink-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-red-600',
  'from-cyan-500 to-blue-600',
];

export const AppIcon: React.FC<AppIconProps> = ({
  name,
  iconUrl,
  size = 'md',
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: 'w-10 h-10 text-sm rounded-[22%]',
    md: 'w-14 h-14 sm:w-16 sm:h-16 text-lg sm:text-xl rounded-[22%]',
    lg: 'w-20 h-20 sm:w-24 sm:h-24 text-2xl sm:text-3xl rounded-[22%]',
    xl: 'w-24 h-24 sm:w-32 sm:h-32 text-3xl sm:text-4xl rounded-[22%]',
  }[size];

  // Deterministic gradient based on app name
  const charCodeSum = (name || 'A')
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gradient = GRADIENTS[charCodeSum % GRADIENTS.length];
  const initial = (name || 'A').trim().charAt(0).toUpperCase();

  const showFallback = !iconUrl || hasError;

  return (
    <div
      className={`relative overflow-hidden shrink-0 shadow-md border border-black/5 dark:border-white/10 select-none flex items-center justify-center font-bold text-white ${sizeClasses} ${className}`}
    >
      {showFallback ? (
        <div
          className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center shadow-inner`}
        >
          <span className="drop-shadow-sm tracking-tight">{initial}</span>
        </div>
      ) : (
        <img
          src={iconUrl}
          alt={name}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      )}
    </div>
  );
};
