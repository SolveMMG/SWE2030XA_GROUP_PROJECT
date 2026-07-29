import { render, screen, fireEvent } from '@testing-library/react';
import Modal from '../Modal';

test('renders nothing when open is false', () => {
  render(<Modal open={false} onClose={() => {}} title="Test"><p>Content</p></Modal>);
  expect(screen.queryByText('Content')).not.toBeInTheDocument();
  expect(screen.queryByText('Test')).not.toBeInTheDocument();
});

test('renders title and children when open is true', () => {
  render(<Modal open onClose={() => {}} title="Confirm"><p>Are you sure?</p></Modal>);
  expect(screen.getByText('Confirm')).toBeInTheDocument();
  expect(screen.getByText('Are you sure?')).toBeInTheDocument();
});

test('calls onClose when × button is clicked', () => {
  const onClose = vi.fn();
  render(<Modal open onClose={onClose} title="Test"><p>Body</p></Modal>);
  fireEvent.click(screen.getByText('×'));
  expect(onClose).toHaveBeenCalledTimes(1);
});

test('calls onClose when backdrop is clicked', () => {
  const onClose = vi.fn();
  const { container } = render(<Modal open onClose={onClose} title="Test"><p>Body</p></Modal>);
  const backdrop = container.querySelector('.absolute.inset-0');
  fireEvent.click(backdrop);
  expect(onClose).toHaveBeenCalledTimes(1);
});
