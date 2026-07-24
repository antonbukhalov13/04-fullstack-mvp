import { type TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', id, ...rest }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={[
            'rounded-lg border bg-white px-3 py-2.5 text-base text-slate-900 placeholder:text-slate-400 transition duration-300 resize-y min-h-[80px]',
            'focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600',
            error ? 'border-red-500' : 'border-slate-300',
            className,
          ].join(' ')}
          {...rest}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
