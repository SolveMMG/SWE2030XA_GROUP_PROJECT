import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ListingCard from '../components/ListingCard';
import Button from '../components/Button';
import Modal from '../components/Modal';

export default function MyListingsPage() {
  const { user }      = useAuth();
  const toast         = useToast();
  const [listings, setListings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [confirmId, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        // Fetch up to 100 listings then filter by seller_id (no seller-filter endpoint)
        const { data } = await api.get('/listings?limit=100');
        setListings(data.listings.filter((l) => l.seller_id === user?.id));
      } catch {
        // leave empty
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  async function handleDelete() {
    if (!confirmId) return;
    setDeleting(true);
    try {
      await api.delete(`/listings/${confirmId}`);
      setListings((prev) => prev.filter((l) => l.id !== confirmId));
      toast.success('Listing deleted');
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeleting(false);
      setConfirm(null);
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
        <Link
          to="/listings/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + New Listing
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading&hellip;</p>
      ) : listings.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <p className="text-5xl mb-4">&#128203;</p>
          <p className="font-medium text-lg">No listings yet</p>
          <Link to="/listings/new" className="mt-3 inline-block text-blue-600 text-sm hover:underline">
            Create your first listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((l) => (
            <div key={l.id} className="relative group">
              <ListingCard listing={l} />
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link
                  to={`/listings/${l.id}/edit`}
                  className="bg-white text-gray-700 text-xs px-2.5 py-1 rounded-md shadow border border-gray-200 hover:bg-gray-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  Edit
                </Link>
                <button
                  onClick={(e) => { e.preventDefault(); setConfirm(l.id); }}
                  className="bg-red-600 text-white text-xs px-2.5 py-1 rounded-md shadow hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!confirmId} onClose={() => setConfirm(null)} title="Delete listing?">
        <p className="text-sm text-gray-600 mb-5">This cannot be undone.</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirm(null)}>Cancel</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </main>
  );
}
