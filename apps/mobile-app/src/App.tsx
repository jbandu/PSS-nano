import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as ReduxProvider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StyleSheet } from 'react-native';

// Store
import { store } from '@/store';

// Navigation
import RootNavigator from '@/navigation/RootNavigator';

// Services
import { initializeFirebase } from '@/services/notifications/fcmService';
import { initializeBiometric } from '@/services/biometric/biometricService';

// i18n
import '@/config/i18n';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App(): JSX.Element {
  useEffect(() => {
    // Initialize services
    initializeServices();
  }, []);

  const initializeServices = async () => {
    try {
      // Initialize Firebase for push notifications
      await initializeFirebase();

      // Initialize biometric authentication
      await initializeBiometric();

      // TODO: Initialize other services
      // - Offline sync
      // - Analytics
      // - Error reporting
    } catch (error) {
      console.error('Failed to initialize services:', error);
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <ReduxProvider store={store}>
          <QueryClientProvider client={queryClient}>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </QueryClientProvider>
        </ReduxProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
