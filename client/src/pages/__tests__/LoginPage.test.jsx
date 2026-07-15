import { render, screen } from '@testing-library/react';
import LoginPage from '../LoginPage';

test('renders SkillSwap brand heading', () => {
  render(<LoginPage />);
  expect(screen.getByRole('heading', { name: /skillswap/i })).toBeInTheDocument();
});

test('renders "Continue with Google" link', () => {
  render(<LoginPage />);
  expect(screen.getByText(/continue with google/i)).toBeInTheDocument();
});

test('"Continue with Google" is an anchor tag pointing to the auth endpoint', () => {
  render(<LoginPage />);
  const link = screen.getByText(/continue with google/i).closest('a');
  expect(link).toBeInTheDocument();
  expect(link.getAttribute('href')).toContain('/v1/auth/google');
});

test('shows university email disclaimer', () => {
  render(<LoginPage />);
  expect(screen.getByText(/university email/i)).toBeInTheDocument();
});
