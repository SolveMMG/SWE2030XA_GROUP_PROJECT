import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import ListingCard from '../components/ListingCard';
import Button from '../components/Button';

const CATEGORY_META = [
  { key: 'design',      emoji: '🎨', label: 'Design' },
  { key: 'programming', emoji: '💻', label: 'Programming' },
  { key: 'writing',     emoji: '✍️', label: 'Writing' },
  { key: 'tutoring',    emoji: '📚', label: 'Tutoring' },
  { key: 'music',       emoji: '🎵', label: 'Music' },
  { key: 'photography', emoji: '📷', label: 'Photography' },
  { key: 'other',       emoji: '✨', label: 'Other' },
];

function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-44 bg-gray-200" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
        <div className="flex justify-between mt-3">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-3 bg-gray-100 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  const [listings, setListings]   = useState([]);
  const [page, setPage]           = useState(1);
  const [totalPages, setTotal]    = useState(1);
  const [search, setSearch]       = useState('');
  const [category, setCategory]   = useState('');
  const [loading, setLoading]     = useState(true);
  const [searchInput, setInput]   = useState('');

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search)   params.search   = search;
      if (category) params.category = category;
      const { data } = await api.get(`/listings?${new URLSearchParams(params)}`);
      setListings(data.listings);
      setTotal(data.totalPages);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, category]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  function handleSearch(e) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  function toggleCategory(cat) {
    setCategory((prev) => (prev === cat ? '' : cat));
    setPage(1);
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-8 mb-8 text-white">
        <h1 className="text-3xl font-bold mb-1">Find Student Talent</h1>
        <p className="text-blue-100 mb-6 text-sm">
          Hire skilled students. Share what you know. Exchange services peer-to-peer.
        </p>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {CATEGORY_META.map(({ key, emoji, label }) => (
            <button
              key={key}
              onClick={() => toggleCategory(key)}
              className={`flex flex-col items-center gap-1 p-2.5 rounded-xl text-xs font-medium transition-all ${
                category === key
                  ? 'bg-white text-blue-700 shadow-md'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <span className="text-2xl leading-none">{emoji}</span>
              <span className="leading-tight text-center">{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Search + filter row */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            value={searchInput}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search skills, services&hellip;"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button type="submit">Search</Button>
          {search && (
            <Button type="button" variant="ghost" onClick={() => { setSearch(''); setInput(''); setPage(1); }}>
              Clear
            </Button>
          )}
        </form>

        <div className="flex flex-wrap gap-2">
          {CATEGORY_META.map(({ key, emoji, label }) => (
            <button
              key={key}
              onClick={() => toggleCategory(key)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                category === key
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
              }`}
            >
              <span>{emoji}</span>
              <span className="capitalize">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }, (_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <p className="text-5xl mb-4">&#128269;</p>
          <p className="font-medium text-lg">No skills found</p>
          <p className="text-sm mt-1">Try a different search term or category</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {listings.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <Button variant="secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                &larr; Previous
              </Button>
              <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
              <Button variant="secondary" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                Next &rarr;
              </Button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
