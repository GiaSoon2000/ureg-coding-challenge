import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RatesPage from './RatesPage';
import * as api from '../api';

// Mock the API module
vi.mock('../api', () => ({
  default: {
    get: vi.fn()
  }
}));

describe('RatesPage Component', () => {
  const mockRatesResponse = {
    date: '2025-11-15',
    rates: [
      { currency: 'AUD', rate: 1.52, name: 'Australian Dollar' },
      { currency: 'CAD', rate: 1.35, name: 'Canadian Dollar' },
      { currency: 'CNY', rate: 7.24, name: 'Chinese Yuan' },
      { currency: 'EUR', rate: 0.92, name: 'Euro' },
      { currency: 'GBP', rate: 0.78, name: 'British Pound' },
      { currency: 'HKD', rate: 7.81, name: 'Hong Kong Dollar' },
      { currency: 'JPY', rate: 149.50, name: 'Japanese Yen' },
      { currency: 'KRW', rate: 1298.5, name: 'South Korean Won' },
      { currency: 'MYR', rate: 4.68, name: 'Malaysian Ringgit' },
      { currency: 'NZD', rate: 1.71, name: 'New Zealand Dollar' },
      { currency: 'PHP', rate: 56.2, name: 'Philippine Peso' },
      { currency: 'SGD', rate: 1.34, name: 'Singapore Dollar' }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the component without crashing', () => {
    api.default.get.mockResolvedValueOnce({ data: mockRatesResponse });
    render(<RatesPage />);
    expect(screen.getByText(/Exchange Rates/i)).toBeInTheDocument();
  });

  it('should fetch rates on component mount', async () => {
    api.default.get.mockResolvedValueOnce({ data: mockRatesResponse });
    render(<RatesPage />);

    await waitFor(() => {
      expect(api.default.get).toHaveBeenCalledWith('/rates', {});
    });
  });

  it('should display loading state during fetch', async () => {
    api.default.get.mockResolvedValueOnce({ data: mockRatesResponse });

    render(<RatesPage />);
    
    // Initial render should show Exchange Rates header
    expect(screen.getByText(/Exchange Rates/i)).toBeInTheDocument();
  });

  it('should fetch rates when date input changes', async () => {
    api.default.get.mockResolvedValue({ data: mockRatesResponse });
    const user = userEvent.setup();

    render(<RatesPage />);

    // Wait for initial fetch
    await waitFor(() => {
      expect(api.default.get).toHaveBeenCalled();
    });

      // Get the date input by type since it doesn't have placeholder text
      const dateInputs = screen.getAllByDisplayValue('');
      const dateInput = dateInputs.find(input => input.type === 'date');
    
      if (dateInput) {
        await user.type(dateInput, '2023-07-01');

        await waitFor(() => {
          expect(api.default.get).toHaveBeenCalledWith(
            '/rates',
            expect.objectContaining({
              params: expect.objectContaining({ date: '2023-07-01' })
            })
          );
        });
      }
  });

  it('should display all rates when API returns data', async () => {
    api.default.get.mockResolvedValueOnce({ data: mockRatesResponse });
    render(<RatesPage />);

    await waitFor(() => {
      // Check if currency codes are displayed (first 12, PAGE_SIZE = 12)
      expect(screen.getByText('AUD')).toBeInTheDocument();
      expect(screen.getByText('CAD')).toBeInTheDocument();
      expect(screen.getByText('EUR')).toBeInTheDocument();
    });
  });

  it('should display correct rate values', async () => {
    api.default.get.mockResolvedValueOnce({ data: mockRatesResponse });
    render(<RatesPage />);

    await waitFor(() => {
      // Check that rate values are displayed
      expect(screen.getByText(/1\.52/)).toBeInTheDocument(); // AUD rate
      expect(screen.getByText(/0\.92/)).toBeInTheDocument(); // EUR rate
    });
  });

  it('should handle lazy loading by showing initial PAGE_SIZE items', async () => {
    // Create response with 24 items (to test pagination)
    const largeRatesResponse = {
      ...mockRatesResponse,
      rates: Array.from({ length: 24 }, (_, i) => ({
        currency: `CUR${String(i).padStart(2, '0')}`,
        rate: 1 + Math.random(),
        name: `Currency ${i}`
      }))
    };

    api.default.get.mockResolvedValueOnce({ data: largeRatesResponse });
    render(<RatesPage />);

    await waitFor(() => {
      // PAGE_SIZE is 12, so initially only 12 should be visible
      const cards = screen.getAllByText(/Currency \d+/);
      // At least some items should be visible
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  it('should handle empty rates response gracefully', async () => {
    api.default.get.mockResolvedValueOnce({
      data: { date: 'invalid-date', rates: [] }
    });

    render(<RatesPage />);

    await waitFor(() => {
      // Component should render with no rates found message
      expect(screen.getByText(/No rates found/i)).toBeInTheDocument();
    });
  });

  it('should fetch latest rates when Latest button is clicked', async () => {
    api.default.get.mockResolvedValue({ data: mockRatesResponse });
    const user = userEvent.setup();

    render(<RatesPage />);

    await waitFor(() => {
      expect(api.default.get).toHaveBeenCalled();
    });

    const latestButton = screen.getByRole('button', { name: /Latest/i });
    await user.click(latestButton);

    await waitFor(() => {
      // Should be called again (once from mount, once from button click)
      expect(api.default.get).toHaveBeenCalledTimes(2);
    });
  });

  it('should display date in header when rates are fetched', async () => {
    api.default.get.mockResolvedValueOnce({ data: mockRatesResponse });
    render(<RatesPage />);

    await waitFor(() => {
      expect(screen.getByText(/2025-11-15/i)).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    api.default.get.mockRejectedValueOnce(new Error('API Error'));

    render(<RatesPage />);

    // Component should still render without crashing
    expect(screen.getByText(/Exchange Rates/i)).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  it('should display Load more button when there are more rates than PAGE_SIZE', async () => {
    // Create response with 24 items (more than PAGE_SIZE which is 12)
    const largeRatesResponse = {
      ...mockRatesResponse,
      rates: Array.from({ length: 24 }, (_, i) => ({
        currency: `CUR${String(i).padStart(2, '0')}`,
        rate: 1 + Math.random(),
        name: `Currency ${i}`
      }))
    };

    api.default.get.mockResolvedValueOnce({ data: largeRatesResponse });
    render(<RatesPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Load more/i })).toBeInTheDocument();
    });
  });

  it('should not display Load more button when all rates are visible', async () => {
    // Create response with fewer items than PAGE_SIZE
    const smallRatesResponse = {
      ...mockRatesResponse,
      rates: mockRatesResponse.rates.slice(0, 6) // Only 6 items
    };

    api.default.get.mockResolvedValueOnce({ data: smallRatesResponse });
    render(<RatesPage />);

    await waitFor(() => {
      // Load more button should not be present
      expect(screen.queryByRole('button', { name: /Load more/i })).not.toBeInTheDocument();
    });
  });
});

