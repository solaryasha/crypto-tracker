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

interface TableHeader {
  key: string;
  label: string;
  sortKey?: SortKey;
  align?: 'left' | 'right';
  responsive?: string;
}

const TABLE_HEADERS: TableHeader[] = [
  { key: 'rank', label: 'Rank', align: 'left' },
  { key: 'name', label: 'Name', align: 'left' },
  { key: 'price', label: 'Price', sortKey: 'priceUsd', align: 'left' },
  { key: 'marketCap', label: 'Market Cap', sortKey: 'marketCapUsd', align: 'right', responsive: 'hidden sm:table-cell' },
  { key: 'vwap', label: 'VWAP (24Hr)', align: 'right', responsive: 'hidden md:table-cell' },
  { key: 'supply', label: 'Supply', align: 'right', responsive: 'hidden lg:table-cell' },
  { key: 'volume', label: 'Volume (24Hr)', sortKey: 'volumeUsd24Hr', align: 'right', responsive: 'hidden md:table-cell' },
  { key: 'change', label: 'Change (24Hr)', sortKey: 'changePercent24Hr', align: 'right' },
];

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
      if (value === null || value === '') {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, value);
      }
    });

    // Remove the query string if there are no parameters
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
              {TABLE_HEADERS.map(header => (
                <th
                  key={header.key}
                  scope="col"
                  className={`p-4 font-medium text-foreground ${header.sortKey ? 'transition-opacity cursor-pointer group' : ''
                    } ${header.responsive || ''} text-${header.align}`}
                  onClick={header.sortKey ? () => handleSort(header.sortKey!) : undefined}
                >
                  <span className={`inline-flex items-center ${header.align === 'right' ? 'justify-end' : ''
                    } ${header.sortKey ? 'opacity-100 group-hover:opacity-60' : ''}`}>
                    {header.label} {header.sortKey && getSortIcon(header.sortKey)}
                  </span>
                </th>
              ))}
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