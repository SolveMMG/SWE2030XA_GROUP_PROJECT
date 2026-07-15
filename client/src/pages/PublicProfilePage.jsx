import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import Card from '../components/Card';
import ListingCard from '../components/ListingCard';
import StarRating from '../components/StarRating';

function avatarUrl(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563eb&color=fff&size=80`;
}

export default function PublicProfilePage() {
  const { id } = useParams();

  const [profile, setProfile]   = useState(null);
  const [listings, setListings] = useState([]);
  const [reviews, setReviews]   = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [{ data: user }, { data: allL }, { data: rev }] = await Promise.all([
          api.get(`/users/${id}`),
          api.get(`/listings?sellerId=${id}&limit=100`),
          api.get(`/reviews?sellerId=${id}`),
        ]);
        setProfile(user);
        setListings(allL.listings);
        setReviews(rev);
      } catch {
        // leave null → show not found
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-8 text-gray-400">Loading&hellip;</div>;
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-gray-500 py-24">
        User not found.
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <img
            src={profile.photo_url || avatarUrl(profile.name)}
            alt={profile.name}
            className="w-16 h-16 rounded-full object-cover shrink-0"
          />
          <div>
            <h1 className="text-xl font-bold text-gray-900">{profile.name}</h1>
            <div className="flex items-center gap-1 mt-1">
              <StarRating value={parseFloat(profile.avg_rating) || 0} />
              <span className="text-xs text-gray-500">({profile.review_count || 0} reviews)</span>
            </div>
            {profile.bio && (
              <p className="text-sm text-gray-600 mt-2">{profile.bio}</p>
            )}
            {(profile.skills ?? []).length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {profile.skills.map((s) => (
                  <span key={s} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full capitalize">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      {listings.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Listings by {profile.name} ({listings.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        </section>
      )}

      {reviews?.reviews.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Reviews ({reviews.reviewCount})</h2>
          <div className="space-y-3">
            {reviews.reviews.map((r) => (
              <Card key={r.id} className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  {r.reviewer.photoUrl && (
                    <img src={r.reviewer.photoUrl} className="w-7 h-7 rounded-full" alt="" />
                  )}
                  <span className="text-sm font-medium">{r.reviewer.name}</span>
                  <StarRating value={r.rating} />
                </div>
                {r.comment && <p className="text-sm text-gray-600 mt-1">{r.comment}</p>}
              </Card>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
