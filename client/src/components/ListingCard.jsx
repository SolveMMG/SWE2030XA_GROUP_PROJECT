import { Link } from 'react-router-dom';
import Card from './Card';
import Badge from './Badge';
import StarRating from './StarRating';

const CATEGORY_STYLES = {
  design:      { bg: '#ede9fe', color: '#7c3aed', emoji: '🎨' },
  programming: { bg: '#dbeafe', color: '#1d4ed8', emoji: '💻' },
  writing:     { bg: '#fef3c7', color: '#b45309', emoji: '✍️' },
  tutoring:    { bg: '#dcfce7', color: '#15803d', emoji: '📚' },
  music:       { bg: '#fce7f3', color: '#be185d', emoji: '🎵' },
  photography: { bg: '#ffedd5', color: '#c2410c', emoji: '📷' },
  other:       { bg: '#f1f5f9', color: '#475569', emoji: '✨' },
};

function CategoryPlaceholder({ category }) {
  const s = CATEGORY_STYLES[category] || CATEGORY_STYLES.other;
  return (
    <div
      className="w-full h-44 flex flex-col items-center justify-center gap-1 select-none"
      style={{ backgroundColor: s.bg }}
    >
      <span className="text-5xl leading-none">{s.emoji}</span>
      <span className="text-sm font-semibold mt-1 capitalize" style={{ color: s.color }}>
        {category}
      </span>
    </div>
  );
}

export default function ListingCard({ listing }) {
  return (
    <Link to={`/listings/${listing.id}`} className="block group">
      <Card className="overflow-hidden hover:shadow-md transition-shadow h-full">
        {listing.image_url ? (
          <img
            src={listing.image_url}
            alt={listing.title}
            className="w-full h-44 object-cover"
          />
        ) : (
          <CategoryPlaceholder category={listing.category} />
        )}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-1 flex-1">
              {listing.title}
            </h3>
            <Badge label={listing.category} />
          </div>
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{listing.description}</p>
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-blue-600">
              KSh {Number(listing.price).toLocaleString()}
            </span>
            <div className="flex items-center gap-1 text-xs text-gray-500 min-w-0">
              <StarRating value={listing.seller?.avgRating || 0} />
              <span className="truncate">{listing.seller?.name}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
