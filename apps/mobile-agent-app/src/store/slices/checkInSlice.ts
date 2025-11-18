import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CheckInTransaction } from '@/types';

interface CheckInState {
  activeTransactions: CheckInTransaction[];
  currentTransactionId: string | null;
  completedToday: number;
  passengersProcessedToday: number;
  averageCheckInTime: number;
}

const initialState: CheckInState = {
  activeTransactions: [],
  currentTransactionId: null,
  completedToday: 0,
  passengersProcessedToday: 0,
  averageCheckInTime: 0,
};

const checkInSlice = createSlice({
  name: 'checkIn',
  initialState,
  reducers: {
    startTransaction: (state, action: PayloadAction<CheckInTransaction>) => {
      state.activeTransactions.push(action.payload);
      state.currentTransactionId = action.payload.id;
    },
    updateTransaction: (state, action: PayloadAction<CheckInTransaction>) => {
      const index = state.activeTransactions.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.activeTransactions[index] = action.payload;
      }
    },
    completeTransaction: (state, action: PayloadAction<string>) => {
      const transaction = state.activeTransactions.find((t) => t.id === action.payload);
      if (transaction && transaction.checkInDuration) {
        state.completedToday += 1;
        state.passengersProcessedToday += transaction.totalPassengers;

        // Update average check-in time
        const totalTime = state.averageCheckInTime * (state.completedToday - 1);
        state.averageCheckInTime = (totalTime + transaction.checkInDuration) / state.completedToday;
      }

      state.activeTransactions = state.activeTransactions.filter((t) => t.id !== action.payload);
      if (state.currentTransactionId === action.payload) {
        state.currentTransactionId = state.activeTransactions[0]?.id || null;
      }
    },
    setCurrentTransaction: (state, action: PayloadAction<string>) => {
      state.currentTransactionId = action.payload;
    },
    clearTransactions: (state) => {
      state.activeTransactions = [];
      state.currentTransactionId = null;
    },
    resetDailyStats: (state) => {
      state.completedToday = 0;
      state.passengersProcessedToday = 0;
      state.averageCheckInTime = 0;
    },
  },
});

export const {
  startTransaction,
  updateTransaction,
  completeTransaction,
  setCurrentTransaction,
  clearTransactions,
  resetDailyStats,
} = checkInSlice.actions;

export default checkInSlice.reducer;
