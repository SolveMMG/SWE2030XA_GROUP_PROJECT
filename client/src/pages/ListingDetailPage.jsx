import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';
import Modal from '../components/Modal';
import StarRating from '../components/StarRating';

const PLACEHOLDER = 'https://placehold.co/800x400/e2e8f0/94a3b8?text=No+Image';

function DetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-72 bg-gray-200 rounded-xl mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-3">
          <div className="h-7 bg-gray-200 rounded w-2/3" />
          <div className="h-5 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-100 rounded" />
          <div className="h-4 bg-gray-100 rounded w-5/6" />
        </div>
        <div className="h-40 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}

export default function ListingDetailPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [listing, setListing]   = useState(null);
  const [reviews, setReviews]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [modalOpen, setModal]   = useState(false);
  const [message, setMessage]   = useState('');
  const [sending, setSending]   = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const { data: l } = await api.get(`/listings/${id}`);
        setListing(l);
        const { data: r } = await api.get(`/reviews?sellerId=${l.seller.id}`);
        setReviews(r);
      } catch {
        navigate('/');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, navigate]);

  async function sendInquiry() {
    if (!message.trim()) return;
    setSending(true);
    try {
      await api.post('/inquiries', { listingId: parseInt(id), message });
      toast.success('Inquiry sent! The seller will be in touch.');
      setModal(false);
      setMessage('');
    } catch (err) {
      toast.error(err.response?.data?.error?.message ?? 'Failed to send inquiry');
    } finally {
      setSending(false);
    }
  }

  if (loading) return <DetailSkeleton />;
  if (!listing) return null;

  const isOwner = user?.id === listing.seller.id;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <img
        src={listing.image_url || PLACEHOLDER}
        alt={listing.title}
        className="w-full h-72 object-cover rounded-xl mb-6"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="md:col-span-2">
          <div className="flex items-start gap-3 mb-2 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900 flex-1">{listing.title}</h1>
            <Badge label={listing.category} />
          </div>
          <p className="text-2xl font-bold text-blue-600 mb-4">
            KSh {Number(listing.price).toLocaleString()}
          </p>
          <p className="text-gray-600 whitespace-pre-wrap leading-relaxed mb-8">
            {listing.description}
          </p>

          {reviews?.reviews.length > 0 && (
            <section>
              <h2 className="font-semibold text-gray-900 mb-3">
                Reviews ({reviews.reviewCount})
                {reviews.avgRating && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    &mdash; avg {reviews.avgRating} &#9733;
                  </span>
                )}
              </h2>
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
        </div>

        {/* Sidebar */}
        <aside>
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-4">
              {listing.seller.photoUrl ? (
                <img src={listing.seller.photoUrl} className="w-10 h-10 rounded-full object-cover" alt="" />
              ) : (
                <span className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center">
                  {listing.seller.name?.[0]?.toUpperCase()}
                </span>
              )}
              <div>
                <Link to={`/users/${listing.seller.id}`} className="font-semibold text-gray-900 hover:text-blue-600 transition-colors block">
                  {listing.seller.name}
                </Link>
                <div className="flex items-center gap-1">
                  <StarRating value={listing.seller.avgRating || 0} />
                  <span className="text-xs text-gray-500">({listing.seller.reviewCount || 0})</span>
                </div>
              </div>
            </div>

            {listing.seller.bio && (
              <p className="text-sm text-gray-500 mb-4 line-clamp-3">{listing.seller.bio}</p>
            )}

            {isOwner ? (
              <Button variant="secondary" className="w-full" onClick={() => navigate(`/listings/${id}/edit`)}>
                Edit listing
              </Button>
            ) : isAuthenticated ? (
              <Button className="w-full" onClick={() => setModal(true)}>
                Send Inquiry
              </Button>
            ) : (
              <Link
                to="/login"
                className="block text-center bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Sign in to inquire
              </Link>
            )}
          </Card>
        </aside>
      </div>

      <Modal open={modalOpen} onClose={() => setModal(false)} title={`Inquire: ${listing.title}`}>
        <p className="text-sm text-gray-500 mb-3">
          Tell {listing.seller.name} what you need and any relevant details.
        </p>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Hi, I&apos;m interested in your service&hellip;"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4"
        />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
          <Button onClick={sendInquiry} loading={sending} disabled={!message.trim()}>Send</Button>
        </div>
      </Modal>
    </main>
  );
}
