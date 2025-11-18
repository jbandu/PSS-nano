import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '@/store';
import {
  setOnlineStatus,
  addOfflineTransaction,
  markTransactionSynced,
  incrementSyncAttempts,
  setSyncInProgress,
  setLastSyncTime,
  clearSyncedTransactions,
} from '@/store/slices/offlineSlice';
import { OfflineTransaction } from '@/types';
import apiService from './api.service';

class OfflineSyncService {
  private syncInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Monitor network status
    NetInfo.addEventListener((state) => {
      const isOnline = state.isConnected && state.isInternetReachable;
      store.dispatch(setOnlineStatus(isOnline || false));

      if (isOnline) {
        // Network restored - trigger sync
        this.syncOfflineTransactions();
      }
    });

    // Start periodic sync
    const syncIntervalSeconds = parseInt(Config.SYNC_INTERVAL_SECONDS || '30', 10);
    this.syncInterval = setInterval(() => {
      this.syncOfflineTransactions();
    }, syncIntervalSeconds * 1000);

    // Load cached data
    await this.loadCachedData();

    this.isInitialized = true;
  }

  async cacheFlightManifest(flightId: string, manifest: any): Promise<void> {
    try {
      await AsyncStorage.setItem(`manifest_${flightId}`, JSON.stringify(manifest));
      console.log(`Cached manifest for flight ${flightId}`);
    } catch (error) {
      console.error('Failed to cache manifest:', error);
    }
  }

  async getCachedFlightManifest(flightId: string): Promise<any | null> {
    try {
      const cached = await AsyncStorage.getItem(`manifest_${flightId}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Failed to get cached manifest:', error);
      return null;
    }
  }

  async cacheSeatMap(flightId: string, seatMap: any): Promise<void> {
    try {
      await AsyncStorage.setItem(`seatmap_${flightId}`, JSON.stringify(seatMap));
      console.log(`Cached seat map for flight ${flightId}`);
    } catch (error) {
      console.error('Failed to cache seat map:', error);
    }
  }

  async getCachedSeatMap(flightId: string): Promise<any | null> {
    try {
      const cached = await AsyncStorage.getItem(`seatmap_${flightId}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Failed to get cached seat map:', error);
      return null;
    }
  }

  async cachePassengerProfile(passengerId: string, profile: any): Promise<void> {
    try {
      await AsyncStorage.setItem(`profile_${passengerId}`, JSON.stringify(profile));
    } catch (error) {
      console.error('Failed to cache passenger profile:', error);
    }
  }

  async getCachedPassengerProfile(passengerId: string): Promise<any | null> {
    try {
      const cached = await AsyncStorage.getItem(`profile_${passengerId}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Failed to get cached profile:', error);
      return null;
    }
  }

  async queueOfflineTransaction(
    type: OfflineTransaction['type'],
    data: any
  ): Promise<void> {
    const state = store.getState();
    const maxTransactions = parseInt(Config.MAX_OFFLINE_TRANSACTIONS || '100', 10);

    if (state.offline.transactions.length >= maxTransactions) {
      throw new Error('Offline queue is full. Cannot process more transactions offline.');
    }

    const transaction: OfflineTransaction = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      type,
      data,
      timestamp: Date.now(),
      synced: false,
      syncAttempts: 0,
    };

    store.dispatch(addOfflineTransaction(transaction));

    // Also persist to AsyncStorage for persistence across app restarts
    await this.persistOfflineTransactions();

    console.log(`Queued offline transaction: ${transaction.id}`);
  }

  private async persistOfflineTransactions(): Promise<void> {
    try {
      const state = store.getState();
      await AsyncStorage.setItem(
        'offline_transactions',
        JSON.stringify(state.offline.transactions)
      );
    } catch (error) {
      console.error('Failed to persist offline transactions:', error);
    }
  }

  private async loadOfflineTransactions(): Promise<void> {
    try {
      const cached = await AsyncStorage.getItem('offline_transactions');
      if (cached) {
        const transactions: OfflineTransaction[] = JSON.parse(cached);
        transactions.forEach((transaction) => {
          store.dispatch(addOfflineTransaction(transaction));
        });
        console.log(`Loaded ${transactions.length} offline transactions`);
      }
    } catch (error) {
      console.error('Failed to load offline transactions:', error);
    }
  }

  async syncOfflineTransactions(): Promise<void> {
    const state = store.getState();

    if (!state.offline.isOnline) {
      console.log('Device is offline - skipping sync');
      return;
    }

    if (state.offline.syncInProgress) {
      console.log('Sync already in progress - skipping');
      return;
    }

    const unsyncedTransactions = state.offline.transactions.filter((t) => !t.synced);

    if (unsyncedTransactions.length === 0) {
      return;
    }

    console.log(`Syncing ${unsyncedTransactions.length} offline transactions`);

    store.dispatch(setSyncInProgress(true));

    for (const transaction of unsyncedTransactions) {
      try {
        await this.syncTransaction(transaction);
        store.dispatch(markTransactionSynced(transaction.id));
      } catch (error) {
        console.error(`Failed to sync transaction ${transaction.id}:`, error);
        store.dispatch(incrementSyncAttempts(transaction.id));

        // Give up after 5 attempts
        if (transaction.syncAttempts >= 5) {
          console.error(`Transaction ${transaction.id} failed after 5 attempts - removing`);
          // Could implement dead letter queue here
        }
      }
    }

    store.dispatch(setSyncInProgress(false));
    store.dispatch(setLastSyncTime(Date.now()));

    // Clean up synced transactions
    store.dispatch(clearSyncedTransactions());
    await this.persistOfflineTransactions();
  }

  private async syncTransaction(transaction: OfflineTransaction): Promise<void> {
    switch (transaction.type) {
      case 'check_in':
        await apiService.startCheckIn(transaction.data);
        break;
      case 'seat_assignment':
        await apiService.assignSeat(
          transaction.data.passengerCheckInId,
          transaction.data.seatData
        );
        break;
      case 'baggage_tag':
        await apiService.issueBaggageTag(transaction.data);
        break;
      case 'payment':
        await apiService.createPaymentIntent(transaction.data);
        break;
      case 'apis_collection':
        await apiService.collectAPISData(transaction.data);
        break;
      default:
        console.warn(`Unknown transaction type: ${transaction.type}`);
    }
  }

  private async loadCachedData(): Promise<void> {
    // Load offline transactions
    await this.loadOfflineTransactions();

    // Could load other cached data here
    console.log('Cached data loaded');
  }

  async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(
        (key) =>
          key.startsWith('manifest_') ||
          key.startsWith('seatmap_') ||
          key.startsWith('profile_')
      );
      await AsyncStorage.multiRemove(cacheKeys);
      console.log(`Cleared ${cacheKeys.length} cached items`);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  async getCacheSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;

      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }

      return totalSize; // In bytes
    } catch (error) {
      console.error('Failed to calculate cache size:', error);
      return 0;
    }
  }

  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.isInitialized = false;
  }
}

export default new OfflineSyncService();
