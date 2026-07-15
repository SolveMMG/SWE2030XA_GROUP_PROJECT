import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenu] = useState(false);

  async function handleLogout() {
    await logout();
    navigate('/login');
    setMenu(false);
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="text-xl font-bold text-blue-600 shrink-0" onClick={() => setMenu(false)}>
          SkillSwap
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1 sm:gap-3 text-sm">
          <Link to="/" className="px-2 py-1 text-gray-600 hover:text-gray-900 rounded hover:bg-gray-100 transition-colors">
            Browse
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/listings/new" className="px-2 py-1 text-gray-600 hover:text-gray-900 rounded hover:bg-gray-100 transition-colors">
                Sell a Skill
              </Link>
              <Link to="/my-listings" className="px-2 py-1 text-gray-600 hover:text-gray-900 rounded hover:bg-gray-100 transition-colors">
                My Listings
              </Link>
              <Link to="/inquiries" className="px-2 py-1 text-gray-600 hover:text-gray-900 rounded hover:bg-gray-100 transition-colors">
                Inquiries
              </Link>
              <Link to="/profile" className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 transition-colors">
                {user.photoUrl ? (
                  <img src={user.photoUrl} className="w-7 h-7 rounded-full object-cover" alt={user.name} />
                ) : (
                  <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-semibold">
                    {user.name?.[0]?.toUpperCase()}
                  </span>
                )}
                <span className="text-gray-700 font-medium">{user.name?.split(' ')[0]}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="px-2 py-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100 transition-colors text-sm"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors">
              Sign in
            </Link>
          )}
        </nav>

        {/* Mobile right side */}
        <div className="flex sm:hidden items-center gap-2">
          {isAuthenticated && (
            <Link to="/profile" onClick={() => setMenu(false)}>
              {user.photoUrl ? (
                <img src={user.photoUrl} className="w-7 h-7 rounded-full object-cover" alt={user.name} />
              ) : (
                <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-semibold">
                  {user.name?.[0]?.toUpperCase()}
                </span>
              )}
            </Link>
          )}
          <button
            onClick={() => setMenu((o) => !o)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="sm:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-1 text-sm">
          <Link to="/" onClick={() => setMenu(false)} className="px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
            Browse
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/listings/new" onClick={() => setMenu(false)} className="px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                Sell a Skill
              </Link>
              <Link to="/my-listings" onClick={() => setMenu(false)} className="px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                My Listings
              </Link>
              <Link to="/inquiries" onClick={() => setMenu(false)} className="px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                Inquiries
              </Link>
              <Link to="/profile" onClick={() => setMenu(false)} className="px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMenu(false)} className="px-3 py-2 bg-blue-600 text-white rounded-lg font-medium text-center">
              Sign in
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
