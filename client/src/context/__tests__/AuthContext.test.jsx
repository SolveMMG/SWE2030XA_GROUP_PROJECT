import { render, screen, fireEvent } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';

vi.mock('../../api', () => ({
  default: {
    post: vi.fn().mockResolvedValue({}),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}));

function TestComp() {
  const { user, isAuthenticated, login, logout, updateUser } = useAuth();
  return (
    <div>
      <span data-testid="auth">{isAuthenticated ? 'yes' : 'no'}</span>
      <span data-testid="name">{user?.name ?? ''}</span>
      <button onClick={() => login({ name: 'Alice', id: 1 }, 'tok123', 'ref456')}>login</button>
      <button onClick={() => logout()}>logout</button>
      <button onClick={() => updateUser({ name: 'Bob' })}>update</button>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
});

test('starts unauthenticated when localStorage is empty', () => {
  render(<AuthProvider><TestComp /></AuthProvider>);
  expect(screen.getByTestId('auth')).toHaveTextContent('no');
  expect(screen.getByTestId('name')).toHaveTextContent('');
});

test('restores session from localStorage on mount', () => {
  localStorage.setItem('user', JSON.stringify({ name: 'Cached', id: 99 }));
  render(<AuthProvider><TestComp /></AuthProvider>);
  expect(screen.getByTestId('auth')).toHaveTextContent('yes');
  expect(screen.getByTestId('name')).toHaveTextContent('Cached');
});

test('login sets user and writes tokens to localStorage', () => {
  render(<AuthProvider><TestComp /></AuthProvider>);
  fireEvent.click(screen.getByText('login'));
  expect(screen.getByTestId('auth')).toHaveTextContent('yes');
  expect(screen.getByTestId('name')).toHaveTextContent('Alice');
  expect(localStorage.getItem('token')).toBe('tok123');
  expect(localStorage.getItem('refreshToken')).toBe('ref456');
});

test('logout clears user and localStorage', () => {
  render(<AuthProvider><TestComp /></AuthProvider>);
  fireEvent.click(screen.getByText('login'));
  fireEvent.click(screen.getByText('logout'));
  expect(screen.getByTestId('auth')).toHaveTextContent('no');
  expect(localStorage.getItem('token')).toBeNull();
});

test('updateUser patches only the supplied fields', () => {
  render(<AuthProvider><TestComp /></AuthProvider>);
  fireEvent.click(screen.getByText('login'));
  fireEvent.click(screen.getByText('update'));
  expect(screen.getByTestId('name')).toHaveTextContent('Bob');
  const stored = JSON.parse(localStorage.getItem('user'));
  expect(stored.name).toBe('Bob');
  expect(stored.id).toBe(1);
});
