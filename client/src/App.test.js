import { render, screen } from '@testing-library/react';
import App from './App';

test('renders SkillSwap heading', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /skillswap/i })).toBeInTheDocument();
});
