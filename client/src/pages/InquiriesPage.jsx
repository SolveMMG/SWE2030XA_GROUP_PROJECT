import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { useToast } from '../context/ToastContext';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';
import Modal from '../components/Modal';
import StarRating from '../components/StarRating';

function ReviewModal({ inquiry, onClose, onSubmitted }) {
  const [rating, setRating]   = useState(5);
  const [comment, setComment] = useState('');
  const [saving, setSaving]   = useState(false);
  const toast = useToast();

  async function submit() {
    setSaving(true);
    try {
      await api.post('/reviews', {
        inquiryId: inquiry.id,
        rating,
        comment: comment.trim() || undefined,
      });
      toast.success('Review submitted!');
      onSubmitted();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error?.message ?? 'Failed to submit review');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={`Review: ${inquiry.listing?.title}`}>
      <p className="text-sm text-gray-500 mb-4">
        Rate your experience working with <strong>{inquiry.seller?.name}</strong>
      </p>

      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Rating</p>
        <StarRating value={rating} interactive onChange={setRating} size="lg" />
      </div>

      <div className="mb-5">
        <label className="text-sm font-medium text-gray-700 block mb-1">Comment (optional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Share your experience&hellip;"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={submit} loading={saving}>Submit Review</Button>
      </div>
    </Modal>
  );
}

export default function InquiriesPage() {
  const toast = useToast();
  const [tab, setTab]                   = useState('received');
  const [inquiries, setInquiries]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [reviewTarget, setReviewTarget] = useState(null);

  const loadInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/inquiries?role=${tab}`);
      setInquiries(data);
    } catch {
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { loadInquiries(); }, [loadInquiries]);

  async function doAction(id, action) {
    try {
      const { data } = await api.patch(`/inquiries/${id}/${action}`);
      setInquiries((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: data.status } : i))
      );
      toast.success(`Inquiry ${action}ed`);
    } catch (err) {
      toast.error(err.response?.data?.error?.message ?? 'Action failed');
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Inquiries</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {['received', 'sent'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
              tab === t
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : inquiries.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">&#128236;</p>
          <p className="font-medium">No {tab} inquiries yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inq) => {
            const canReview = tab === 'sent' && inq.status === 'accepted' && inq.review_count === 0;
            return (
              <Card key={inq.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-gray-900 truncate">
                        {inq.listing?.title}
                      </span>
                      <Badge label={inq.status} />
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      {tab === 'received'
                        ? `From: ${inq.buyer?.name}`
                        : `To: ${inq.seller?.name}`}
                    </p>
                    <p className="text-sm text-gray-600 line-clamp-2">{inq.message}</p>
                  </div>

                  <div className="flex flex-col gap-1.5 shrink-0">
                    {tab === 'received' && inq.status === 'pending' && (
                      <>
                        <Button
                          variant="primary"
                          className="text-xs py-1 px-3"
                          onClick={() => doAction(inq.id, 'accept')}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="secondary"
                          className="text-xs py-1 px-3"
                          onClick={() => doAction(inq.id, 'decline')}
                        >
                          Decline
                        </Button>
                      </>
                    )}
                    {canReview && (
                      <Button
                        variant="ghost"
                        className="text-xs py-1 px-3 text-blue-600"
                        onClick={() => setReviewTarget(inq)}
                      >
                        Leave review
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {reviewTarget && (
        <ReviewModal
          inquiry={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSubmitted={() =>
            setInquiries((prev) =>
              prev.map((i) => (i.id === reviewTarget.id ? { ...i, review_count: 1 } : i))
            )
          }
        />
      )}
    </main>
  );
}
