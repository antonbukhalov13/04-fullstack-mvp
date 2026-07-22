interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusColors: Record<string, string> = {
  // Application statuses
  new: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',

  // Loan statuses
  pending_signature: 'bg-amber-100 text-amber-700',
  active: 'bg-green-100 text-green-700',
  closed: 'bg-slate-100 text-slate-700',

  // Schedule / Payment statuses
  pending: 'bg-amber-100 text-amber-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
  new: 'Новая',
  in_progress: 'В обработке',
  approved: 'Одобрена',
  rejected: 'Отклонена',
  pending_signature: 'Ожидает подписания',
  active: 'Активный',
  closed: 'Закрыт',
  pending: 'Ожидает',
  paid: 'Оплачен',
  overdue: 'Просрочен',
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const colorClasses = statusColors[status] ?? 'bg-slate-100 text-slate-700';
  const label = statusLabels[status] ?? status;

  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        colorClasses,
        className,
      ].join(' ')}
    >
      {label}
    </span>
  );
}
