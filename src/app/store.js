import { configureStore } from '@reduxjs/toolkit';
import auth from '../features/auth/authSlice';
import { apiSlice } from './api';

export const makeStore = (preloadedState) =>
  configureStore({
    reducer: { auth, [apiSlice.reducerPath]: apiSlice.reducer },
    middleware: (getDefault) => getDefault().concat(apiSlice.middleware),
    preloadedState,
  });

export const store = makeStore();
