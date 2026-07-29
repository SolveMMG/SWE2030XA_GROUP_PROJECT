import { render, screen } from '@testing-library/react';
import Badge from '../Badge';

test('renders the label text', () => {
  render(<Badge label="design" />);
  expect(screen.getByText('design')).toBeInTheDocument();
});

test.each([
  ['design',      'bg-purple-100'],
  ['programming', 'bg-blue-100'],
  ['writing',     'bg-yellow-100'],
  ['tutoring',    'bg-green-100'],
  ['music',       'bg-pink-100'],
  ['photography', 'bg-orange-100'],
  ['other',       'bg-gray-100'],
  ['pending',     'bg-amber-100'],
  ['accepted',    'bg-green-100'],
  ['declined',    'bg-red-100'],
])('applies correct color class for "%s"', (label, expectedClass) => {
  render(<Badge label={label} />);
  const badge = screen.getByText(label);
  expect(badge.className).toContain(expectedClass);
});

test('falls back to gray for unknown labels', () => {
  render(<Badge label="unknown" />);
  expect(screen.getByText('unknown').className).toContain('bg-gray-100');
});
