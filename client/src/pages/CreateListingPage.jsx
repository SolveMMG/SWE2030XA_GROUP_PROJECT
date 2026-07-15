import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import Input from '../components/Input';

const CATEGORIES = ['design', 'programming', 'writing', 'tutoring', 'music', 'photography', 'other'];

export default function CreateListingPage() {
  const navigate = useNavigate();
  const toast    = useToast();

  const [form, setForm]       = useState({ title: '', description: '', category: 'design', price: '', imageUrl: '' });
  const [errors, setErrors]   = useState({});
  const [preview, setPreview] = useState(null);
  const [uploading, setUpl]   = useState(false);
  const [saving, setSaving]   = useState(false);

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
      setPreview(null);
    } finally {
      setUpl(false);
    }
  }

  function validate() {
    const e = {};
    if (!form.title.trim())                          e.title       = 'Title is required';
    if (!form.description.trim())                    e.description = 'Description is required';
    if (!form.price || Number(form.price) < 0)       e.price       = 'Enter a valid price (KSh)';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      const { data } = await api.post('/listings', {
        title:       form.title.trim(),
        description: form.description.trim(),
        category:    form.category,
        price:       parseFloat(form.price),
        imageUrl:    form.imageUrl || undefined,
      });
      toast.success('Listing created!');
      navigate(`/listings/${data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error?.message ?? 'Failed to create listing');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create a Listing</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Title"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="e.g. Logo Design"
          error={errors.title}
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={4}
            placeholder="Describe what you offer, your process, turnaround time&hellip;"
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
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="capitalize">{c}</option>
            ))}
          </select>
        </div>

        <Input
          label="Price (KSh)"
          type="number"
          min="0"
          step="1"
          value={form.price}
          onChange={(e) => set('price', e.target.value)}
          placeholder="500"
          error={errors.price}
        />

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Image (optional)</label>
          {preview && (
            <img src={preview} alt="preview" className="w-full h-44 object-cover rounded-lg" />
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImage}
            className="text-sm text-gray-600 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {uploading && <p className="text-xs text-blue-600">Uploading image&hellip;</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" loading={saving}>Create Listing</Button>
        </div>
      </form>
    </main>
  );
}
