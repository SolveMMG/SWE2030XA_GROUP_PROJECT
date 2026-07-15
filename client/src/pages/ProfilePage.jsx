import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import ListingCard from '../components/ListingCard';
import StarRating from '../components/StarRating';

const CATEGORIES = ['design', 'programming', 'writing', 'tutoring', 'music', 'photography', 'other'];

function avatarUrl(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563eb&color=fff&size=80`;
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const toast                = useToast();

  const [profile, setProfile]   = useState(null);
  const [listings, setListings] = useState([]);
  const [reviews, setReviews]   = useState(null);
  const [editing, setEditing]   = useState(false);
  const [form, setForm]         = useState({ name: '', bio: '', skills: [] });
  const [saving, setSaving]     = useState(false);
  const [uploading, setUpl]     = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [{ data: me }, { data: allL }, { data: rev }] = await Promise.all([
          api.get('/users/me'),
          api.get(`/listings?sellerId=${user?.id}&limit=100`),
          api.get(`/reviews?sellerId=${user?.id}`),
        ]);
        setProfile(me);
        setListings(allL.listings);
        setReviews(rev);
        setForm({ name: me.name, bio: me.bio ?? '', skills: me.skills ?? [] });
      } catch {
        // ignore
      }
    }
    load();
  }, [user]);

  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUpl(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data: upload } = await api.post('/uploads/image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const { data: updated } = await api.put('/users/me', { photoUrl: upload.url });
      setProfile(updated);
      updateUser({ photoUrl: upload.url });
      toast.success('Photo updated');
    } catch {
      toast.error('Photo upload failed');
    } finally {
      setUpl(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const { data } = await api.put('/users/me', {
        name:   form.name.trim(),
        bio:    form.bio.trim() || undefined,
        skills: form.skills,
      });
      setProfile(data);
      updateUser({ name: data.name });
      toast.success('Profile updated');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.error?.message ?? 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  function toggleSkill(skill) {
    setForm((f) => ({
      ...f,
      skills: f.skills.includes(skill)
        ? f.skills.filter((s) => s !== skill)
        : [...f.skills, skill],
    }));
  }

  if (!profile) {
    return <div className="max-w-4xl mx-auto px-4 py-8 text-gray-400">Loading&hellip;</div>;
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <Card className="p-6 mb-6">
        <div className="flex items-start gap-5 flex-wrap">
          {/* Avatar */}
          <div className="relative shrink-0">
            <img
              src={profile.photo_url || avatarUrl(profile.name)}
              alt={profile.name}
              className="w-20 h-20 rounded-full object-cover"
            />
            <label className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow border border-gray-200 cursor-pointer hover:bg-gray-50">
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              <span className="text-xs">{uploading ? '&hellip;' : '✏'}</span>
            </label>
          </div>

          {/* Info / Edit form */}
          <div className="flex-1 min-w-0">
            {!editing ? (
              <>
                <h1 className="text-xl font-bold text-gray-900">{profile.name}</h1>
                <p className="text-sm text-gray-500 mb-1">{profile.email}</p>
                {reviews && (
                  <div className="flex items-center gap-1 mb-2">
                    <StarRating value={parseFloat(profile.avg_rating) || 0} />
                    <span className="text-xs text-gray-500">({profile.review_count || 0} reviews)</span>
                  </div>
                )}
                {profile.bio && (
                  <p className="text-sm text-gray-600 mb-2">{profile.bio}</p>
                )}
                {(profile.skills ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {profile.skills.map((s) => (
                      <span key={s} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full capitalize">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                <Button variant="secondary" onClick={() => setEditing(true)}>Edit profile</Button>
              </>
            ) : (
              <div className="space-y-4 w-full">
                <Input
                  label="Name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Bio</label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                    rows={2}
                    placeholder="Tell buyers about yourself&hellip;"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Skills</label>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSkill(s)}
                        className={`text-xs px-2.5 py-1 rounded-full capitalize border transition-colors ${
                          form.skills.includes(s)
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 text-gray-600 hover:border-blue-400'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
                  <Button onClick={handleSave} loading={saving}>Save</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {listings.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">My Listings ({listings.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        </section>
      )}

      {reviews?.reviews.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Reviews Received ({reviews.reviewCount})
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
    </main>
  );
}
