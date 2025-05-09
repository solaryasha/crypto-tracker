'use client';

import { useEffect, use, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { coincapApi } from '@/services/coincapApi';
import { setLoading, setCoinDetail, setError, updateCoinPrice, clearCoin } from '@/store/slices/coinDetailSlice';
import { ErrorMessage } from '@/components/errors/ErrorMessage';
import { Toast } from '@/components/errors/Toast';
import { ErrorHandler } from '@/services/errorHandling';
import { PriceTicker } from '@/components/crypto/PriceTicker';

interface CoinDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CoinDetailPage({ params }: CoinDetailPageProps) {
  const resolvedParams = use(params);
  const dispatch = useAppDispatch();
  const { coin, loading, error } = useAppSelector((state) => state.coinDetail);
  const eventSourceRef = useRef<EventSource | null>(null);

  const fetchCoinDetail = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const asset = await coincapApi.getAssetById(resolvedParams.id);
      dispatch(setCoinDetail(asset));
    } catch (err) {
      const isOffline = !window.navigator.onLine;
      const category = isOffline ? 'network' : 'api';
      dispatch(setError(
        ErrorHandler.createError(
          err instanceof Error ? err.message : 'Failed to fetch coin details',
          category,
          'major'
        )
      ));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, resolvedParams.id]);

  useEffect(() => {
    fetchCoinDetail();

    // Set up SSE connection for real-time price updates
    eventSourceRef.current = new EventSource(`/api/prices/${resolvedParams.id}`);

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

        
        if (data.asset) {
          dispatch(updateCoinPrice({ priceUsd: data.asset.priceUsd }));
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
      console.log('Closing SSE connection');
      eventSourceRef.current?.close();
      dispatch(clearCoin());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams.id]);

  const handleRetry = () => {
    dispatch(setError(ErrorHandler.createError('', 'unknown', 'minor')));
    fetchCoinDetail();
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {error.severity === 'major' ? (
          <ErrorMessage error={error} onRetry={handleRetry} />
        ) : (
          <Toast
            error={error}
              onDismiss={() => dispatch(setError(null))}
          />
        )}
      </div>
    );
  }

  if (loading || !coin) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  const price = parseFloat(coin.priceUsd);
  const change = parseFloat(coin.changePercent24Hr);
  const marketCap = parseFloat(coin.marketCapUsd);
  const volume = parseFloat(coin.volumeUsd24Hr);
  const supply = parseFloat(coin.supply);
  const maxSupply = coin.maxSupply ? parseFloat(coin.maxSupply) : null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center text-lg font-semibold">
          {coin.symbol.slice(0, 1)}
        </div>
        <div>
          <h1 className="text-3xl font-bold">{coin.name}</h1>
          <p className="text-gray-500 dark:text-gray-400">{coin.symbol}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Price Information</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Current Price</p>
              <p className="text-2xl font-mono font-semibold">
                <PriceTicker price={price} showSmallDecimals={price < 1} className="text-2xl" />
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">24h Change</p>
              <p className={`text-lg ${change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {change >= 0 ? '+' : ''}{change.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Market Information</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Market Cap</p>
              <p className="text-lg font-medium">${(marketCap / 1e9).toFixed(2)}B</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">24h Volume</p>
              <p className="text-lg font-medium">${(volume / 1e9).toFixed(2)}B</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Supply Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Circulating Supply</p>
            <p className="text-lg font-medium">
              {supply.toLocaleString()} {coin.symbol}
            </p>
          </div>
          {maxSupply && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Max Supply</p>
              <p className="text-lg font-medium">
                {maxSupply.toLocaleString()} {coin.symbol}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}