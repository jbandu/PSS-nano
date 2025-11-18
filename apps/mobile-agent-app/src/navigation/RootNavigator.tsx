import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { RootStackParamList } from '@/types';

// Screens (to be created)
import LoginScreen from '@/screens/LoginScreen';
import HomeScreen from '@/screens/HomeScreen';
import PassengerSearchScreen from '@/screens/PassengerSearchScreen';
import CheckInScreen from '@/screens/CheckInScreen';
import SeatSelectionScreen from '@/screens/SeatSelectionScreen';
import BaggageProcessingScreen from '@/screens/BaggageProcessingScreen';
import APISCollectionScreen from '@/screens/APISCollectionScreen';
import PaymentScreen from '@/screens/PaymentScreen';
import AncillarySalesScreen from '@/screens/AncillarySalesScreen';
import QueueManagementScreen from '@/screens/QueueManagementScreen';
import StandbyListScreen from '@/screens/StandbyListScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import DeviceManagementScreen from '@/screens/DeviceManagementScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0057B8',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {!isAuthenticated ? (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      ) : (
        <>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'Mobile Agent' }}
          />
          <Stack.Screen
            name="PassengerSearch"
            component={PassengerSearchScreen}
            options={{ title: 'Passenger Search' }}
          />
          <Stack.Screen
            name="CheckIn"
            component={CheckInScreen}
            options={{ title: 'Check-In' }}
          />
          <Stack.Screen
            name="SeatSelection"
            component={SeatSelectionScreen}
            options={{ title: 'Seat Selection' }}
          />
          <Stack.Screen
            name="BaggageProcessing"
            component={BaggageProcessingScreen}
            options={{ title: 'Baggage Processing' }}
          />
          <Stack.Screen
            name="APISCollection"
            component={APISCollectionScreen}
            options={{ title: 'APIS Collection' }}
          />
          <Stack.Screen
            name="Payment"
            component={PaymentScreen}
            options={{ title: 'Payment' }}
          />
          <Stack.Screen
            name="AncillarySales"
            component={AncillarySalesScreen}
            options={{ title: 'Ancillary Sales' }}
          />
          <Stack.Screen
            name="QueueManagement"
            component={QueueManagementScreen}
            options={{ title: 'Queue Management' }}
          />
          <Stack.Screen
            name="StandbyList"
            component={StandbyListScreen}
            options={{ title: 'Standby List' }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: 'Settings' }}
          />
          <Stack.Screen
            name="DeviceManagement"
            component={DeviceManagementScreen}
            options={{ title: 'Device Management' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
