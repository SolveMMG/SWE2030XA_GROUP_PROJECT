import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="text-xl font-bold text-blue-600 shrink-0">
          SkillSwap
        </Link>

        <nav className="flex items-center gap-1 sm:gap-3 text-sm">
          <Link to="/" className="px-2 py-1 text-gray-600 hover:text-gray-900 rounded hover:bg-gray-100 transition-colors">
            Browse
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/listings/new" className="px-2 py-1 text-gray-600 hover:text-gray-900 rounded hover:bg-gray-100 transition-colors hidden sm:block">
                Sell a Skill
              </Link>
              <Link to="/my-listings" className="px-2 py-1 text-gray-600 hover:text-gray-900 rounded hover:bg-gray-100 transition-colors hidden sm:block">
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
                <span className="text-gray-700 font-medium hidden sm:block">{user.name?.split(' ')[0]}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="px-2 py-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100 transition-colors text-sm"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
