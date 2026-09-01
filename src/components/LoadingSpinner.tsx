'use client';

import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ text = 'Loading...', size = 'md' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className="flex items-center justify-center gap-3">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-gray-500`} />
      <span className="text-sm text-gray-600">{text}</span>
    </div>
  );
}