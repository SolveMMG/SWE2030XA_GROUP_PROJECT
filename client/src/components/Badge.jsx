const COLOR_MAP = {
  design:      'bg-purple-100 text-purple-700',
  programming: 'bg-blue-100 text-blue-700',
  writing:     'bg-yellow-100 text-yellow-800',
  tutoring:    'bg-green-100 text-green-700',
  music:       'bg-pink-100 text-pink-700',
  photography: 'bg-orange-100 text-orange-700',
  other:       'bg-gray-100 text-gray-600',
  pending:     'bg-amber-100 text-amber-700',
  accepted:    'bg-green-100 text-green-700',
  declined:    'bg-red-100 text-red-600',
};

export default function Badge({ label, className = '' }) {
  const color = COLOR_MAP[label] ?? 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${color} ${className}`}>
      {label}
    </span>
  );
}
