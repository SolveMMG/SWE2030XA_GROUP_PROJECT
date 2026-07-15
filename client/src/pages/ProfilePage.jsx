import { useEffect, useState } from 'react';
import { Badge, Button, Card } from '../components';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';

export default function ProfilePage() {
  const { authenticatedFetch, user: sessionUser } = useAuth();
  const [profile, setProfile] = useState(sessionUser);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const response = await apiRequest(authenticatedFetch, '/users/me');
        if (!response.ok) throw new Error('We could not load your profile.');
        const data = await response.json();
        if (active) setProfile(data);
      } catch (requestError) {
        if (active) setError(requestError.message);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadProfile();
    return () => { active = false; };
  }, [authenticatedFetch]);

  if (isLoading) return <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8"><Card>Loading your profile…</Card></section>;
  if (error) return <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8"><Card><p className="text-red-600">{error}</p></Card></section>;

  const initials = (profile?.name || 'SkillSwap member').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  const skills = profile?.skills || [];
  const rating = profile?.avg_rating ?? profile?.rating;
  const reviewCount = profile?.review_count ?? profile?.reviewCount;

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Card padding="p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            {profile?.photo_url || profile?.avatarUrl ? <img className="h-20 w-20 rounded-full object-cover" src={profile.photo_url || profile.avatarUrl} alt="" /> : <div className="grid h-20 w-20 place-items-center rounded-full bg-brand-100 font-display text-2xl font-bold text-brand-800">{initials}</div>}
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-ink">{profile?.name || 'SkillSwap member'}</h1>
              {profile?.email && <p className="mt-1 text-sm text-muted">{profile.email}</p>}
              <p className="mt-2 text-sm font-semibold text-accent-600">{rating ? `★ ${Number(rating).toFixed(1)}${reviewCount !== undefined ? ` · ${reviewCount} review${Number(reviewCount) === 1 ? '' : 's'}` : ''}` : 'New to SkillSwap'}</p>
            </div>
          </div>
          <Button to="/profile/edit" variant="outline">Edit profile</Button>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-8">
          <h2 className="font-display text-lg font-bold text-ink">About me</h2>
          <p className="mt-3 max-w-2xl leading-7 text-muted">{profile?.bio || 'Tell the SkillSwap community a little about yourself and what you love to learn.'}</p>
        </div>

        <div className="mt-8">
          <h2 className="font-display text-lg font-bold text-ink">Skills I can share</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {skills.length ? skills.map((skill) => <Badge key={skill}>{skill}</Badge>) : <p className="text-sm text-muted">No skills added yet.</p>}
          </div>
        </div>
      </Card>
    </section>
  );
}
