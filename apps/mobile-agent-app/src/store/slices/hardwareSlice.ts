import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BluetoothDevice } from '@/types';

interface HardwareState {
  scanner: BluetoothDevice | null;
  printer: BluetoothDevice | null;
  paymentTerminal: BluetoothDevice | null;
  scale: BluetoothDevice | null;
  availableDevices: BluetoothDevice[];
  isScanning: boolean;
}

const initialState: HardwareState = {
  scanner: null,
  printer: null,
  paymentTerminal: null,
  scale: null,
  availableDevices: [],
  isScanning: false,
};

const hardwareSlice = createSlice({
  name: 'hardware',
  initialState,
  reducers: {
    setScanner: (state, action: PayloadAction<BluetoothDevice | null>) => {
      state.scanner = action.payload;
    },
    setPrinter: (state, action: PayloadAction<BluetoothDevice | null>) => {
      state.printer = action.payload;
    },
    setPaymentTerminal: (state, action: PayloadAction<BluetoothDevice | null>) => {
      state.paymentTerminal = action.payload;
    },
    setScale: (state, action: PayloadAction<BluetoothDevice | null>) => {
      state.scale = action.payload;
    },
    setAvailableDevices: (state, action: PayloadAction<BluetoothDevice[]>) => {
      state.availableDevices = action.payload;
    },
    addAvailableDevice: (state, action: PayloadAction<BluetoothDevice>) => {
      const exists = state.availableDevices.find((d) => d.id === action.payload.id);
      if (!exists) {
        state.availableDevices.push(action.payload);
      }
    },
    setIsScanning: (state, action: PayloadAction<boolean>) => {
      state.isScanning = action.payload;
    },
    disconnectAll: (state) => {
      state.scanner = null;
      state.printer = null;
      state.paymentTerminal = null;
      state.scale = null;
    },
  },
});

export const {
  setScanner,
  setPrinter,
  setPaymentTerminal,
  setScale,
  setAvailableDevices,
  addAvailableDevice,
  setIsScanning,
  disconnectAll,
} = hardwareSlice.actions;

export default hardwareSlice.reducer;
