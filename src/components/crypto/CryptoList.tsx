'use client';

import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { CryptoListItem } from './CryptoListItem';
import { coincapApi } from '@/services/coincapApi';
import { setLoading, setCryptos, setError } from '@/store/slices/cryptosSlice';

export function CryptoList() {
  const dispatch = useAppDispatch();
  const { list, loading, error } = useAppSelector((state) => state.cryptos);

  const updatePrices = useCallback(async () => {
    if (list.length > 0) {
      try {
        const ids = list.map(crypto => crypto.id);
        const updates = await coincapApi.getAssetPriceUpdates(ids);
        dispatch(setCryptos(updates));
      } catch (err) {
        console.error('Failed to update prices:', err);
      }
    }
  }, [dispatch, list]);

  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        dispatch(setLoading(true));
        const assets = await coincapApi.getTopAssets();
        dispatch(setCryptos(assets));
      } catch (err) {
        dispatch(setError(err instanceof Error ? err.message : 'Failed to fetch cryptocurrencies'));
      }
    };

    fetchCryptos();

    // Set up polling for price updates
    // const intervalId = setInterval(updatePrices, 3000);

    // return () => clearInterval(intervalId);
  }, []);

  if (error) {
    return (
      <div className="p-4 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg">
        {error}
      </div>
    );
  }

  if (loading && list.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(10)].map((_, index) => (
          <div
            key={index}
            className="animate-pulse p-4 border-b border-gray-200 dark:border-gray-800"
          >
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/6" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-20" />
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-12" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-800 border-t border-gray-200 dark:border-gray-800">
      {list.map((crypto) => (
        <CryptoListItem key={crypto.id} asset={crypto} />
      ))}
    </div>
  );
}