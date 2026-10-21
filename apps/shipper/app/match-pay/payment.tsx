import React, { useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronRight, Lock, CreditCard } from 'lucide-react-native';
import { Card, Text, colors, layout, palette, partnerColors, radius, spacing } from "@a2b/ui";
import { useMarket } from "@/store/useMarket";
import { formatMoney, isPaymentMethodAvailable, paymentMethods, type PaymentMethod } from "@a2b/core";
import { apiErrorMessage } from "@a2b/api-client";
import { api } from "@/lib/session";
import { parseLoadId, useInvalidateLoads, useShipment } from "@/lib/loads";
import { LoadState } from "@/components/LoadState";


// Source: 6.html — "Choose Payment Method"
export default function PaymentMethodScreen() {
  const router = useRouter();
  const market = useMarket();
  const [selected, setSelected] = useState<PaymentMethod | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const { trackingId } = useLocalSearchParams<{ trackingId: string }>();
  const loadId = parseLoadId(trackingId);
  const { data: shipment, error, refetch } = useShipment(loadId);
  const invalidateLoads = useInvalidateLoads();

  const handleSelect = async (method: PaymentMethod) => {
    if (!loadId || isPaying) return;
    setSelected(method);
    setIsPaying(true);
    try {
      await api.escrow.deposit({ params: { id: loadId }, body: { method } });
      await invalidateLoads();
      router.replace({ pathname: '/match-pay/confirmed', params: { trackingId: String(loadId), method } });
    } catch (err) {
      setSelected(null);
      Alert.alert('Payment not completed', apiErrorMessage(err));
    } finally {
      setIsPaying(false);
    }
  };

  const allMethods = [
    {
      id: 'mmg' as const,
      label: paymentMethods.mmg.label,
      subtitle: 'Fast and secure',
      logoBg: palette.gray[800],
      logoText: 'MMG',
      logoTextColor: palette.white,
    },
    {
      id: 'mtn' as const,
      label: paymentMethods.mtn.label,
      subtitle: 'Fast and secure',
      logoBg: partnerColors.mtn,
      logoText: 'MTN',
      logoTextColor: palette.black,
    },
    {
      id: 'airtel' as const,
      label: paymentMethods.airtel.label,
      subtitle: 'Quick transactions',
      logoText: 'Airtel',
      logoTextColor: palette.white,
      logoBg: partnerColors.airtel,
    },
    {
      id: 'card' as const,
      label: paymentMethods.card.label,
      subtitle: 'Visa, Mastercard',
      logoBg: palette.gray[800],
      logoText: null,
      logoIcon: true,
    },
  ];
  const methods = allMethods.filter((m) => isPaymentMethodAvailable(m.id, market));

  if (!shipment) return <LoadState error={error} onRetry={refetch} />;
  const amount = shipment.escrow?.amount ?? shipment.offerPrice;

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="h1" tone="primary" style={styles.headerTitle}>Choose Payment Method</Text>
        <Text variant="bodySm" tone="muted">Select how you want to pay the driver</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Amount Card */}
        <Card padding="2xl" style={styles.amountCard}>
          <Text variant="bodySm" tone="muted" style={styles.amountLabel}>Amount to Pay Driver</Text>
          <Text variant="display" tone="primary">{formatMoney(amount, market, { code: false })}</Text>
          <Text variant="label" tone="muted" style={styles.amountCurrency}>{market.currency.code}</Text>
        </Card>

        {/* Payment Method Rows */}
        <View style={styles.methodsList}>
          {methods.map((method) => {
            const isSelected = selected === method.id;
            return (
              <Pressable
                key={method.id}
                accessibilityRole="button"
                accessibilityLabel={`Pay with ${method.label}, ${method.subtitle}`}
                accessibilityState={{ selected: isSelected, busy: isPaying && isSelected }}
                style={({ pressed }) => [
                  styles.methodRow,
                  isSelected && styles.methodRowSelected,
                  pressed && styles.pressed,
                ]}
                onPress={() => handleSelect(method.id)}
              >
                {/* Logo/Icon */}
                <View style={[styles.methodLogo, { backgroundColor: method.logoBg }]}>
                  {method.logoIcon ? (
                    <CreditCard color={colors.textInverse} size={26} />
                  ) : (
                    <Text variant="label" color={method.logoTextColor} style={styles.methodLogoText}>
                      {method.logoText}
                    </Text>
                  )}
                </View>

                {/* Text */}
                <View style={styles.methodTextContainer}>
                  <Text variant="bodyStrong" style={styles.methodLabel}>{method.label}</Text>
                  <Text variant="caption" tone="muted">{method.subtitle}</Text>
                </View>

                {isPaying && isSelected ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <ChevronRight color={colors.textMuted} size={20} />
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Escrow Footer Note */}
        <View style={styles.escrowNote}>
          <Lock color={colors.primary} size={14} />
          <Text variant="caption" tone="muted">Payments are secured by Escrow Protection</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: spacing.lg,
    paddingBottom: spacing['2xl'],
    paddingHorizontal: spacing['2xl'],
  },
  headerTitle: {
    marginBottom: spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['4xl'],
    gap: spacing['2xl'],
  },
  amountCard: {
    alignItems: 'center',
  },
  amountLabel: {
    marginBottom: spacing.sm,
  },
  amountCurrency: {
    marginTop: spacing.xs,
  },
  methodsList: {
    gap: spacing.md,
  },
  methodRow: {
    width: '100%',
    minHeight: layout.touchMin,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodRowSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  pressed: {
    opacity: 0.85,
  },
  methodLogo: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  methodLogoText: {
    // Partner names keep their own casing ("Airtel").
    textTransform: 'none',
  },
  methodTextContainer: {
    flex: 1,
  },
  methodLabel: {
    marginBottom: spacing.xxs,
  },
  escrowNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    opacity: 0.8,
  },
});
