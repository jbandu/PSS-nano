import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { setAgent, setToken } from '@/store/slices/authSlice';
import { Agent } from '@/types';

// Placeholder screens - would implement these properly
const PassengerSearchScreen = () => <View><Text>Passenger Search</Text></View>;
const CheckInScreen = () => <View><Text>Check-In</Text></View>;
const SeatSelectionScreen = () => <View><Text>Seat Selection</Text></View>;
const BaggageProcessingScreen = () => <View><Text>Baggage Processing</Text></View>;
const APISCollectionScreen = () => <View><Text>APIS Collection</Text></View>;
const PaymentScreen = () => <View><Text>Payment</Text></View>;
const AncillarySalesScreen = () => <View><Text>Ancillary Sales</Text></View>;
const QueueManagementScreen = () => <View><Text>Queue Management</Text></View>;
const StandbyListScreen = () => <View><Text>Standby List</Text></View>;
const SettingsScreen = () => <View><Text>Settings</Text></View>;
const DeviceManagementScreen = () => <View><Text>Device Management</Text></View>;

const LoginScreen = () => {
  const dispatch = useDispatch();
  const [agentCode, setAgentCode] = useState('');
  const [password, setPassword] = useState('');
  const [stationCode, setStationCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!agentCode || !password || !stationCode) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      // Mock login - in production would call API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const agent: Agent = {
        id: '1',
        code: agentCode,
        name: 'Agent User',
        email: `${agentCode}@airline.com`,
        stationCode: stationCode.toUpperCase(),
        role: 'agent',
        permissions: ['check_in', 'baggage', 'payment'],
      };

      const token = 'mock_jwt_token';

      dispatch(setAgent(agent));
      dispatch(setToken(token));
    } catch (error) {
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Mobile Agent App</Text>
        <Text style={styles.subtitle}>Airport Check-In Operations</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Agent Code"
            value={agentCode}
            onChangeText={setAgentCode}
            autoCapitalize="characters"
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="Station Code (e.g., JFK)"
            value={stationCode}
            onChangeText={setStationCode}
            autoCapitalize="characters"
            maxLength={3}
            autoCorrect={false}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>Version 1.0.0</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0057B8',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E0E7FF',
    textAlign: 'center',
    marginBottom: 48,
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  button: {
    backgroundColor: '#0057B8',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    color: '#E0E7FF',
    textAlign: 'center',
    marginTop: 24,
    fontSize: 14,
  },
});

export default LoginScreen;

// Export placeholder screens
export {
  PassengerSearchScreen,
  CheckInScreen,
  SeatSelectionScreen,
  BaggageProcessingScreen,
  APISCollectionScreen,
  PaymentScreen,
  AncillarySalesScreen,
  QueueManagementScreen,
  StandbyListScreen,
  SettingsScreen,
  DeviceManagementScreen,
};
