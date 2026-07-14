import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input } from '../components';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';

const emptyForm = { name: '', bio: '', skills: '', photo_url: '' };

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const { authenticatedFetch, updateUser, user } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function loadProfile() {
      try {
        const response = await apiRequest(authenticatedFetch, '/users/me');
        if (!response.ok) throw new Error('We could not load your profile.');
        const profile = await response.json();
        if (active) setForm({
          name: profile.name || '',
          bio: profile.bio || '',
          skills: (profile.skills || []).join(', '),
          photo_url: profile.photo_url || '',
        });
      } catch (requestError) {
        if (active) setError(requestError.message);
      } finally {
        if (active) setIsLoading(false);
      }
    }
    loadProfile();
    return () => { active = false; };
  }, [authenticatedFetch]);

  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      let photoUrl = form.photo_url;
      if (image) {
        const uploadBody = new FormData();
        uploadBody.append('image', image);
        const uploadResponse = await authenticatedFetch('/uploads/image', { method: 'POST', body: uploadBody });
        if (!uploadResponse.ok) throw new Error('Your photo could not be uploaded.');
        const upload = await uploadResponse.json();
        photoUrl = upload.url || upload.imageUrl || upload.data?.url;
        if (!photoUrl) throw new Error('The upload service did not return an image URL.');
      }

      const response = await apiRequest(authenticatedFetch, '/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          bio: form.bio.trim() || null,
          skills: form.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
          photo_url: photoUrl || null,
        }),
      });
      if (!response.ok) throw new Error('Your changes could not be saved.');

      const updatedProfile = await response.json();
      updateUser({ ...user, ...updatedProfile });
      navigate('/profile');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6"><Card>Loading your profile…</Card></section>;

  return (
    <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <Card padding="p-6 sm:p-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">Edit profile</h1>
        <p className="mt-2 text-muted">Help others understand what you can share.</p>
        {error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <Input name="name" label="Name" value={form.name} onChange={updateField} required />
          <label className="block"><span className="mb-1.5 block text-sm font-medium text-ink">About me</span><textarea name="bio" value={form.bio} onChange={updateField} rows="5" className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100" placeholder="What are you interested in learning and sharing?" /></label>
          <Input name="skills" label="Skills" value={form.skills} onChange={updateField} hint="Separate each skill with a comma." placeholder="Photography, Spanish, Guitar" />
          <label className="block"><span className="mb-1.5 block text-sm font-medium text-ink">Profile photo</span><input type="file" accept="image/*" onChange={(event) => setImage(event.target.files?.[0] || null)} className="block w-full text-sm text-muted file:mr-4 file:rounded-lg file:border-0 file:bg-brand-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-brand-800 hover:file:bg-brand-200" />{image && <span className="mt-1.5 block text-xs text-muted">{image.name} ready to upload</span>}</label>
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end"><Button variant="ghost" onClick={() => navigate('/profile')}>Cancel</Button><Button type="submit" loading={isSaving}>Save changes</Button></div>
        </form>
      </Card>
    </section>
  );
}
