import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

test('renders children', () => {
  render(<Button>Save</Button>);
  expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
});

test('calls onClick when clicked', () => {
  const onClick = vi.fn();
  render(<Button onClick={onClick}>Click</Button>);
  fireEvent.click(screen.getByRole('button'));
  expect(onClick).toHaveBeenCalledTimes(1);
});

test('is disabled and shows spinner when loading', () => {
  render(<Button loading>Saving</Button>);
  const btn = screen.getByRole('button');
  expect(btn).toBeDisabled();
  expect(btn.querySelector('.animate-spin')).toBeInTheDocument();
});

test('is disabled when disabled prop passed', () => {
  render(<Button disabled>Submit</Button>);
  expect(screen.getByRole('button')).toBeDisabled();
});

test('does not call onClick when disabled', () => {
  const onClick = vi.fn();
  render(<Button disabled onClick={onClick}>Click</Button>);
  fireEvent.click(screen.getByRole('button'));
  expect(onClick).not.toHaveBeenCalled();
});

test.each(['primary', 'secondary', 'danger', 'ghost'])('renders variant %s without error', (variant) => {
  render(<Button variant={variant}>Label</Button>);
  expect(screen.getByRole('button')).toBeInTheDocument();
});
