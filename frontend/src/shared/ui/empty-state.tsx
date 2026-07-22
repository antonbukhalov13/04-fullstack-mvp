import { type ReactNode } from 'react';
import { Spinner } from './spinner';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  loading?: boolean;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  loading = false,
  className = '',
}: EmptyStateProps) {
  if (loading) {
    return (
      <div className={['flex flex-col items-center justify-center py-12', className].join(' ')}>
        <Spinner size="lg" />
        <p className="mt-4 text-sm text-slate-500">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className={['flex flex-col items-center justify-center py-12', className].join(' ')}>
      {icon && <div className="text-slate-400 mb-4">{icon}</div>}
      <h3 className="text-sm font-medium text-slate-900">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
