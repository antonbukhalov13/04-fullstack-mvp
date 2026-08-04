import { type TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  dark?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, dark = false, className = '', id, ...rest }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={textareaId} className={`text-sm font-medium ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={[
            'rounded-lg border px-3 py-2.5 text-base transition duration-300 resize-y min-h-[80px]',
            'focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600',
            dark
              ? 'bg-slate-900/70 text-slate-100 placeholder:text-slate-500'
              : 'bg-white text-slate-900 placeholder:text-slate-400',
            error ? 'border-red-500' : dark ? 'border-slate-700' : 'border-slate-300',
            className,
          ].join(' ')}
          {...rest}
        />
        {error && <p className={`text-xs ${dark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
