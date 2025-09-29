import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import WaitOn from '../WaitOn';

describe('WaitOn helper component', () => {
  const createBaseQuery = () => ({
    isError: false,
    error: null,
    isLoading: false,
    isEmpty: false,
    refetch: vi.fn(),
  });

  it('shows the fallback while loading', () => {
    const query = { ...createBaseQuery(), isLoading: true };
    render(
      <WaitOn
        fallback={<div data-testid="loading">loading...</div>}
        query={query}
      />
    );

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('renders an error message and refetch button when the query fails', async () => {
    const query = { ...createBaseQuery(), isError: true, error: 'Boom!' };

    render(
      <WaitOn
        query={query}
      />
    );

    expect(screen.getByText(/Boom!/)).toBeInTheDocument();
    const button = screen.getByRole('button', { name: /try again/i });
    await userEvent.click(button);
    expect(query.refetch).toHaveBeenCalledTimes(1);
  });

  it('renders the empty state when the query reports no data', () => {
    const query = { ...createBaseQuery(), isEmpty: true };
    render(
      <WaitOn
        query={query}
      />
    );

    expect(screen.getByText(/No data found/)).toBeInTheDocument();
  });

  it('renders the children when the query has data', () => {
    const query = createBaseQuery();
    render(
      <WaitOn query={query}>
        <div data-testid="content">done loading</div>
      </WaitOn>
    );

    expect(screen.getByTestId('content')).toHaveTextContent('done loading');
  });
});
