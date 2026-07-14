import { vi } from 'vitest';

// Mock the api module before any imports that use it
vi.mock('./api/index', () => ({
  default: {
    get:  vi.fn(() => Promise.resolve({ data: { listings: [], page: 1, totalPages: 1, total: 0 } })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
    put:  vi.fn(() => Promise.resolve({ data: {} })),
    patch: vi.fn(() => Promise.resolve({ data: {} })),
    delete: vi.fn(() => Promise.resolve({ data: {} })),
    interceptors: {
      request:  { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import App from './App';

function Wrapper({ children }) {
  return (
    <MemoryRouter initialEntries={['/']}>
      <AuthProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

test('renders SkillSwap brand in navbar', () => {
  render(<App />, { wrapper: Wrapper });
  expect(screen.getByText(/skillswap/i)).toBeInTheDocument();
});

test('shows Browse Skills heading on home page', () => {
  render(<App />, { wrapper: Wrapper });
  expect(screen.getByRole('heading', { name: /browse skills/i })).toBeInTheDocument();
});
