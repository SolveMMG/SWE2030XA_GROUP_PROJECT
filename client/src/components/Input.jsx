import { forwardRef, useId } from 'react';

const Input = forwardRef(function Input(
  { className = '', error, hint, id, label, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id || props.name || generatedId;

  return (
    <label className="block" htmlFor={inputId}>
      {label && <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>}
      <input
        {...props}
        ref={ref}
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error || hint ? `${inputId}-description` : undefined}
        className={`min-h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${error ? 'border-red-500' : 'border-slate-300'} ${className}`}
      />
      {(error || hint) && <span id={`${inputId}-description`} className={`mt-1.5 block text-xs ${error ? 'text-red-600' : 'text-muted'}`}>{error || hint}</span>}
    </label>
  );
});

export default Input;
