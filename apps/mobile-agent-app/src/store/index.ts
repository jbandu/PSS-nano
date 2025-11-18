import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { offline } from '@redux-offline/redux-offline';
import offlineConfig from '@redux-offline/redux-offline/lib/defaults';

// Reducers
import authReducer from './slices/authSlice';
import checkInReducer from './slices/checkInSlice';
import hardwareReducer from './slices/hardwareSlice';
import queueReducer from './slices/queueSlice';
import offlineReducer from './slices/offlineSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  checkIn: checkInReducer,
  hardware: hardwareReducer,
  queue: queueReducer,
  offline: offlineReducer,
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'offline'], // Only persist auth and offline data
  blacklist: ['checkIn', 'hardware', 'queue'], // Don't persist these
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  enhancers: (getDefaultEnhancers) =>
    getDefaultEnhancers().concat(
      offline({
        ...offlineConfig,
        persist: false, // We handle persistence separately
      })
    ),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
