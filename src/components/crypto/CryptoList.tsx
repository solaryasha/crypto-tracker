'use client';

import { useEffect, useCallback, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { CryptoListItem } from './CryptoListItem';
import { CryptoFilters, FilterConfig, FilterField } from './CryptoFilters';
import { CryptoTableSkeleton } from './CryptoTableSkeleton';
import { ErrorMessage } from '@/components/errors/ErrorMessage';
import { Toast } from '@/components/errors/Toast';
import { ArrowUpDown, ArrowDown, ArrowUp } from 'lucide-react';
import { useCryptoDataFetching } from '@/hooks/useCryptoDataFetching';
import { ErrorHandler } from '@/services/errorHandling';
import { setError } from '@/store/slices/cryptosSlice';

type SortKey = 'priceUsd' | 'volumeUsd24Hr' | 'changePercent24Hr' | 'marketCapUsd';
type SortDirection = 'asc' | 'desc';

export function CryptoList() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { list, loading, error } = useAppSelector((state) => state.cryptos);
  const { fetchCryptos } = useCryptoDataFetching();
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [activeFilter, setActiveFilter] = useState<FilterConfig | null>(null);

  // Initialize search params after mount
  useEffect(() => {
    const key = searchParams.get('sort');
    const order = searchParams.get('order');
    const field = searchParams.get('filterField');
    const min = searchParams.get('filterMin');
    const max = searchParams.get('filterMax');

    setSortKey(key as SortKey || null);
    setSortDirection((order as SortDirection) || 'desc');

    if (field && (min || max)) {
      setActiveFilter({
        field: field as FilterField,
        range: {
          min: min || '',
          max: max || ''
        }
      });
    }
  }, [searchParams]);

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
    setSortKey(null);
    setSortDirection('desc');
    updateQueryParams({
      filterField: null,
      filterMin: null,
      filterMax: null,
      sort: null,
      order: null
    });
  };

  if (loading) {
    return <CryptoTableSkeleton />;
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
              <th scope="col" className="p-4 text-left font-medium text-foreground transition-opacity cursor-pointer group" onClick={() => handleSort('priceUsd')}>
                <span className="inline-flex items-center opacity-100 group-hover:opacity-60">
                  Price {getSortIcon('priceUsd')}
                </span>
              </th>
              <th scope="col" className="p-4 text-right font-medium text-foreground transition-opacity cursor-pointer group hidden sm:table-cell" onClick={() => handleSort('marketCapUsd')}>
                <span className="inline-flex items-center justify-end opacity-100 group-hover:opacity-60">
                  Market Cap {getSortIcon('marketCapUsd')}
                </span>
              </th>
              <th scope="col" className="p-4 text-right font-medium text-foreground hidden md:table-cell transition-opacity cursor-pointer group">
                <span className="inline-flex items-center justify-end opacity-100 group-hover:opacity-60">
                  VWAP (24Hr)
                </span>
              </th>
              <th scope="col" className="p-4 text-right font-medium text-foreground hidden lg:table-cell transition-opacity cursor-pointer group">
                <span className="inline-flex items-center justify-end opacity-100 group-hover:opacity-60">
                  Supply
                </span>
              </th>
              <th scope="col" className="p-4 text-right font-medium text-foreground hidden md:table-cell transition-opacity cursor-pointer group" onClick={() => handleSort('volumeUsd24Hr')}>
                <span className="inline-flex items-center justify-end opacity-100 group-hover:opacity-60">
                  Volume (24Hr) {getSortIcon('volumeUsd24Hr')}
                </span>
              </th>
              <th scope="col" className="p-4 text-right font-medium text-foreground transition-opacity cursor-pointer group" onClick={() => handleSort('changePercent24Hr')}>
                <span className="inline-flex items-center justify-end opacity-100 group-hover:opacity-60">
                  Change (24Hr) {getSortIcon('changePercent24Hr')}
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {filteredAndSortedList.map((crypto) => (
              <CryptoListItem key={crypto.id} asset={crypto} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}