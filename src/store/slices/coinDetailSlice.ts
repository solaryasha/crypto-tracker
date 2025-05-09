import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CoinDetail {
  id: string;
  rank: string;
  symbol: string;
  name: string;
  supply: string;
  maxSupply: string;
  marketCapUsd: string;
  volumeUsd24Hr: string;
  priceUsd: string;
  changePercent24Hr: string;
  vwap24Hr: string;
}

interface CoinDetailState {
  coin: CoinDetail | null;
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
    setCoinDetail: (state, action: PayloadAction<CoinDetail>) => {
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