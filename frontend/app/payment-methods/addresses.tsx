import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Plus, MapPin, CheckCircle2, Circle, X, Trash2 } from "lucide-react-native";
import { useBillingStore, BusinessAddress } from "@/store/useBillingStore";
import { PrimaryButton } from "@/components/PrimaryButton";

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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft color="#111827" size={20} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Business Addresses</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionCard}>
          {addresses.length === 0 ? (
            <Text style={styles.emptyText}>No business addresses saved yet.</Text>
          ) : (
            addresses.map((addr) => (
              <TouchableOpacity 
                key={addr.id} 
                style={styles.cardRow} 
                activeOpacity={0.7}
                onPress={() => openEditModal(addr)}
              >
                <View style={styles.cardRowLeft}>
                  <View style={styles.iconBox}>
                    <MapPin color="#111827" size={20} />
                  </View>
                  <View>
                    <Text style={styles.cardName}>{addr.title}</Text>
                    <Text style={styles.cardNumber}>{addr.address}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setDefaultAddress(addr.id)}>
                  {addr.isDefault ? (
                    <CheckCircle2 color="#111827" size={24} fill="#111827" />
                  ) : (
                    <Circle color="#D1D5DB" size={24} />
                  )}
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}

          <TouchableOpacity style={styles.addButton} activeOpacity={0.7} onPress={openAddModal}>
            <Plus color="#111827" size={20} />
            <Text style={styles.addText}>Add New Address</Text>
          </TouchableOpacity>
        </View>
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
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setIsModalVisible(false)} />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{editingId ? "Edit Address" : "Add Address"}</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <X color="#111827" size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Title (e.g. Headquarters)</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Headquarters"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Address</Text>
              <TextInput
                style={[styles.input, { height: 80 }]}
                value={addressLine}
                onChangeText={setAddressLine}
                placeholder="123 Kampala Road..."
                multiline
              />
            </View>

            <View style={styles.buttonRow}>
              {editingId && (
                <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                  <Trash2 color="#EF4444" size={20} />
                </TouchableOpacity>
              )}
              <PrimaryButton 
                title="Save Address" 
                onPress={handleSave} 
                disabled={!title || !addressLine}
                style={{ flex: 1 }}
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
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    gap: 8,
  },
  emptyText: {
    textAlign: "center",
    color: "#6B7280",
    paddingVertical: 24,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  cardRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
    paddingRight: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  cardName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  cardNumber: {
    fontSize: 14,
    color: "#6B7280",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 8,
    gap: 8,
  },
  addText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  bottomSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    fontSize: 16,
    color: "#111827",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  deleteButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
  },
});
