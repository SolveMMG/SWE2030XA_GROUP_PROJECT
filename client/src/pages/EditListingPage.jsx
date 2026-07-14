import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';

const CATEGORIES = ['design', 'programming', 'writing', 'tutoring', 'music', 'photography', 'other'];

export default function EditListingPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast    = useToast();

  const [form, setForm]           = useState(null);
  const [errors, setErrors]       = useState({});
  const [preview, setPreview]     = useState(null);
  const [uploading, setUpl]       = useState(false);
  const [saving, setSaving]       = useState(false);
  const [deleteModal, setDelMod]  = useState(false);
  const [deleting, setDeleting]   = useState(false);

  useEffect(() => {
    api.get(`/listings/${id}`)
      .then(({ data: l }) => {
        if (l.seller.id !== user?.id) { navigate('/my-listings'); return; }
        setForm({
          title:       l.title,
          description: l.description,
          category:    l.category,
          price:       String(l.price),
          imageUrl:    l.image_url ?? '',
        });
        if (l.image_url) setPreview(l.image_url);
      })
      .catch(() => navigate('/my-listings'));
  }, [id, user, navigate]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: null }));
  }

  async function handleImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setUpl(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await api.post('/uploads/image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      set('imageUrl', data.url);
      toast.success('Image uploaded');
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUpl(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!form.title.trim())            errs.title       = 'Title is required';
    if (!form.description.trim())      errs.description = 'Description is required';
    if (!form.price || Number(form.price) < 0) errs.price = 'Enter a valid price';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      await api.put(`/listings/${id}`, {
        title:       form.title.trim(),
        description: form.description.trim(),
        category:    form.category,
        price:       parseFloat(form.price),
        imageUrl:    form.imageUrl || undefined,
      });
      toast.success('Listing updated!');
      navigate(`/listings/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.error?.message ?? 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.delete(`/listings/${id}`);
      toast.success('Listing deleted');
      navigate('/my-listings');
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeleting(false);
      setDelMod(false);
    }
  }

  if (!form) {
    return <div className="max-w-xl mx-auto px-4 py-8 text-gray-400">Loading&hellip;</div>;
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Listing</h1>
        <Button variant="danger" onClick={() => setDelMod(true)}>Delete</Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input label="Title" value={form.title} onChange={(e) => set('title', e.target.value)} error={errors.title} />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={4}
            className={`border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
              errors.description ? 'border-red-400' : 'border-gray-300'
            }`}
          />
          {errors.description && <p className="text-xs text-red-600">{errors.description}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Category</label>
          <select
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
          </select>
        </div>

        <Input
          label="Price (KSh)"
          type="number"
          min="0"
          step="1"
          value={form.price}
          onChange={(e) => set('price', e.target.value)}
          error={errors.price}
        />

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Image</label>
          {preview && <img src={preview} alt="preview" className="w-full h-44 object-cover rounded-lg" />}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImage}
            className="text-sm text-gray-600 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {uploading && <p className="text-xs text-blue-600">Uploading&hellip;</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" loading={saving}>Save Changes</Button>
        </div>
      </form>

      <Modal open={deleteModal} onClose={() => setDelMod(false)} title="Delete listing?">
        <p className="text-sm text-gray-600 mb-5">
          This will permanently delete this listing and all associated inquiries. This cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDelMod(false)}>Cancel</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>Delete listing</Button>
        </div>
      </Modal>
    </main>
  );
}
