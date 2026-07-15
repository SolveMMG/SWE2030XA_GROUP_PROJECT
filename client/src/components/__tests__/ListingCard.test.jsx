import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ListingCard from '../ListingCard';

const baseListing = {
  id: 42,
  title: 'Logo Design',
  description: 'Professional logo design service',
  category: 'design',
  price: '1500',
  image_url: null,
  seller: { name: 'Alice', avgRating: 4.5, reviewCount: 3 },
};

function renderCard(listing = baseListing) {
  return render(
    <MemoryRouter>
      <ListingCard listing={listing} />
    </MemoryRouter>
  );
}

test('renders listing title', () => {
  renderCard();
  expect(screen.getByText('Logo Design')).toBeInTheDocument();
});

test('renders price in KSh format', () => {
  renderCard();
  expect(screen.getByText(/KSh.*1[,.]?500/)).toBeInTheDocument();
});

test('renders seller name', () => {
  renderCard();
  expect(screen.getByText('Alice')).toBeInTheDocument();
});

test('links to the correct listing detail page', () => {
  renderCard();
  const link = screen.getByRole('link');
  expect(link.getAttribute('href')).toBe('/listings/42');
});

test('shows category placeholder when image_url is null', () => {
  renderCard();
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
  // CategoryPlaceholder renders the category emoji; Badge also renders the label
  expect(screen.getByText('🎨')).toBeInTheDocument();
});

test('shows <img> when image_url is provided', () => {
  renderCard({ ...baseListing, image_url: 'https://example.com/img.jpg' });
  const img = screen.getByRole('img');
  expect(img).toBeInTheDocument();
  expect(img.getAttribute('src')).toBe('https://example.com/img.jpg');
});

test('renders description text', () => {
  renderCard();
  expect(screen.getByText('Professional logo design service')).toBeInTheDocument();
});
