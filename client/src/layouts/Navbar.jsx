import { Link, NavLink } from 'react-router-dom';
import { Button } from '../components';

const navItemClass = ({ isActive }) => `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-brand-50 text-brand-700' : 'text-muted hover:bg-slate-100 hover:text-ink'}`;

export default function Navbar({ isAuthenticated = false, onLogout, user }) {
  const initials = user?.name
    ?.split(' ')
    .map((name) => name[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-surface/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="font-display text-xl font-bold tracking-tight text-brand-700">SkillSwap</Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          <NavLink to="/explore" className={navItemClass}>Explore skills</NavLink>
          {isAuthenticated && <NavLink to="/profile" className={navItemClass}>My profile</NavLink>}
        </nav>

        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <Link to="/profile" className="flex items-center gap-2 rounded-lg p-1 text-sm font-medium text-ink hover:bg-slate-100">
              {user?.avatarUrl ? <img src={user.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" /> : <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-800">{initials || 'U'}</span>}
              <span className="hidden sm:inline">{user?.name || 'My account'}</span>
            </Link>
            <Button variant="ghost" size="sm" onClick={onLogout}>Log out</Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50 sm:inline-flex" to="/login">Log in</Link>
            <Button to="/login" size="sm">Get started</Button>
          </div>
        )}
      </div>
    </header>
  );
}
