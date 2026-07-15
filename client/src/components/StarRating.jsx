const SIZES = { sm: 'text-sm', md: 'text-base', lg: 'text-2xl' };

export default function StarRating({ value = 0, max = 5, interactive = false, onChange, size = 'sm' }) {
  return (
    <div className={`flex gap-0.5 ${SIZES[size] ?? SIZES.sm}`}>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          role={interactive ? 'button' : undefined}
          onClick={() => interactive && onChange?.(i + 1)}
          className={`${i < Math.round(value) ? 'text-amber-400' : 'text-gray-300'} ${
            interactive ? 'cursor-pointer hover:text-amber-300 transition-colors' : ''
          }`}
        >
          &#9733;
        </span>
      ))}
    </div>
  );
}
