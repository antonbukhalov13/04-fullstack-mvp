import { type InputHTMLAttributes, forwardRef } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className = '', id, ...rest }, ref) => {
    const checkboxId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            className={[
              'h-4 w-4 rounded border-slate-300 accent-indigo-600 text-indigo-600 focus:ring-indigo-600 cursor-pointer',
              error ? 'border-red-500' : '',
              className,
            ].join(' ')}
            {...rest}
          />
          {label && <span className="text-sm text-slate-700">{label}</span>}
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  },
);

Checkbox.displayName = 'Checkbox';
