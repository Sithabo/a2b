import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, Lock, CreditCard } from 'lucide-react-native';
import { colors, palette, partnerColors } from "@a2b/ui";
import { useMarket } from "@/store/useMarket";
import { formatMoney } from "@a2b/core";

type PaymentMethod = 'mtn' | 'airtel' | 'mmg' | 'card' | null;

// Source: 6.html — "Choose Payment Method"
export default function PaymentMethodScreen() {
  const router = useRouter();
  const market = useMarket();
  const [selected, setSelected] = useState<PaymentMethod>(null);

  const handleSelect = (method: PaymentMethod) => {
    setSelected(method);
    // Small delay to show selected state then navigate
    setTimeout(() => {
      router.push('/match-pay/confirmed');
    }, 300);
  };

  const allMethods = [
    {
      id: 'mmg' as PaymentMethod,
      label: 'MMG Mobile Money',
      subtitle: 'Fast and secure',
      logoBg: palette.gray[800],
      logoText: 'MMG',
      logoTextColor: palette.white,
    },
    {
      id: 'mtn' as PaymentMethod,
      label: 'MTN Mobile Money',
      subtitle: 'Fast and secure',
      logoBg: partnerColors.mtn,
      logoText: 'MTN',
      logoTextColor: palette.black,
    },
    {
      id: 'airtel' as PaymentMethod,
      label: 'Airtel Money',
      subtitle: 'Quick transactions',
      logoText: 'Airtel',
      logoTextColor: palette.white,
      logoTextFontSize: 11,
      logoTextFontWeight: 'bold' as const,
      logoBg: partnerColors.airtel,
    },
    {
      id: 'card' as PaymentMethod,
      label: 'Debit/Credit Card',
      subtitle: 'Visa, Mastercard',
      logoBg: palette.gray[800],
      logoText: null,
      logoIcon: true,
    },
  ];
  // Mobile money rails available in this market, plus cards everywhere.
  const methods = allMethods.filter(
    (m) => m.id === 'card' || market.mobileMoney.some((p) => p.id === m.id)
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Choose Payment Method</Text>
        <Text style={styles.headerSubtitle}>Select how you want to pay the driver</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Amount Card */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Amount to Pay Driver</Text>
          <Text style={styles.amountValue}>{formatMoney(150000, market, { code: false })}</Text>
          <Text style={styles.amountCurrency}>{market.currency.code}</Text>
        </View>

        {/* Payment Method Rows */}
        <View style={styles.methodsList}>
          {methods.map((method) => {
            const isSelected = selected === method.id;
            return (
              <TouchableOpacity
                key={method.id}
                style={[styles.methodRow, isSelected && styles.methodRowSelected]}
                onPress={() => handleSelect(method.id)}
                activeOpacity={0.75}
              >
                {/* Logo/Icon */}
                <View style={[styles.methodLogo, { backgroundColor: method.logoBg }]}>
                  {method.logoIcon ? (
                    <CreditCard color="white" size={26} />
                  ) : (
                    <Text
                      style={[
                        styles.methodLogoText,
                        { color: method.logoTextColor, fontSize: method.logoTextFontSize ?? 13 },
                      ]}
                    >
                      {method.logoText}
                    </Text>
                  )}
                </View>

                {/* Text */}
                <View style={styles.methodTextContainer}>
                  <Text style={styles.methodLabel}>{method.label}</Text>
                  <Text style={styles.methodSubtitle}>{method.subtitle}</Text>
                </View>

                <ChevronRight color={palette.gray[400]} size={20} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Escrow Footer Note */}
        <View style={styles.escrowNote}>
          <Lock color={colors.primary} size={14} />
          <Text style={styles.escrowNoteText}>Payments are secured by Escrow Protection</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 56,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: palette.gray[500],
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 60,
    gap: 24,
  },
  amountCard: {
    backgroundColor: palette.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.gray[100],
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: palette.gray[500],
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: -0.5,
  },
  amountCurrency: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.gray[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  methodsList: {
    gap: 12,
  },
  methodRow: {
    width: '100%',
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.gray[200],
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  methodRowSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  methodLogo: {
    width: 56,
    height: 56,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  methodLogoText: {
    fontWeight: 'bold',
  },
  methodTextContainer: {
    flex: 1,
  },
  methodLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: palette.gray[800],
    marginBottom: 2,
  },
  methodSubtitle: {
    fontSize: 12,
    color: palette.gray[500],
  },
  escrowNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    opacity: 0.8,
  },
  escrowNoteText: {
    fontSize: 12,
    color: palette.gray[500],
  },
});
