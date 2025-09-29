import React from 'react';
import { Router } from 'react-router-dom';
import { renderHook, act } from '@testing-library/react-hooks';
import { createMemoryHistory } from 'history';
import { useURLSearchParams } from '../customHooks';

describe('useURLSearchParams', () => {
  const setup = (defaultValues = { page: 1, per: 25 }) => {
    const history = createMemoryHistory();
    const wrapper = ({ children }) => (
      <Router history={history}>{children}</Router>
    );

    const hookResult = renderHook(() => useURLSearchParams(defaultValues), { wrapper });
    return { history, hookResult };
  };

  it('initialises the URL with default values', () => {
    const { history, hookResult } = setup();

    expect(history.location.search).toBe('?page=1&per=25');
    expect(hookResult.result.current[0]).toEqual({ page: '1', per: '25' });
  });

  it('updates a single query parameter', () => {
    const { history, hookResult } = setup();

    act(() => {
      hookResult.result.current[1]('page', '2');
    });

    expect(history.location.search).toBe('?page=2&per=25');
    expect(hookResult.result.current[0]).toEqual({ page: '2', per: '25' });
  });

  it('updates multiple query parameters at once', () => {
    const { history, hookResult } = setup();

    act(() => {
      hookResult.result.current[1]({ per: '50', filter: 'active' });
    });

    expect(history.location.search).toBe('?page=1&per=50&filter=active');
    expect(hookResult.result.current[0]).toEqual({ page: '1', per: '50', filter: 'active' });
  });

  it('throws when provided with invalid arguments', () => {
    const { hookResult } = setup();

    expect(() => hookResult.result.current[1]('page')).toThrow(/must be called/);
  });
});
