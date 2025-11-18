import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const agent = useSelector((state: RootState) => state.auth.agent);
  const checkInStats = useSelector((state: RootState) => state.checkIn);
  const isOnline = useSelector((state: RootState) => state.offline.isOnline);

  const menuItems = [
    {
      title: 'Passenger Search',
      subtitle: 'Quick check-in',
      screen: 'PassengerSearch',
      icon: '🔍',
    },
    {
      title: 'Queue Management',
      subtitle: 'Manage passenger queue',
      screen: 'QueueManagement',
      icon: '📋',
    },
    {
      title: 'Device Management',
      subtitle: 'Connect hardware',
      screen: 'DeviceManagement',
      icon: '🔌',
    },
    {
      title: 'Settings',
      subtitle: 'App configuration',
      screen: 'Settings',
      icon: '⚙️',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0057B8" />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Agent Info */}
        <View style={styles.agentCard}>
          <Text style={styles.greeting}>Hello, {agent?.name}!</Text>
          <Text style={styles.station}>
            {agent?.stationCode} - {agent?.counterNumber || 'Roaming'}
          </Text>
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: isOnline ? '#10B981' : '#EF4444' }]} />
            <Text style={styles.statusText}>{isOnline ? 'Online' : 'Offline'}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{checkInStats.completedToday}</Text>
            <Text style={styles.statLabel}>Check-ins</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{checkInStats.passengersProcessedToday}</Text>
            <Text style={styles.statLabel}>Passengers</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {Math.round(checkInStats.averageCheckInTime)}s
            </Text>
            <Text style={styles.statLabel}>Avg Time</Text>
          </View>
        </View>

        {/* Active Transactions */}
        {checkInStats.activeTransactions.length > 0 && (
          <View style={styles.activeSection}>
            <Text style={styles.sectionTitle}>Active Transactions</Text>
            {checkInStats.activeTransactions.map((transaction) => (
              <TouchableOpacity
                key={transaction.id}
                style={styles.transactionCard}
                onPress={() => navigation.navigate('CheckIn', { transactionId: transaction.id })}
              >
                <Text style={styles.transactionPNR}>{transaction.pnrLocator}</Text>
                <Text style={styles.transactionInfo}>
                  {transaction.totalPassengers} passenger(s)
                </Text>
                <Text style={styles.transactionStatus}>{transaction.status}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.menuGrid}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuCard}
              onPress={() => navigation.navigate(item.screen)}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Offline Notice */}
        {!isOnline && (
          <View style={styles.offlineNotice}>
            <Text style={styles.offlineText}>
              🔄 Operating in offline mode. Transactions will sync when online.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 16,
  },
  agentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  station: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0057B8',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  activeSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  transactionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#0057B8',
  },
  transactionPNR: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  transactionInfo: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  transactionStatus: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  offlineNotice: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  offlineText: {
    fontSize: 14,
    color: '#92400E',
  },
});

export default HomeScreen;
