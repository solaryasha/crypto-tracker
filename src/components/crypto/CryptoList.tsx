'use client';

import { useEffect, useCallback, useRef, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { CryptoListItem } from './CryptoListItem';
import { CryptoFilters, FilterConfig, FilterField } from './CryptoFilters';
import { coincapApi } from '@/services/coincapApi';
import { setLoading, setCryptos, setError, updatePrice } from '@/store/slices/cryptosSlice';
import { ErrorMessage } from '@/components/errors/ErrorMessage';
import { Toast } from '@/components/errors/Toast';
import { ErrorHandler } from '@/services/errorHandling';
import { Asset } from '@/types/coincap';
import { ArrowUpDown, ArrowDown, ArrowUp } from 'lucide-react';

type SortKey = 'priceUsd' | 'volumeUsd24Hr' | 'changePercent24Hr' | 'marketCapUsd';
type SortDirection = 'asc' | 'desc';

export function CryptoList() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { list, loading, error } = useAppSelector((state) => state.cryptos);
  const eventSourceRef = useRef<EventSource | null>(null);
  const [sortKey, setSortKey] = useState<SortKey | null>(() => {
    const key = searchParams.get('sort');
    return (key as SortKey) || null;
  });
  const [sortDirection, setSortDirection] = useState<SortDirection>(() => {
    return (searchParams.get('order') as SortDirection) || 'desc';
  });
  const [activeFilter, setActiveFilter] = useState<FilterConfig | null>(() => {
    const field = searchParams.get('filterField');
    const min = searchParams.get('filterMin');
    const max = searchParams.get('filterMax');

    if (field && (min || max)) {
      return {
        field: field as FilterField,
        range: {
          min: min || '',
          max: max || ''
        }
      };
    }
    return null;
  });

  const updateQueryParams = useCallback((params: {
    sort?: string | null;
    order?: string | null;
    filterField?: string | null;
    filterMin?: string | null;
    filterMax?: string | null;
  }) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());

    Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, value);
      }
    });

    const queryString = newSearchParams.toString();
    const newUrl = queryString ? `?${queryString}` : window.location.pathname;
    router.push(newUrl);
  }, [router, searchParams]);

  const fetchCryptos = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const assets = await coincapApi.getTopAssets();
      dispatch(setCryptos(assets));
    } catch (err) {
      const isOffline = !window.navigator.onLine;
      const category = isOffline ? 'network' : 'api';
      dispatch(setError(
        ErrorHandler.createError(
          err instanceof Error ? err.message : 'Failed to fetch cryptocurrencies',
          category,
          'major'
        )
      ));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    fetchCryptos();

    // Set up SSE connection
    eventSourceRef.current = new EventSource('/api/prices');

    eventSourceRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.error) {
          dispatch(setError(
            ErrorHandler.createError(
              data.error,
              'api',
              'minor'
            )
          ));
          return;
        }

        if (data.assets) {
          data.assets.forEach((asset: Asset) => {
            dispatch(updatePrice({ id: asset.id, priceUsd: asset.priceUsd }));
          });
        }
      } catch {
        dispatch(setError(
          ErrorHandler.createError(
            'Failed to process price update',
            'api',
            'minor'
          )
        ));
      }
    };

    eventSourceRef.current.onerror = () => {
      dispatch(setError(
        ErrorHandler.createError(
          'Lost connection to price updates',
          'network',
          'minor'
        )
      ));
    };

    return () => {
      eventSourceRef.current?.close();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSort = (key: SortKey) => {
    const newDirection = sortKey === key && sortDirection === 'desc' ? 'asc' : 'desc';
    setSortKey(key);
    setSortDirection(newDirection);
    updateQueryParams({
      sort: key,
      order: newDirection
    });
  };

  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) {
      return <ArrowUpDown className="inline-block w-4 h-4 ml-1" />;
    }
    return sortDirection === 'asc'
      ? <ArrowUp className="inline-block w-4 h-4 ml-1" />
      : <ArrowDown className="inline-block w-4 h-4 ml-1" />;
  };

  const parseCurrencyString = (value: string): number => {
    return Number(value.replace(/[^0-9.-]+/g, ''));
  };

  const filteredAndSortedList = useMemo(() => {
    let result = list;

    // Apply filters if they exist
    if (activeFilter) {
      const min = activeFilter.range.min !== '' ? parseCurrencyString(activeFilter.range.min) : null;
      const max = activeFilter.range.max !== '' ? parseCurrencyString(activeFilter.range.max) : null;

      result = result.filter(item => {
        const value = parseFloat(item[activeFilter.field]);
        if (min !== null && max !== null) {
          return value >= min && value <= max;
        } else if (min !== null) {
          return value >= min;
        } else if (max !== null) {
          return value <= max;
        }
        return true;
      });
    }

    // Apply sorting
    if (!sortKey) return result;

    return result.toSorted((a, b) => {
      const multiplier = sortDirection === 'asc' ? 1 : -1;
      const aValue = parseFloat(a[sortKey]);
      const bValue = parseFloat(b[sortKey]);
      return (aValue - bValue) * multiplier;
    });
  }, [list, sortKey, sortDirection, activeFilter]);

  const handleApplyFilter = (filterConfig: FilterConfig) => {
    setActiveFilter(filterConfig);
    updateQueryParams({
      filterField: filterConfig.field,
      filterMin: filterConfig.range.min,
      filterMax: filterConfig.range.max
    });
  };

  const handleResetFilter = () => {
    setActiveFilter(null);
    updateQueryParams({
      filterField: null,
      filterMin: null,
      filterMax: null
    });
  };

  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-sm font-medium text-gray-500 border-b border-gray-200 dark:border-gray-800">
              <th scope="col" className="p-4 text-left font-medium">Rank</th>
              <th scope="col" className="p-4 text-left font-medium">Name</th>
              <th scope="col" className="p-4 text-left font-medium">Price</th>
              <th scope="col" className="p-4 text-right font-medium">Market Cap</th>
              <th scope="col" className="p-4 text-right font-medium">VWAP (24Hr)</th>
              <th scope="col" className="p-4 text-right font-medium">Supply</th>
              <th scope="col" className="p-4 text-right font-medium">Volume (24Hr)</th>
              <th scope="col" className="p-4 text-right font-medium">Change (24Hr)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {[...Array(10)].map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="p-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-8" />
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded-full" />
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-16" />
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-20" />
                </td>
                <td className="p-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24 ml-auto" />
                </td>
                <td className="p-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-20 ml-auto" />
                </td>
                <td className="p-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-20 ml-auto" />
                </td>
                <td className="p-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24 ml-auto" />
                </td>
                <td className="p-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-16 ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (error) {
    return (
      <>
        {error.severity === 'major' ? (
          <ErrorMessage error={error} onRetry={fetchCryptos} />
        ) : (
          <Toast
            error={error}
              onDismiss={() => dispatch(setError(ErrorHandler.createError('', 'unknown', 'minor')))}
          />
        )}
      </>
    );
  }

  return (
    <div className="space-y-4">
      <CryptoFilters
        onApplyFilter={handleApplyFilter}
        onReset={handleResetFilter}
      />

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-sm border-b border-gray-200 dark:border-gray-800">
              <th scope="col" className="p-4 text-left font-medium text-foreground">Rank</th>
              <th scope="col" className="p-4 text-left font-medium text-foreground">Name</th>
              <th scope="col" className="p-4 text-left font-medium text-foreground cursor-pointer hover:text-foreground/70" onClick={() => handleSort('priceUsd')}>
                <span className="inline-flex items-center">
                  Price {getSortIcon('priceUsd')}
                </span>
              </th>
              <th scope="col" className="p-4 text-right font-medium text-foreground cursor-pointer hover:text-foreground/70" onClick={() => handleSort('marketCapUsd')}>
                <span className="inline-flex items-center justify-end">
                  Market Cap {getSortIcon('marketCapUsd')}
                </span>
              </th>
              <th scope="col" className="p-4 text-right font-medium text-foreground">VWAP (24Hr)</th>
              <th scope="col" className="p-4 text-right font-medium text-foreground">Supply</th>
              <th scope="col" className="p-4 text-right font-medium text-foreground cursor-pointer hover:text-foreground/70" onClick={() => handleSort('volumeUsd24Hr')}>
                <span className="inline-flex items-center justify-end">
                  Volume (24Hr) {getSortIcon('volumeUsd24Hr')}
                </span>
              </th>
              <th scope="col" className="p-4 text-right font-medium text-foreground cursor-pointer hover:text-foreground/70" onClick={() => handleSort('changePercent24Hr')}>
                <span className="inline-flex items-center justify-end">
                  Change (24Hr) {getSortIcon('changePercent24Hr')}
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {loading ? (
              // Loading skeleton rows
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="p-4">
                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-8" />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 bg-gray-100 dark:bg-gray-800 rounded-full" />
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-24" />
                        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-16" />
                      </div>
                    </div>
                  </td>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="p-4">
                      <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-20 ml-auto" />
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              filteredAndSortedList.map((crypto) => (
                <CryptoListItem key={crypto.id} asset={crypto} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}