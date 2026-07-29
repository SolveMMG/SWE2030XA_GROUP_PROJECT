import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import { useAuth } from '../../context/AuthContext';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

test('redirects to /login when not authenticated', () => {
  useAuth.mockReturnValue({ isAuthenticated: false });

  render(
    <MemoryRouter initialEntries={['/secret']}>
      <Routes>
        <Route path="/secret" element={<ProtectedRoute><div>Secret Page</div></ProtectedRoute>} />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  );

  expect(screen.getByText('Login Page')).toBeInTheDocument();
  expect(screen.queryByText('Secret Page')).not.toBeInTheDocument();
});

test('renders children when authenticated', () => {
  useAuth.mockReturnValue({ isAuthenticated: true });

  render(
    <MemoryRouter>
      <ProtectedRoute><div>Secret Page</div></ProtectedRoute>
    </MemoryRouter>
  );

  expect(screen.getByText('Secret Page')).toBeInTheDocument();
});
