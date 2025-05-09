'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { CryptoListItem } from './CryptoListItem';
import { coincapApi } from '@/services/coincapApi';
import { setLoading, setCryptos, setError, updatePrice } from '@/store/slices/cryptosSlice';
import { ErrorMessage } from '@/components/errors/ErrorMessage';
import { Toast } from '@/components/errors/Toast';
import { ErrorHandler } from '@/services/errorHandling';
import { Asset } from '@/types/coincap';

export function CryptoList() {
  const dispatch = useAppDispatch();
  const { list, loading, error } = useAppSelector((state) => state.cryptos);
  const eventSourceRef = useRef<EventSource | null>(null);

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

  if (loading) {
    return (
      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="p-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-gray-200 dark:bg-gray-800 rounded-full" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-16" />
                </div>
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
    <div className="divide-y divide-gray-200 dark:divide-gray-800 border-t border-gray-200 dark:border-gray-800">
      {list.map((crypto) => (
        <CryptoListItem key={crypto.id} asset={crypto} />
      ))}
    </div>
  );
}