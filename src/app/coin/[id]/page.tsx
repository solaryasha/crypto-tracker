'use client';

import { useEffect, use, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { coincapApi } from '@/services/coincapApi';
import { setLoading, setCoinDetail, setError, updateCoinPrice, clearCoin } from '@/store/slices/coinDetailSlice';
import { ErrorMessage } from '@/components/errors/ErrorMessage';
import { Toast } from '@/components/errors/Toast';
import { ErrorHandler, AppError } from '@/services/errorHandling'; // Import AppError
import { PriceTicker } from '@/components/crypto/PriceTicker';
import { useTheme } from 'next-themes';
import cn from 'classnames'
import { useRouter } from 'next/navigation'; // Import useRouter

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
  const router = useRouter(); // Initialize useRouter
  const { theme } = useTheme();

  const handleError = useCallback((appError: AppError) => {
    if (appError.statusCode === 404) {
      router.push('/not-found');
    } else {
      dispatch(setError(appError));
    }
  }, [dispatch, router]);

  const fetchCoinDetail = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const asset = await coincapApi.getAssetById(resolvedParams.id);
      dispatch(setCoinDetail(asset));
    } catch (err) {
      handleError(err as AppError); // Cast to AppError
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, resolvedParams.id, handleError]);

  useEffect(() => {
    fetchCoinDetail();

    // Set up SSE connection for real-time price updates
    eventSourceRef.current = new EventSource(`/api/prices/${resolvedParams.id}`);

    eventSourceRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.error) {
          const statusCode = data.statusCode; // Get statusCode from SSE data
          const appError = ErrorHandler.createError(
            data.error,
            'api',
            'minor',
            statusCode
          );
          handleError(appError);
          return;
        }

        
        if (data.asset) {
          dispatch(updateCoinPrice({ priceUsd: data.asset.priceUsd }));
        }
      } catch (parseError) { // Changed variable name to avoid conflict
        console.error('Failed to parse price update from SSE:', parseError);
        const appError = ErrorHandler.createError(
          'Failed to process price update',
          'api',
          'minor'
        );
        handleError(appError);
      }
    };

    eventSourceRef.current.onerror = () => {
      const appError = ErrorHandler.createError(
        'Lost connection to price updates',
        'network',
        'minor'
      );
      handleError(appError);
    };

    return () => {
      eventSourceRef.current?.close();
      dispatch(clearCoin());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams.id, fetchCoinDetail, handleError]); // Added fetchCoinDetail and handleError to dependencies

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {error.severity === 'major' ? (
          <ErrorMessage error={error} /> // Removed onRetry
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

  // Format large numbers with T for trillion, B for billion, rounded to hundreds
  const formatLargeNumber = (num: number) => {
    if (num >= 1e12) {
      // Round to nearest hundred billion
      const roundedT = Math.round(num / 1e11) * 1e11 / 1e12;
      return `$${roundedT.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}T`;
    }
    if (num >= 1e9) {
      // Round to nearest hundred million
      const roundedB = Math.round(num / 1e8) * 1e8 / 1e9;
      return `$${roundedB.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}B`;
    }
    if (num >= 1e6) {
      // Round to nearest hundred thousand
      const roundedM = Math.round(num / 1e5) * 1e5 / 1e6;
      return `$${roundedM.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}M`;
    }
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatSupply = (num: number) => {
    if (num >= 1e6) {
      // Round to nearest hundred thousand
      const rounded = Math.round(num / 1e5) * 1e5 / 1e6;
      return `${rounded.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}M`;
    }
    return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold", {
          "bg-gray-200": theme === 'light',
          "dark:bg-gray-800": theme === 'dark',
        })}>
          {coin.symbol.slice(0, 1)}
        </div>
        <div>
          <h1 className="text-3xl font-bold">{coin.name}</h1>
          <p className={cn("text-gray-500", {
            "dark:text-gray-400": theme === 'dark'
          })}>{coin.symbol}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className={cn("p-6 bg-white rounded-lg shadow-sm", {
          "dark:bg-gray-800": theme === 'dark'
        })}>
          <h2 className="text-lg font-semibold mb-4">Price Information</h2>
          <div className="space-y-4">
            <div>
              <p className={cn("text-sm text-gray-500", {
                "dark:text-gray-400": theme === 'dark'
              })}>Current Price</p>
              <p className="text-2xl font-mono font-semibold">
                <PriceTicker price={price} showSmallDecimals={price < 1} className="text-2xl" />
              </p>
            </div>
            <div>
              <p className={cn("text-sm text-gray-500", {
                "dark:text-gray-400": theme === 'dark'
              })}>24h Change</p>
              <p className={cn("text-lg", {
                "text-green-600 dark:text-green-400": change >= 0,
                "text-red-600 dark:text-red-400": change < 0
              })}>
                {change >= 0 ? '+' : ''}{change.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
              </p>
            </div>
          </div>
        </div>

        <div className={cn("p-6 bg-white rounded-lg shadow-sm", {
          "dark:bg-gray-800": theme === 'dark'
        })}>
          <h2 className="text-lg font-semibold mb-4">Market Information</h2>
          <div className="space-y-4">
            <div>
              <p className={cn("text-sm text-gray-500", {
                "dark:text-gray-400": theme === 'dark'
              })}>Market Cap</p>
              <p className="text-lg font-medium">{formatLargeNumber(marketCap)}</p>
            </div>
            <div>
              <p className={cn("text-sm text-gray-500", {
                "dark:text-gray-400": theme === 'dark'
              })}>24h Volume</p>
              <p className="text-lg font-medium">{formatLargeNumber(volume)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className={cn("p-6 bg-white rounded-lg shadow-sm", {
        "dark:bg-gray-800": theme === 'dark'
      })}>
        <h2 className="text-lg font-semibold mb-4">Supply Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className={cn("text-sm text-gray-500", {
              "dark:text-gray-400": theme === 'dark'
            })}>Circulating Supply</p>
            <p className="text-lg font-medium">
              {formatLargeNumber(supply)} {coin.symbol}
            </p>
          </div>
          {maxSupply && (
            <div>
              <p className={cn("text-sm text-gray-500", {
                "dark:text-gray-400": theme === 'dark'
              })}>Max Supply</p>
              <p className="text-lg font-medium">
                {formatSupply(maxSupply)} {coin.symbol}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}