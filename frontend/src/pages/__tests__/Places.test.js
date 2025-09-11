import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { render, screen } from '@testing-library/react';

// Mock react-leaflet ESM module to avoid Jest transform issues
jest.mock('react-leaflet', () => ({
  __esModule: true,
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => null,
  Marker: () => null,
  Popup: ({ children }) => <div>{children}</div>,
}));

// Mock services to avoid real HTTP
jest.mock('../../services/api', () => ({
  getEntries: jest.fn().mockResolvedValue([]),
  getInsights: jest.fn().mockResolvedValue([
    {
      id: 1,
      text_snippet: 'Lovely trip to Prague',
      category: { name: 'Prague', category_type: 'place' },
      sentiment_score: 0.8,
      confidence_score: 0.92,
    },
  ]),
}));

function renderWithQueryClient() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
  });
  const Places = require('../Places').default;
  return render(
    <QueryClientProvider client={client}>
      <Places />
    </QueryClientProvider>
  );
}

describe('Places page', () => {
  test('renders without runtime errors and shows title', async () => {
    renderWithQueryClient();
    expect(await screen.findByText('Places & Locations')).toBeInTheDocument();
  });
});

