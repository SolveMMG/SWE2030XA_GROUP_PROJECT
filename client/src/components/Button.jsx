const variants = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500',
  secondary: 'bg-brand-100 text-brand-800 hover:bg-brand-200 focus-visible:ring-brand-500',
  outline: 'border border-brand-600 bg-transparent text-brand-700 hover:bg-brand-50 focus-visible:ring-brand-500',
  ghost: 'bg-transparent text-ink hover:bg-slate-100 focus-visible:ring-slate-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
};

const sizes = {
  sm: 'min-h-9 px-3 text-sm',
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-12 px-5 text-base',
};

export default function Button({
  children,
  className = '',
  disabled = false,
  loading = false,
  size = 'md',
  to,
  type = 'button',
  variant = 'primary',
  ...props
}) {
  const Component = to ? Link : 'button';
  return (
    <Component
      {...props}
      {...(!to && { type })}
      {...(to && { to })}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />}
      {children}
    </Component>
  );
}
import { Link } from 'react-router-dom';
