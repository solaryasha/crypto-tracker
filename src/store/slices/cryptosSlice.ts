import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Asset } from '@/types/coincap';

interface CryptosState {
  list: Asset[];
  loading: boolean;
  error: string | null;
}

const initialState: CryptosState = {
  list: [],
  loading: false,
  error: null,
};

export const cryptosSlice = createSlice({
  name: 'cryptos',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setCryptos: (state, action: PayloadAction<Asset[]>) => {
      state.list = action.payload;
      state.loading = false;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    updatePrice: (state, action: PayloadAction<{ id: string; priceUsd: string }>) => {
      const crypto = state.list.find(c => c.id === action.payload.id);
      if (crypto) {
        crypto.priceUsd = action.payload.priceUsd;
      }
    },
  },
});

export const { setLoading, setCryptos, setError, updatePrice } = cryptosSlice.actions;
export default cryptosSlice.reducer;