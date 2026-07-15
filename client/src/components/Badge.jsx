const tones = {
  brand: 'bg-brand-100 text-brand-800',
  accent: 'bg-accent-100 text-accent-600',
  neutral: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-100 text-emerald-700',
  danger: 'bg-red-100 text-red-700',
};

export default function Badge({ children, className = '', tone = 'brand' }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]} ${className}`}>{children}</span>;
}
