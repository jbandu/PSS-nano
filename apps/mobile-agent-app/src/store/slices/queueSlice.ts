import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { QueueItem } from '@/types';

interface QueueState {
  items: QueueItem[];
  currentItem: QueueItem | null;
}

const initialState: QueueState = {
  items: [],
  currentItem: null,
};

const queueSlice = createSlice({
  name: 'queue',
  initialState,
  reducers: {
    addToQueue: (state, action: PayloadAction<QueueItem>) => {
      state.items.push(action.payload);
      // Sort by priority
      state.items.sort((a, b) => {
        const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
    },
    removeFromQueue: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      if (state.currentItem?.id === action.payload) {
        state.currentItem = null;
      }
    },
    setCurrentItem: (state, action: PayloadAction<QueueItem | null>) => {
      state.currentItem = action.payload;
    },
    clearQueue: (state) => {
      state.items = [];
      state.currentItem = null;
    },
  },
});

export const { addToQueue, removeFromQueue, setCurrentItem, clearQueue } = queueSlice.actions;

export default queueSlice.reducer;
