import { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { setLoading, setCryptos, setError, updatePrice } from '@/store/slices/cryptosSlice';
import { coincapApi } from '@/services/coincapApi';
import { ErrorHandler, AppError } from '@/services/errorHandling';
import { Asset } from '@/types/coincap';
import { useRouter } from 'next/navigation';

export function useCryptoDataFetching() {
  const dispatch = useAppDispatch();
  const eventSourceRef = useRef<EventSource | null>(null);
  const router = useRouter();

  const handleError = useCallback((appError: AppError) => {
    if (appError?.statusCode === 404) {
      router.push('/not-found');
    } else {
      dispatch(setError(appError));
    }
  }, [dispatch, router]);

  const fetchCryptos = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const assets = await coincapApi.getTopAssets();
      dispatch(setCryptos(assets));
    } catch (err) {
      handleError(err as AppError)
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, handleError]);

  useEffect(() => {
    fetchCryptos();

    // Set up SSE connection
    eventSourceRef.current = new EventSource('/api/prices');

    eventSourceRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.error) {
          // Assuming the error from SSE might have a statusCode
          const statusCode = data.statusCode;
          const appError = ErrorHandler.createError(
            data.error,
            'api',
            'minor',
            statusCode
          );
          handleError(appError);
          return;
        }

        if (data.assets) {
          data.assets.forEach((asset: Asset) => {
            dispatch(updatePrice({ id: asset.id, priceUsd: asset.priceUsd }));
          });
        }
      } catch (error) { // Changed parseError to error and log it
        console.error('Failed to parse price update:', error);
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
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchCryptos, handleError]); // Added fetchCryptos and handleError to dependency array

  return { fetchCryptos };
}