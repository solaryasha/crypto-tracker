import { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { setLoading, setCryptos, setError, updatePrice } from '@/store/slices/cryptosSlice';
import { coincapApi } from '@/services/coincapApi';
import { ErrorHandler } from '@/services/errorHandling';
import { Asset } from '@/types/coincap';

export function useCryptoDataFetching() {
  const dispatch = useAppDispatch();
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

  return { fetchCryptos };
}