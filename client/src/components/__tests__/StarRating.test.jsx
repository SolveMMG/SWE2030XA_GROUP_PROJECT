import { render, screen, fireEvent } from '@testing-library/react';
import StarRating from '../StarRating';

test('renders 5 stars by default', () => {
  render(<StarRating value={3} />);
  const stars = screen.getAllByText('★');
  expect(stars).toHaveLength(5);
});

test('renders correct number of filled vs empty stars', () => {
  render(<StarRating value={3} />);
  const stars = screen.getAllByText('★');
  const filled = stars.filter((s) => s.className.includes('text-amber-400'));
  const empty  = stars.filter((s) => s.className.includes('text-gray-300'));
  expect(filled).toHaveLength(3);
  expect(empty).toHaveLength(2);
});

test('renders 0 filled stars for value 0', () => {
  render(<StarRating value={0} />);
  const filled = screen.getAllByText('★').filter((s) => s.className.includes('text-amber-400'));
  expect(filled).toHaveLength(0);
});

test('stars do not have button role when not interactive', () => {
  render(<StarRating value={3} />);
  expect(screen.queryAllByRole('button')).toHaveLength(0);
});

test('stars have button role when interactive', () => {
  render(<StarRating value={3} interactive onChange={() => {}} />);
  expect(screen.getAllByRole('button')).toHaveLength(5);
});

test('calls onChange with correct rating when interactive star clicked', () => {
  const onChange = vi.fn();
  render(<StarRating value={0} interactive onChange={onChange} />);
  const stars = screen.getAllByRole('button');
  fireEvent.click(stars[2]);
  expect(onChange).toHaveBeenCalledWith(3);
});
