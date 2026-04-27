import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, MoreVertical, Plus, MapPin, ChevronRight, CheckCircle2, Circle, X } from "lucide-react-native";
import { FontAwesome5 } from '@expo/vector-icons';
import { useBillingStore, CreditCard } from "@/store/useBillingStore";
import { CreditCardInput } from "react-native-credit-card-input";
import { PrimaryButton } from "@/components/PrimaryButton";

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const { cards, addresses, addCard, updateCard, setDefaultCard } = useBillingStore();
  
  const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [cardFormData, setCardFormData] = useState<any>(null);

  const openAddModal = () => {
    setEditingCardId(null);
    setCardFormData(null);
    setIsModalVisible(true);
  };

  const openEditModal = (card: CreditCard) => {
    setEditingCardId(card.id);
    setCardFormData({ valid: true, values: { number: card.number, expiry: card.expiry, cvc: card.cvc, name: card.name, type: card.type } });
    setIsModalVisible(true);
  };

  const handleSaveCard = () => {
    if (!cardFormData || !cardFormData.valid) return;
    
    const newCardData = {
      name: cardFormData.values.name || "Cardholder",
      number: cardFormData.values.number,
      expiry: cardFormData.values.expiry,
      cvc: cardFormData.values.cvc,
      type: cardFormData.values.type,
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
      router.push({ pathname: "/payment-methods/status", params: { state: "confirmed" } });
    }
  };

  const getCardIcon = (type: string) => {
    switch(type) {
      case 'master-card':
      case 'mastercard': return <FontAwesome5 name="cc-mastercard" size={24} color="#EB001B" />;
      case 'visa': return <FontAwesome5 name="cc-visa" size={24} color="#1A1F71" />;
      case 'american-express':
      case 'amex': return <FontAwesome5 name="cc-amex" size={24} color="#002663" />;
      case 'discover': return <FontAwesome5 name="cc-discover" size={24} color="#FF6000" />;
      default: return <FontAwesome5 name="credit-card" size={24} color="#111827" />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft color="#111827" size={20} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Method</Text>
        <TouchableOpacity style={styles.headerButton} activeOpacity={0.7}>
          <MoreVertical color="#111827" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Cards List */}
        <View style={styles.sectionCard}>
          {cards.map((card) => (
            <TouchableOpacity 
              key={card.id} 
              style={styles.cardRow} 
              activeOpacity={0.7}
              onPress={() => openEditModal(card)}
            >
              <View style={styles.cardRowLeft}>
                <View style={styles.cardIconBox}>
                  {getCardIcon(card.type)}
                </View>
                <View>
                  <Text style={styles.cardName}>
                    {card.type ? card.type.charAt(0).toUpperCase() + card.type.slice(1).replace('-', ' ') : 'Credit Card'}
                  </Text>
                  <Text style={styles.cardNumber}>
                    ******** {card.number.slice(-4)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setDefaultCard(card.id)}>
                {card.isDefault ? (
                  <CheckCircle2 color="#111827" size={24} fill="#111827" />
                ) : (
                  <Circle color="#D1D5DB" size={24} />
                )}
              </TouchableOpacity>
            </TouchableOpacity>
          ))}

          {/* Add Payment Button */}
          <TouchableOpacity style={styles.addPaymentButton} activeOpacity={0.7} onPress={openAddModal}>
            <Plus color="#111827" size={20} />
            <Text style={styles.addPaymentText}>Add Payment Method</Text>
          </TouchableOpacity>
        </View>

        {/* Business Address */}
        <View style={styles.addressSection}>
          <Text style={styles.sectionTitle}>Business Address</Text>
          <TouchableOpacity 
            style={styles.addressCard} 
            activeOpacity={0.7}
            onPress={() => router.push("/payment-methods/addresses")}
          >
            <View style={styles.cardRowLeft}>
              <View style={styles.addressIconBox}>
                <MapPin color="#111827" size={20} />
              </View>
              <View>
                {defaultAddress ? (
                  <>
                    <Text style={styles.cardName}>{defaultAddress.title}</Text>
                    <Text style={styles.cardNumber}>{defaultAddress.address}</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.cardName}>No Address Set</Text>
                    <Text style={styles.cardNumber}>Tap to add</Text>
                  </>
                )}
              </View>
            </View>
            <ChevronRight color="#9CA3AF" size={20} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Add/Edit Card Bottom Sheet */}
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
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1} 
            onPress={() => setIsModalVisible(false)} 
          />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{editingCardId ? "Edit Card" : "Add Card"}</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <X color="#111827" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
              <CreditCardInput 
                autoFocus 
                requiresName 
                requiresCVC 
                allowScroll 
                onChange={setCardFormData}
                inputContainerStyle={styles.ccInputContainer}
                inputStyle={styles.ccInput}
                labelStyle={styles.ccLabel}
                validColor="#0F3D26"
                invalidColor="#EF4444"
                placeholderColor="#9CA3AF"
              />

              <PrimaryButton 
                title={editingCardId ? "Save Changes" : "Save Card"} 
                onPress={handleSaveCard}
                style={{ marginTop: 24 }}
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
    gap: 24,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    gap: 8,
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
  },
  cardIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
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
  addPaymentButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 8,
    gap: 8,
  },
  addPaymentText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  addressSection: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginLeft: 8,
  },
  addressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  addressIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
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
    maxHeight: '90%',
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    position: 'relative',
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  ccInputContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    paddingHorizontal: 8,
  },
  ccInput: {
    height: 48,
    fontSize: 16,
    color: "#111827",
  },
  ccLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 4,
  },
});
