import React, { useState } from "react";
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  MoreVertical,
  Plus,
  MapPin,
  CheckCircle2,
  Circle,
} from "lucide-react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useBillingStore, type SavedCard } from "@/store/useBillingStore";
import { CreditCardInput, CreditCardView, type CreditCardFormData, type CreditCardFormField } from "react-native-credit-card-input";
import {
  Button,
  Card,
  colors,
  elevation,
  IconButton,
  layout,
  ListItem,
  ListSection,
  partnerColors,
  radius,
  ScreenHeader,
  spacing,
  Text,
  typography,
} from "@a2b/ui";

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const { cards, addresses, addCard, updateCard, setDefaultCard } =
    useBillingStore();
  const insets = useSafeAreaInsets();

  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [cardFormData, setCardFormData] = useState<CreditCardFormData | null>(null);
  const [focusedField, setFocusedField] = useState<CreditCardFormField>();

  const openAddModal = () => {
    setEditingCardId(null);
    setCardFormData(null);
    setFocusedField(undefined);
    setIsModalVisible(true);
  };

  // Card details aren't kept on the phone, so "editing" means entering the card again.
  const openEditModal = (card: SavedCard) => {
    setEditingCardId(card.id);
    setCardFormData(null);
    setFocusedField(undefined);
    setIsModalVisible(true);
  };

  const handleSaveCard = () => {
    if (!cardFormData || !cardFormData.valid) return;

    // Only what the list displays. Never persist the full number or the CVC.
    const newCardData = {
      brand: cardFormData.values.type,
      last4: cardFormData.values.number.replace(/\D/g, "").slice(-4),
      expiry: cardFormData.values.expiry,
      isDefault: cards.length === 0,
    };

    if (editingCardId) {
      updateCard(editingCardId, newCardData);
    } else {
      addCard(newCardData);
    }

    setIsModalVisible(false);

    // If it's a new card, show status
    if (!editingCardId) {
      router.push({
        pathname: "/payment-methods/status",
        params: { state: "confirmed" },
      });
    }
  };

  const getCardIcon = (type: string) => {
    switch (type) {
      case "master-card":
      case "mastercard":
        return <FontAwesome5 name="cc-mastercard" size={24} color={partnerColors.mastercard} />;
      case "visa":
        return <FontAwesome5 name="cc-visa" size={24} color={partnerColors.visa} />;
      case "american-express":
      case "amex":
        return <FontAwesome5 name="cc-amex" size={24} color={partnerColors.amex} />;
      case "discover":
        return <FontAwesome5 name="cc-discover" size={24} color={partnerColors.discover} />;
      default:
        return <FontAwesome5 name="credit-card" size={24} color={colors.text} />;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <ScreenHeader
        title="Payment Method"
        onBackPress={() => router.back()}
        rightElement={
          // No menu actions yet
          <IconButton icon={MoreVertical} accessibilityLabel="More options" onPress={() => {}} />
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Cards List */}
        <Card padding="lg" style={styles.sectionCard}>
          {cards.map((card) => {
            const cardName = card.brand
              ? card.brand.charAt(0).toUpperCase() + card.brand.slice(1).replace("-", " ")
              : "Credit Card";
            return (
              <Pressable
                key={card.id}
                accessibilityRole="button"
                accessibilityLabel={`${cardName} ending in ${card.last4}`}
                accessibilityHint="Replace this card"
                style={({ pressed }) => [styles.cardRow, pressed && styles.pressed]}
                onPress={() => openEditModal(card)}
              >
                <View style={styles.cardRowLeft}>
                  <View style={styles.cardIconBox}>{getCardIcon(card.brand ?? "")}</View>
                  <View style={styles.cardText}>
                    <Text variant="bodyStrong">{cardName}</Text>
                    <Text variant="bodySm" tone="muted">
                      ******** {card.last4}
                    </Text>
                  </View>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Set as default card"
                  accessibilityState={{ selected: card.isDefault }}
                  hitSlop={spacing.md}
                  style={({ pressed }) => pressed && styles.pressed}
                  onPress={() => setDefaultCard(card.id)}
                >
                  {card.isDefault ? (
                    <CheckCircle2 color={colors.onPrimary} size={24} fill={colors.primary} />
                  ) : (
                    <Circle color={colors.borderStrong} size={24} />
                  )}
                </Pressable>
              </Pressable>
            );
          })}

          <Button
            title="Add Payment Method"
            icon={Plus}
            variant="secondary"
            onPress={openAddModal}
            style={styles.addPaymentButton}
          />
        </Card>

        <ListSection title="Business Address">
          <ListItem
            icon={MapPin}
            title={defaultAddress ? defaultAddress.title : "No Address Set"}
            subtitle={defaultAddress ? defaultAddress.address : "Tap to add"}
            onPress={() => router.push("/payment-methods/addresses")}
          />
        </ListSection>
      </ScrollView>

      {/* Add/Edit Card Bottom Sheet */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <Pressable
            style={styles.modalBackdrop}
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={() => setIsModalVisible(false)}
          />
          <View style={[styles.bottomSheet, { paddingBottom: insets.bottom > 0 ? insets.bottom + spacing.md : spacing['2xl'] }]}>
            <View style={styles.dragIndicator} />
            <View style={styles.sheetHeader}>
              <Text variant="h2" align="center">
                {editingCardId ? "Replace Card" : "Add Card"}
              </Text>
            </View>

            <ScrollView
              contentContainerStyle={styles.sheetScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <CreditCardView
                focusedField={focusedField}
                type={cardFormData?.values?.type}
                number={cardFormData?.values?.number}
                expiry={cardFormData?.values?.expiry}
                cvc={cardFormData?.values?.cvc}
                style={styles.cardPreview}
              />

              <CreditCardInput
                autoFocus
                onChange={setCardFormData}
                onFocusField={setFocusedField}
                inputStyle={styles.ccInput}
                labelStyle={styles.ccLabel}
                placeholderColor={colors.textPlaceholder}
              />

              <Button
                title={editingCardId ? "Save Changes" : "Save Card"}
                onPress={handleSaveCard}
                style={styles.saveButton}
                disabled={!cardFormData?.valid}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: layout.gutter,
    paddingTop: spacing.md,
    paddingBottom: spacing['4xl'],
    gap: spacing['2xl'],
  },
  pressed: {
    opacity: 0.85,
  },
  sectionCard: {
    gap: spacing.sm,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },
  cardRowLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
  },
  cardText: {
    gap: spacing.xs,
  },
  cardIconBox: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  addPaymentButton: {
    marginTop: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  bottomSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    padding: spacing['2xl'],
    maxHeight: "90%",
    ...elevation.md,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    alignSelf: "center",
    marginBottom: spacing.lg,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing['2xl'],
  },
  sheetScrollContent: {
    paddingBottom: spacing.xl,
  },
  cardPreview: {
    alignSelf: "center",
    marginBottom: spacing['2xl'],
  },
  ccInput: {
    height: 48,
    ...typography.body,
    color: colors.text,
  },
  ccLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  saveButton: {
    marginTop: spacing['2xl'],
  },
});
