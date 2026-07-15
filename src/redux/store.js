import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';

// Import slice reducers
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import bookingReducer from './slices/bookingSlice';
import notificationReducer from './slices/notificationSlice';

// Core API import - ONLY import baseApi
import { baseApi } from './services/api';

const createLocalStorage = () => {
  if (typeof window === 'undefined') {
    return {
      getItem: () => Promise.resolve(null),
      setItem: () => Promise.resolve(),
      removeItem: () => Promise.resolve(),
    };
  }
  return {
    getItem: (key) => { try { return Promise.resolve(localStorage.getItem(key)); } catch { return Promise.resolve(null); } },
    setItem: (key, value) => { try { localStorage.setItem(key, value); return Promise.resolve(); } catch { return Promise.resolve(); } },
    removeItem: (key) => { try { localStorage.removeItem(key); return Promise.resolve(); } catch { return Promise.resolve(); } },
  };
};

const storage = createLocalStorage();

const persistConfig = {
  key: 'root',
  storage, 
  whitelist: ['ui'], 
  version: 1,
};

const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  booking: bookingReducer,
  notification: notificationReducer,
  [baseApi.reducerPath]: baseApi.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/PAUSE', 'persist/FLUSH', 'persist/PURGE', 'persist/REGISTER'],
        ignoredPaths: ['ui'],
      },
    }).concat(baseApi.middleware),
});

export const persistor = persistStore(store);
export default store;
