import { type SelectHTMLAttributes, forwardRef, type ReactNode } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  placeholder?: string;
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, placeholder, className = '', id, children, ...rest }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={[
              'w-full rounded-lg border bg-white px-3 py-2.5 pr-8 text-base text-slate-900 transition duration-300 appearance-none min-h-[44px]',
              'focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600',
              error ? 'border-red-500' : 'border-slate-300',
              className,
            ].join(' ')}
            {...rest}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {children}
          </select>
          <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 flex flex-col">
            <svg className="h-2.5 w-2.5 text-slate-400" viewBox="0 0 10 6" fill="currentColor">
              <path d="M0 6l5-6 5 6z" />
            </svg>
            <svg className="h-2.5 w-2.5 text-slate-400" viewBox="0 0 10 6" fill="currentColor">
              <path d="M0 0l5 6 5-6z" />
            </svg>
          </div>
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  },
);

Select.displayName = 'Select';
