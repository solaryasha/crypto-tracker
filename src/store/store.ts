import { configureStore } from '@reduxjs/toolkit';
import cryptosReducer from './slices/cryptosSlice';
import coinDetailReducer from './slices/coinDetailSlice';

export const store = configureStore({
  reducer: {
    cryptos: cryptosReducer,
    coinDetail: coinDetailReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;