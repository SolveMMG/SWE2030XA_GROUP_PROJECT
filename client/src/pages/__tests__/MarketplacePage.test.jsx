import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MarketplacePage from '../MarketplacePage';

vi.mock('../../api', () => ({
  default: {
    get: vi.fn().mockResolvedValue({
      data: { listings: [], page: 1, totalPages: 1, total: 0 },
    }),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}));

import api from '../../api';

function renderPage() {
  return render(<MemoryRouter><MarketplacePage /></MemoryRouter>);
}

test('renders hero heading', async () => {
  renderPage();
  expect(screen.getByRole('heading', { name: /find student talent/i })).toBeInTheDocument();
});

test('renders all 7 category buttons in the hero', () => {
  renderPage();
  const labels = ['Design', 'Programming', 'Writing', 'Tutoring', 'Music', 'Photography', 'Other'];
  // Hero section has duplicates in the filter row — check at least one set exists
  labels.forEach((label) => {
    expect(screen.getAllByText(label).length).toBeGreaterThanOrEqual(1);
  });
});

test('shows empty state when API returns no listings', async () => {
  renderPage();
  await screen.findByText(/no skills found/i);
});

test('renders listings returned by the API', async () => {
  api.get.mockResolvedValueOnce({
    data: {
      listings: [
        {
          id: 1,
          title: 'Logo Design',
          description: 'Great logos',
          category: 'design',
          price: '800',
          image_url: null,
          seller: { name: 'Alice', avgRating: 4, reviewCount: 2 },
        },
      ],
      page: 1,
      totalPages: 1,
      total: 1,
    },
  });

  renderPage();
  await screen.findByText('Logo Design');
  expect(screen.getByText(/KSh/)).toBeInTheDocument();
});

test('search form calls API with search param', async () => {
  renderPage();
  await screen.findByText(/no skills found/i);

  fireEvent.change(screen.getByPlaceholderText(/search/i), { target: { value: 'react' } });
  fireEvent.submit(screen.getByPlaceholderText(/search/i).closest('form'));

  await waitFor(() => {
    const call = api.get.mock.calls.find((c) => c[0].includes('search=react'));
    expect(call).toBeDefined();
  });
});
