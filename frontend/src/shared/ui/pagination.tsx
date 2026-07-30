'use client';

interface PaginationProps {
  total: number;
  limit: number;
  offset: number;
  onPageChange: (offset: number) => void;
}

export function Pagination({ total, limit, offset, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  if (totalPages <= 1) return null;

  const scrollTop = () => {
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
  };

  const handlePrev = () => {
    onPageChange(Math.max(0, offset - limit));
    scrollTop();
  };

  const handleNext = () => {
    onPageChange(offset + limit);
    scrollTop();
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 text-sm text-slate-600">
      <span>
        {offset + 1}–{Math.min(offset + limit, total)} из {total}
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={handlePrev}
          disabled={currentPage <= 1}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-300 hover:text-slate-900 hover:border-slate-300 active:bg-slate-400 disabled:opacity-40 disabled:pointer-events-none transition-colors min-h-[36px]"
        >
          Назад
        </button>
        <span className="text-xs text-slate-500">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={currentPage >= totalPages}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-300 hover:text-slate-900 hover:border-slate-300 active:bg-slate-400 disabled:opacity-40 disabled:pointer-events-none transition-colors min-h-[36px]"
        >
          Далее
        </button>
      </div>
    </div>
  );
}
