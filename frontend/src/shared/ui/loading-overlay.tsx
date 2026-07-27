import { type ReactNode } from 'react';

interface LoadingOverlayProps {
  loading: boolean;
  hasData: boolean;
  children: ReactNode;
}

export function LoadingOverlay({ loading, hasData, children }: LoadingOverlayProps) {
  return (
    <div className="relative">
      {loading && hasData && (
        <div className="absolute inset-0 z-10 flex items-start justify-center pt-2">
          <div className="h-1 w-16 animate-pulse rounded-full bg-indigo-400" />
        </div>
      )}
      {children}
    </div>
  );
}
