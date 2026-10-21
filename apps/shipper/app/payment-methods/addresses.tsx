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
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Plus, MapPin, CheckCircle2, Circle, X, Trash2 } from "lucide-react-native";
import { useBillingStore, BusinessAddress } from "@/store/useBillingStore";
import {
  Button,
  Card,
  colors,
  elevation,
  IconButton,
  layout,
  radius,
  ScreenHeader,
  spacing,
  Text,
  TextField,
} from "@a2b/ui";

export default function AddressesScreen() {
  const router = useRouter();
  const { addresses, addAddress, updateAddress, removeAddress, setDefaultAddress } = useBillingStore();
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [addressLine, setAddressLine] = useState("");

  const openAddModal = () => {
    setEditingId(null);
    setTitle("");
    setAddressLine("");
    setIsModalVisible(true);
  };

  const openEditModal = (addr: BusinessAddress) => {
    setEditingId(addr.id);
    setTitle(addr.title);
    setAddressLine(addr.address);
    setIsModalVisible(true);
  };

  const handleSave = () => {
    if (!title || !addressLine) return;
    
    if (editingId) {
      updateAddress(editingId, { title, address: addressLine });
    } else {
      addAddress({ title, address: addressLine, isDefault: false });
    }
    
    setIsModalVisible(false);
  };

  const handleDelete = () => {
    if (editingId) {
      removeAddress(editingId);
      setIsModalVisible(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <ScreenHeader title="Business Addresses" onBackPress={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Card padding="lg" style={styles.sectionCard}>
          {addresses.length === 0 ? (
            <Text tone="muted" align="center" style={styles.emptyText}>
              No business addresses saved yet.
            </Text>
          ) : (
            addresses.map((addr) => (
              <Pressable
                key={addr.id}
                accessibilityRole="button"
                accessibilityLabel={`${addr.title}, ${addr.address}`}
                accessibilityHint="Edit this address"
                style={({ pressed }) => [styles.cardRow, pressed && styles.pressed]}
                onPress={() => openEditModal(addr)}
              >
                <View style={styles.cardRowLeft}>
                  <View style={styles.iconBox}>
                    <MapPin color={colors.text} size={20} />
                  </View>
                  <View style={styles.cardText}>
                    <Text variant="bodyStrong">{addr.title}</Text>
                    <Text variant="bodySm" tone="muted">{addr.address}</Text>
                  </View>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Set as default address"
                  accessibilityState={{ selected: addr.isDefault }}
                  hitSlop={spacing.md}
                  style={({ pressed }) => pressed && styles.pressed}
                  onPress={() => setDefaultAddress(addr.id)}
                >
                  {addr.isDefault ? (
                    <CheckCircle2 color={colors.onPrimary} size={24} fill={colors.primary} />
                  ) : (
                    <Circle color={colors.borderStrong} size={24} />
                  )}
                </Pressable>
              </Pressable>
            ))
          )}

          <Button
            title="Add New Address"
            icon={Plus}
            variant="secondary"
            onPress={openAddModal}
            style={styles.addButton}
          />
        </Card>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <Pressable
            style={styles.modalBackdrop}
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={() => setIsModalVisible(false)}
          />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text variant="h2">{editingId ? "Edit Address" : "Add Address"}</Text>
              <IconButton icon={X} variant="plain" accessibilityLabel="Close" onPress={() => setIsModalVisible(false)} />
            </View>

            <View style={styles.formGroup}>
              <TextField
                label="Title (e.g. Headquarters)"
                value={title}
                onChangeText={setTitle}
                placeholder="Headquarters"
              />
            </View>

            <View style={styles.formGroup}>
              <TextField
                label="Full Address"
                style={styles.multilineInput}
                value={addressLine}
                onChangeText={setAddressLine}
                placeholder="123 Kampala Road..."
                multiline
              />
            </View>

            <View style={styles.buttonRow}>
              {editingId && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Delete address"
                  style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
                  onPress={handleDelete}
                >
                  <Trash2 color={colors.danger} size={20} />
                </Pressable>
              )}
              <Button 
                title="Save Address" 
                onPress={handleSave} 
                disabled={!title || !addressLine}
                style={styles.saveButton}
              />
            </View>
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
  },
  pressed: {
    opacity: 0.85,
  },
  sectionCard: {
    gap: spacing.sm,
  },
  emptyText: {
    paddingVertical: spacing['2xl'],
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },
  cardRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    flex: 1,
    paddingRight: spacing.lg,
  },
  cardText: {
    flex: 1,
    gap: spacing.xs,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  addButton: {
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
    paddingBottom: Platform.OS === 'ios' ? spacing['4xl'] : spacing['2xl'],
    ...elevation.md,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing['2xl'],
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  multilineInput: {
    height: 80,
  },
  buttonRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  deleteButton: {
    width: layout.touchLg,
    height: layout.touchLg,
    borderRadius: radius.md,
    backgroundColor: colors.dangerMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButton: {
    flex: 1,
  },
});
