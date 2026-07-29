import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import MarketplacePage    from './pages/MarketplacePage';
import LoginPage          from './pages/LoginPage';
import AuthCallbackPage   from './pages/AuthCallbackPage';
import ListingDetailPage  from './pages/ListingDetailPage';
import CreateListingPage  from './pages/CreateListingPage';
import EditListingPage    from './pages/EditListingPage';
import MyListingsPage     from './pages/MyListingsPage';
import InquiriesPage      from './pages/InquiriesPage';
import ProfilePage        from './pages/ProfilePage';
import ProfileEditPage    from './pages/ProfileEditPage';
import PublicProfilePage  from './pages/PublicProfilePage';
import NotFoundPage       from './pages/NotFoundPage';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/"               element={<MarketplacePage />} />
        <Route path="/login"          element={<LoginPage />} />
        <Route path="/auth/callback"  element={<AuthCallbackPage />} />
        <Route path="/users/:id"      element={<PublicProfilePage />} />

        {/* Listing detail & new (order matters: /new before /:id) */}
        <Route path="/listings/new"   element={<ProtectedRoute><CreateListingPage /></ProtectedRoute>} />
        <Route path="/listings/:id"   element={<ListingDetailPage />} />
        <Route path="/listings/:id/edit" element={<ProtectedRoute><EditListingPage /></ProtectedRoute>} />

        {/* Authenticated */}
        <Route path="/my-listings"    element={<ProtectedRoute><MyListingsPage /></ProtectedRoute>} />
        <Route path="/inquiries"      element={<ProtectedRoute><InquiriesPage /></ProtectedRoute>} />
        <Route path="/profile"        element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/profile/edit"   element={<ProtectedRoute><ProfileEditPage /></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}
