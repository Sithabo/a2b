import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Check, Phone, Package } from 'lucide-react-native';

// Source: 7.html — "Payment Confirmed!"
export default function PaymentConfirmedScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* Green Check Circle */}
          <View style={styles.checkCircle}>
            <Check color="white" size={44} strokeWidth={3} />
          </View>

          {/* Title */}
          <Text style={styles.title}>Payment Confirmed!</Text>
          <Text style={styles.subtitle}>Your deposit is secured in escrow</Text>

          {/* Amount Deposited Box */}
          <View style={styles.amountBox}>
            <Text style={styles.amountLabel}>Amount Deposited</Text>
            <Text style={styles.amountValue}>150,000</Text>
            <View style={styles.paymentViaRow}>
              <Text style={styles.paymentViaText}>via MTN Mobile Money</Text>
            </View>
          </View>

          {/* Driver Unlocked Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Driver details have been unlocked and they are heading to pickup. You will receive
              updates as they progress through the delivery.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.callButton}
              onPress={() => console.log('Call Driver')}
              activeOpacity={0.85}
            >
              <Phone color="white" size={20} />
              <Text style={styles.callButtonText}>Call Driver</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shipmentsButton}
              onPress={() => router.replace('/receipts')}
              activeOpacity={0.85}
            >
              <Package color="#0F3D26" size={20} />
              <Text style={styles.shipmentsButtonText}>See Pending Shipments</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 20,
    shadowColor: '#0F3D26',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 6,
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0F3D26',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F3D26',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F3D26',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: -8,
  },
  amountBox: {
    width: '100%',
    backgroundColor: '#F0F0E6',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#0F3D26',
    marginBottom: 4,
  },
  paymentViaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  paymentViaText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#FFFBF0',
    borderWidth: 1,
    borderColor: '#FDE6C8',
    borderRadius: 12,
    padding: 16,
  },
  infoText: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 20,
    textAlign: 'center',
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
  },
  callButton: {
    width: '100%',
    backgroundColor: '#0F3D26',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#0F3D26',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  callButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  shipmentsButton: {
    width: '100%',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#0F3D26',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  shipmentsButtonText: {
    color: '#0F3D26',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
