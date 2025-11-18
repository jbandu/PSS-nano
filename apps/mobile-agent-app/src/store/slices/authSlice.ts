import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Agent } from '@/types';

interface AuthState {
  agent: Agent | null;
  token: string | null;
  isAuthenticated: boolean;
  biometricEnabled: boolean;
  sessionStartTime: number | null;
  lastActivityTime: number | null;
}

const initialState: AuthState = {
  agent: null,
  token: null,
  isAuthenticated: false,
  biometricEnabled: false,
  sessionStartTime: null,
  lastActivityTime: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAgent: (state, action: PayloadAction<Agent>) => {
      state.agent = action.payload;
      state.isAuthenticated = true;
      state.sessionStartTime = Date.now();
      state.lastActivityTime = Date.now();
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    logout: (state) => {
      state.agent = null;
      state.token = null;
      state.isAuthenticated = false;
      state.sessionStartTime = null;
      state.lastActivityTime = null;
    },
    enableBiometric: (state) => {
      state.biometricEnabled = true;
    },
    disableBiometric: (state) => {
      state.biometricEnabled = false;
    },
    updateActivity: (state) => {
      state.lastActivityTime = Date.now();
    },
  },
});

export const { setAgent, setToken, logout, enableBiometric, disableBiometric, updateActivity } =
  authSlice.actions;

export default authSlice.reducer;
