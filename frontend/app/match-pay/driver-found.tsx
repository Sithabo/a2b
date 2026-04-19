import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Truck, AlertCircle, ShieldCheck, ArrowRight } from 'lucide-react-native';

// Source: 5.html — "Driver Accepted & Deposit"
export default function DriverFoundScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Status bar spacer */}
      <View style={styles.statusBarSpacer} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          {/* Truck Icon Header */}
          <View style={styles.iconCircle}>
            <Truck color="white" size={32} />
          </View>

          {/* Title */}
          <Text style={styles.title}>Driver Accepted!</Text>
          <Text style={styles.subtitle}>
            A verified driver is ready to pick up your load
          </Text>

          {/* Action Required Banner */}
          <View style={styles.alertBanner}>
            <AlertCircle color="#c2410c" size={20} style={{ marginTop: 2 }} />
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Action Required</Text>
              <Text style={styles.alertText}>
                Deposit funds to unlock driver details and confirm pickup
              </Text>
            </View>
          </View>

          {/* Amount to Deposit */}
          <View style={styles.amountBox}>
            <Text style={styles.amountLabel}>Amount to Deposit</Text>
            <Text style={styles.amountValue}>150,000</Text>
            <Text style={styles.amountCurrency}>UGX</Text>
          </View>

          {/* Escrow Note */}
          <View style={styles.escrowBadge}>
            <ShieldCheck color="#6B7280" size={16} />
            <Text style={styles.escrowText}>
              <Text style={styles.escrowBold}>Escrow Protection: </Text>
              Money is held safely. Driver only gets paid upon confirmed delivery.
            </Text>
          </View>

          {/* Primary CTA */}
          <TouchableOpacity
            style={styles.depositButton}
            onPress={() => router.push('/match-pay/payment')}
            activeOpacity={0.85}
          >
            <Text style={styles.depositButtonText}>Deposit 150,000 UGX to Unlock Driver</Text>
          </TouchableOpacity>

          {/* Secondary cancel link */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.cancelLink}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelText}>Cancel & Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBarSpacer: {
    height: 48,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
    paddingTop: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
    gap: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0F3D26',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F3D26',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 20,
  },
  alertBanner: {
    width: '100%',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9a3412',
    marginBottom: 4,
  },
  alertText: {
    fontSize: 12,
    color: '#c2410c',
    lineHeight: 18,
  },
  amountBox: {
    width: '100%',
    backgroundColor: '#F5F5E9',
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0F3D26',
  },
  amountCurrency: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 4,
  },
  escrowBadge: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  escrowText: {
    flex: 1,
    fontSize: 10,
    color: '#6B7280',
    lineHeight: 16,
  },
  escrowBold: {
    fontWeight: 'bold',
  },
  depositButton: {
    width: '100%',
    backgroundColor: '#0F3D26',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F3D26',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  depositButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  cancelLink: {
    paddingBottom: 8,
  },
  cancelText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    textDecorationLine: 'underline',
  },
});
