import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Asset } from '@/types/coincap';

interface CoinDetailState {
  coin: Asset | null;
  loading: boolean;
  error: string | null;
}

const initialState: CoinDetailState = {
  coin: null,
  loading: false,
  error: null,
};

export const coinDetailSlice = createSlice({
  name: 'coinDetail',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setCoinDetail: (state, action: PayloadAction<Asset>) => {
      state.coin = action.payload;
      state.loading = false;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    updateCoinPrice: (state, action: PayloadAction<{ priceUsd: string }>) => {
      if (state.coin) {
        state.coin.priceUsd = action.payload.priceUsd;
      }
    },
    clearCoin: (state) => {
      state.coin = null;
      state.error = null;
      state.loading = false;
    },
  },
});

export const { setLoading, setCoinDetail, setError, updateCoinPrice, clearCoin } = coinDetailSlice.actions;
export default coinDetailSlice.reducer;