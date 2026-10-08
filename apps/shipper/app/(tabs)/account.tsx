import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Switch,
  LayoutAnimation,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/useAuthStore";
import { useMarket } from "@/store/useMarket";
import { isValidTaxId } from "@a2b/core";
import { apiErrorMessage } from "@a2b/api-client";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  Pencil,
  User,
  Building2,
  CreditCard,
  Globe,
  Bell,
  HelpCircle,
  MessageCircle,
  Info,
  PhoneCall,
  LogOut,
  ChevronRight,
  AlertCircle,
  X,
  CheckCircle,
} from "lucide-react-native";
import { colors, palette } from "@a2b/ui";

export default function AccountScreen() {
  const router = useRouter();
  const { userProfile, logout, setUser, setProfileImage } = useAuthStore();
  const market = useMarket();
  const tinErrorMessage = `Valid ${market.taxId.hint} ${market.taxId.issuer} Tax Identification Number required to bypass customs processing constraints.`;
  const insets = useSafeAreaInsets();
  
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editCompany, setEditCompany] = useState("");
  const [editRegion, setEditRegion] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editProfileImage, setEditProfileImage] = useState<string | null>(null);
  const [editIsImporter, setEditIsImporter] = useState(false);
  const [editTin, setEditTin] = useState("");
  const [tinError, setTinError] = useState("");

  const handleLogout = async () => {
    await api.auth.logout({}).catch(() => {}); // revoke the token server-side when online
    await logout();
    router.replace("/(auth)/login");
  };

  const openEditModal = () => {
    setEditCompany(userProfile?.company || "");
    setEditRegion(userProfile?.region || "");
    setEditEmail(userProfile?.email || "");
    setEditProfileImage(userProfile?.profileImage || null);
    setEditIsImporter(userProfile?.is_importer || false);
    setEditTin(userProfile?.tin || "");
    setTinError("");
    setIsEditModalVisible(true);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setEditProfileImage(result.assets[0].uri);
    }
  };

  const handleSaveProfile = async () => {
    if (editIsImporter) {
      if (!isValidTaxId(editTin, market)) {
        setTinError(tinErrorMessage);
        return;
      }
    }
    setIsSaving(true);
    try {
      await api.me.upsertShipperProfile({
        body: {
          companyName: editCompany,
          region: editRegion || null,
          isImporter: editIsImporter,
          taxId: editIsImporter ? editTin : null,
        },
      });
      // Keep the account name in sync with the company name for shippers.
      const { data } = await api.me.update({
        body: { fullName: editCompany, ...(editEmail.trim() ? { email: editEmail.trim() } : {}) },
      });
      const { data: me } = await api.me.show({});
      setUser({ ...data, ...me });
      setProfileImage(editProfileImage || undefined); // avatar stays on-device until uploads exist
      setIsEditModalVisible(false);
    } catch (err) {
      Alert.alert("Couldn't save", apiErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft color={colors.primary} size={20} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Account</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Warning Banner */}
        {!userProfile?.email && (
          <View style={styles.warningBanner}>
            <AlertCircle color={palette.amber[700]} size={20} />
            <Text style={styles.warningText}>
              Please add your email address to secure your account.
            </Text>
          </View>
        )}

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileLeft}>
            {userProfile?.profileImage ? (
              <Image
                source={{ uri: userProfile.profileImage }}
                style={styles.avatarImage}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.avatarImage, { alignItems: "center", justifyContent: "center" }]}>
                <User color={palette.gray[400]} size={32} />
              </View>
            )}
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {userProfile?.company || userProfile?.name || "John Musa"}
              </Text>
              {userProfile?.email ? (
                <Text style={styles.profileEmail}>{userProfile.email}</Text>
              ) : (
                <Text style={[styles.profileEmail, { color: palette.red[500] }]}>No Email Added</Text>
              )}
            </View>
          </View>
          <TouchableOpacity style={styles.editButton} activeOpacity={0.7} onPress={openEditModal}>
            <Pencil color={colors.primary} size={20} />
          </TouchableOpacity>
        </View>

        {/* General Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>General</Text>
          <View style={styles.card}>
            {/* Business Details */}
            {/* <TouchableOpacity style={styles.rowItem} activeOpacity={0.7} onPress={openEditModal}>
              <View style={styles.rowLeft}>
                <View style={styles.iconBoxGreen}>
                  <Building2 color={colors.primary} size={20} />
                </View>
                <Text style={styles.rowText}>Business Details</Text>
              </View>
              <ChevronRight color={palette.gray[400]} size={20} />
            </TouchableOpacity>

            <View style={styles.divider} /> */}

            {/* Payment Methods */}
            <TouchableOpacity 
              style={styles.rowItem} 
              activeOpacity={0.7}
              onPress={() => router.push("/payment-methods")}
            >
              <View style={styles.rowLeft}>
                <View style={styles.iconBoxGreen}>
                  <CreditCard color={colors.primary} size={20} />
                </View>
                <Text style={styles.rowText}>Payment Methods</Text>
              </View>
              <ChevronRight color={palette.gray[400]} size={20} />
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Language */}
            <TouchableOpacity
              style={styles.rowItem}
              activeOpacity={0.7}
              onPress={() => router.push("/account/language")}
            >
              <View style={styles.rowLeft}>
                <View style={styles.iconBoxGreen}>
                  <Globe color={colors.primary} size={20} />
                </View>
                <Text style={styles.rowText}>Language</Text>
              </View>
              <ChevronRight color={palette.gray[400]} size={20} />
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Notifications */}
            <TouchableOpacity
              style={[styles.rowItem, { paddingBottom: 0 }]}
              activeOpacity={0.7}
              onPress={() => router.push("/account/notifications")}
            >
              <View style={styles.rowLeft}>
                <View style={styles.iconBoxGreen}>
                  <Bell color={colors.primary} size={20} />
                </View>
                <Text style={styles.rowText}>Notifications</Text>
              </View>
              <ChevronRight color={palette.gray[400]} size={20} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.card}>
            {/* How A2B Works */}
            <TouchableOpacity
              style={styles.rowItem}
              activeOpacity={0.7}
              onPress={() => router.push("/account/how-it-works")}
            >
              <View style={styles.rowLeft}>
                <HelpCircle color={palette.gray[900]} size={20} />
                <Text style={styles.rowText}>How A2B Works</Text>
              </View>
              <ChevronRight color={palette.gray[400]} size={20} />
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Let's chat */}
            <TouchableOpacity
              style={styles.rowItem}
              activeOpacity={0.7}
              onPress={() => router.push("/account/chat")}
            >
              <View style={styles.rowLeft}>
                <MessageCircle color={palette.gray[900]} size={20} />
                <Text style={styles.rowText}>{"Need help? Let's chat"}</Text>
              </View>
              <ChevronRight color={palette.gray[400]} size={20} />
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Privacy Policy */}
            <TouchableOpacity
              style={styles.rowItem}
              activeOpacity={0.7}
              onPress={() => router.push("/account/privacy")}
            >
              <View style={styles.rowLeft}>
                <Info color={palette.gray[900]} size={20} />
                <Text style={styles.rowText}>Privacy Policy</Text>
              </View>
              <ChevronRight color={palette.gray[400]} size={20} />
            </TouchableOpacity>

            {/* Call Support Button */}
            <TouchableOpacity style={styles.callButton} activeOpacity={0.85}>
              <PhoneCall color={palette.white} size={20} />
              <Text style={styles.callButtonText}>Call A2B Support</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Log Out Card */}
        <TouchableOpacity
          style={styles.logoutCard}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <LogOut color={palette.red[500]} size={20} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Bottom Sheet Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isEditModalVisible}
        onRequestClose={() => !isSaving && setIsEditModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1} 
            onPress={() => !isSaving && setIsEditModalVisible(false)} 
          />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Edit Business Details</Text>
              <TouchableOpacity onPress={() => !isSaving && setIsEditModalVisible(false)}>
                <X color={palette.gray[900]} size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.sheetContent}>
              <TouchableOpacity style={styles.imageUploadContainer} onPress={pickImage} activeOpacity={0.8}>
                {editProfileImage ? (
                  <Image
                    source={{ uri: editProfileImage }}
                    style={styles.uploadAvatar}
                    contentFit="cover"
                  />
                ) : (
                  <View style={[styles.uploadAvatar, { alignItems: "center", justifyContent: "center" }]}>
                    <User color={palette.gray[400]} size={40} />
                  </View>
                )}
                <View style={styles.uploadOverlay}>
                  <Pencil color={palette.white} size={16} />
                </View>
              </TouchableOpacity>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Company Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={editCompany}
                  onChangeText={setEditCompany}
                  placeholder="Acme Logistics"
                  placeholderTextColor={palette.gray[400]}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Operating Region</Text>
                <TextInput
                  style={styles.textInput}
                  value={editRegion}
                  onChangeText={setEditRegion}
                  placeholder="e.g. Kampala Hub"
                  placeholderTextColor={palette.gray[400]}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={styles.textInput}
                  value={editEmail}
                  onChangeText={setEditEmail}
                  placeholder="your@email.com"
                  placeholderTextColor={palette.gray[400]}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Enable Port Pickups / Imports Custom Card */}
              <View style={styles.importCard}>
                <View style={styles.importRow}>
                  <View style={styles.importRowLeft}>
                    <Text style={styles.importCardTitle}>Enable Port Pickups / Imports</Text>
                    <Text style={styles.importCardSub}>Enable customs-cleared container pickups</Text>
                  </View>
                  <Switch
                    value={editIsImporter}
                    onValueChange={(val) => {
                      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                      setEditIsImporter(val);
                      if (!val) {
                        setEditTin("");
                        setTinError("");
                      }
                    }}
                    trackColor={{ false: palette.gray[300], true: palette.forest[50] }}
                    thumbColor={editIsImporter ? colors.primary : palette.ivory[300]}
                  />
                </View>

                {editIsImporter && (
                  <View style={styles.tinContainer}>
                    <Text style={styles.inputLabel}>{market.taxId.issuer} Tax Identification Number (TIN)</Text>
                    <View style={[
                      styles.tinInputWrapper,
                      editTin.length > 0 && !isValidTaxId(editTin, market) ? { borderColor: palette.red[700], borderWidth: 1.5 } : null,
                      isValidTaxId(editTin, market) ? { borderColor: palette.emerald[500], borderWidth: 1.5 } : null,
                    ]}>
                      <TextInput
                        style={styles.tinInput}
                        value={editTin}
                        onChangeText={(text) => {
                          const cleaned = text.replace(/[^0-9]/g, "");
                          setEditTin(cleaned);
                          if (cleaned.length > 0 && !isValidTaxId(cleaned, market)) {
                            setTinError(tinErrorMessage);
                          } else {
                            setTinError("");
                          }
                        }}
                        placeholder={market.taxId.hint}
                        placeholderTextColor={palette.gray[400]}
                        keyboardType="numeric"
                        maxLength={9}
                      />
                      {isValidTaxId(editTin, market) && (
                        <View style={styles.emeraldCheck}>
                          <CheckCircle size={18} color={palette.emerald[500]} fill={palette.white} />
                        </View>
                      )}
                    </View>
                    {tinError ? (
                      <Text style={styles.tinErrorText}>{tinError}</Text>
                    ) : null}
                  </View>
                )}
              </View>

              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleSaveProfile}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color={palette.white} />
                ) : (
                  <Text style={styles.saveButtonText}>Save Details</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.ivory[200],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: palette.gray[200],
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 24,
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.amber[100], // Amber-100
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: palette.amber[200], // Amber-200
  },
  warningText: {
    flex: 1,
    color: palette.amber[800], // Amber-700
    fontSize: 14,
    fontWeight: "500",
  },
  profileCard: {
    backgroundColor: palette.white,
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  profileLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: palette.gray[100],
  },
  profileInfo: {
    justifyContent: "center",
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: palette.gray[500],
  },
  editButton: {
    padding: 8,
  },
  sectionContainer: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    marginLeft: 4,
  },
  card: {
    backgroundColor: palette.white,
    borderRadius: 20,
    padding: 20,
  },
  rowItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconBoxGreen: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: palette.forest[50],
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: {
    fontSize: 16,
    fontWeight: "500",
    color: palette.gray[900],
  },
  divider: {
    height: 1,
    backgroundColor: palette.gray[100],
    width: "100%",
  },
  callButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 24,
    gap: 12,
  },
  callButtonText: {
    color: palette.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.white,
    borderRadius: 20,
    paddingVertical: 18,
    gap: 12,
    marginBottom: 70,
  },
  logoutText: {
    color: palette.red[500],
    fontSize: 16,
    fontWeight: "bold",
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
    backgroundColor: palette.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
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
    color: palette.gray[900],
  },
  sheetContent: {
    gap: 16,
  },
  imageUploadContainer: {
    alignSelf: "center",
    marginBottom: 8,
    position: "relative",
  },
  uploadAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: palette.gray[100],
  },
  uploadOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: palette.white,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: palette.gray[700],
    marginLeft: 4,
  },
  textInput: {
    backgroundColor: palette.gray[50],
    borderWidth: 1,
    borderColor: palette.gray[200],
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    fontSize: 16,
    color: palette.gray[900],
  },
  saveButton: {
    backgroundColor: palette.black,
    borderRadius: 12,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  saveButtonText: {
    color: palette.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  importCard: {
    backgroundColor: palette.gray[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.gray[200],
    padding: 16,
    marginTop: 8,
    gap: 16,
  },
  importRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  importRowLeft: {
    flex: 1,
    paddingRight: 8,
  },
  importCardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: palette.gray[900],
  },
  importCardSub: {
    fontSize: 12,
    color: palette.gray[500],
    marginTop: 2,
  },
  tinContainer: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: palette.gray[200],
    paddingTop: 16,
  },
  tinInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.gray[200],
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 12,
  },
  tinInput: {
    flex: 1,
    fontSize: 15,
    color: palette.gray[900],
    padding: 0,
  },
  emeraldCheck: {
    marginLeft: 8,
  },
  tinErrorText: {
    fontSize: 12,
    color: palette.red[700],
    marginLeft: 4,
  },
});
