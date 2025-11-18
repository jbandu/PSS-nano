import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OfflineTransaction } from '@/types';

interface OfflineState {
  isOnline: boolean;
  transactions: OfflineTransaction[];
  lastSyncTime: number | null;
  syncInProgress: boolean;
}

const initialState: OfflineState = {
  isOnline: true,
  transactions: [],
  lastSyncTime: null,
  syncInProgress: false,
};

const offlineSlice = createSlice({
  name: 'offline',
  initialState,
  reducers: {
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    addOfflineTransaction: (state, action: PayloadAction<OfflineTransaction>) => {
      state.transactions.push(action.payload);
    },
    removeOfflineTransaction: (state, action: PayloadAction<string>) => {
      state.transactions = state.transactions.filter((t) => t.id !== action.payload);
    },
    markTransactionSynced: (state, action: PayloadAction<string>) => {
      const transaction = state.transactions.find((t) => t.id === action.payload);
      if (transaction) {
        transaction.synced = true;
      }
    },
    incrementSyncAttempts: (state, action: PayloadAction<string>) => {
      const transaction = state.transactions.find((t) => t.id === action.payload);
      if (transaction) {
        transaction.syncAttempts += 1;
        transaction.lastSyncAttempt = Date.now();
      }
    },
    setSyncInProgress: (state, action: PayloadAction<boolean>) => {
      state.syncInProgress = action.payload;
    },
    setLastSyncTime: (state, action: PayloadAction<number>) => {
      state.lastSyncTime = action.payload;
    },
    clearSyncedTransactions: (state) => {
      state.transactions = state.transactions.filter((t) => !t.synced);
    },
  },
});

export const {
  setOnlineStatus,
  addOfflineTransaction,
  removeOfflineTransaction,
  markTransactionSynced,
  incrementSyncAttempts,
  setSyncInProgress,
  setLastSyncTime,
  clearSyncedTransactions,
} = offlineSlice.actions;

export default offlineSlice.reducer;
