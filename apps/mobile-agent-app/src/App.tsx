import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { NavigationContainer } from '@react-navigation/native';
import { store, persistor } from './store';
import RootNavigator from './navigation/RootNavigator';
import offlineSyncService from './services/offline-sync.service';
import paymentService from './services/payment.service';
import { StyleSheet } from 'react-native';

function App(): React.JSX.Element {
  useEffect(() => {
    // Initialize services
    const initializeServices = async () => {
      try {
        await offlineSyncService.initialize();
        await paymentService.initialize();
        console.log('Services initialized');
      } catch (error) {
        console.error('Failed to initialize services:', error);
      }
    };

    initializeServices();

    return () => {
      offlineSyncService.destroy();
    };
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </PersistGate>
        </Provider>
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
