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
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/useAuthStore";
import {
  ArrowLeft,
  Pencil,
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
} from "lucide-react-native";

export default function AccountScreen() {
  const router = useRouter();
  const { userProfile, logout, updateProfile } = useAuthStore();
  
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editCompany, setEditCompany] = useState("");
  const [editRegion, setEditRegion] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editProfileImage, setEditProfileImage] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    router.replace("/(auth)/login");
  };

  const openEditModal = () => {
    setEditCompany(userProfile?.company || "");
    setEditRegion(userProfile?.region || "");
    setEditEmail(userProfile?.email || "");
    setEditProfileImage(userProfile?.profileImage || null);
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

  const handleSaveProfile = () => {
    setIsSaving(true);
    setTimeout(() => {
      updateProfile({
        company: editCompany,
        region: editRegion,
        email: editEmail,
        name: editCompany, // Keep name synced with company for shippers
        profileImage: editProfileImage || undefined,
      });
      setIsSaving(false);
      setIsEditModalVisible(false);
    }, 2000);
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
          <ArrowLeft color="#0F3D26" size={20} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Account</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Warning Banner */}
        {!userProfile?.email && (
          <View style={styles.warningBanner}>
            <AlertCircle color="#B45309" size={20} />
            <Text style={styles.warningText}>
              Please add your email address to secure your account.
            </Text>
          </View>
        )}

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileLeft}>
            <Image
              source={{ uri: userProfile?.profileImage || "https://i.pravatar.cc/150?img=11" }}
              style={styles.avatarImage}
              contentFit="cover"
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {userProfile?.company || userProfile?.name || "John Musa"}
              </Text>
              {userProfile?.email ? (
                <Text style={styles.profileEmail}>{userProfile.email}</Text>
              ) : (
                <Text style={[styles.profileEmail, { color: "#EF4444" }]}>No Email Added</Text>
              )}
            </View>
          </View>
          <TouchableOpacity style={styles.editButton} activeOpacity={0.7} onPress={openEditModal}>
            <Pencil color="#0F3D26" size={20} />
          </TouchableOpacity>
        </View>

        {/* General Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>General</Text>
          <View style={styles.card}>
            {/* Business Details */}
            <TouchableOpacity style={styles.rowItem} activeOpacity={0.7} onPress={openEditModal}>
              <View style={styles.rowLeft}>
                <View style={styles.iconBoxGreen}>
                  <Building2 color="#0F3D26" size={20} />
                </View>
                <Text style={styles.rowText}>Business Details</Text>
              </View>
              <ChevronRight color="#9CA3AF" size={20} />
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Payment Methods */}
            <TouchableOpacity 
              style={styles.rowItem} 
              activeOpacity={0.7}
              onPress={() => router.push("/payment-methods")}
            >
              <View style={styles.rowLeft}>
                <View style={styles.iconBoxGreen}>
                  <CreditCard color="#0F3D26" size={20} />
                </View>
                <Text style={styles.rowText}>Payment Methods</Text>
              </View>
              <ChevronRight color="#9CA3AF" size={20} />
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Language */}
            <TouchableOpacity style={styles.rowItem} activeOpacity={0.7}>
              <View style={styles.rowLeft}>
                <View style={styles.iconBoxGreen}>
                  <Globe color="#0F3D26" size={20} />
                </View>
                <Text style={styles.rowText}>Language</Text>
              </View>
              <ChevronRight color="#9CA3AF" size={20} />
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Notifications */}
            <TouchableOpacity
              style={[styles.rowItem, { paddingBottom: 0 }]}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <View style={styles.iconBoxGreen}>
                  <Bell color="#0F3D26" size={20} />
                </View>
                <Text style={styles.rowText}>Notifications</Text>
              </View>
              <ChevronRight color="#9CA3AF" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.card}>
            {/* How A2B Works */}
            <TouchableOpacity style={styles.rowItem} activeOpacity={0.7}>
              <View style={styles.rowLeft}>
                <HelpCircle color="#111827" size={20} />
                <Text style={styles.rowText}>How A2B Works</Text>
              </View>
              <ChevronRight color="#9CA3AF" size={20} />
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Let's chat */}
            <TouchableOpacity style={styles.rowItem} activeOpacity={0.7}>
              <View style={styles.rowLeft}>
                <MessageCircle color="#111827" size={20} />
                <Text style={styles.rowText}>Need help? Let's chat</Text>
              </View>
              <ChevronRight color="#9CA3AF" size={20} />
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Privacy Policy */}
            <TouchableOpacity style={styles.rowItem} activeOpacity={0.7}>
              <View style={styles.rowLeft}>
                <Info color="#111827" size={20} />
                <Text style={styles.rowText}>Privacy Policy</Text>
              </View>
              <ChevronRight color="#9CA3AF" size={20} />
            </TouchableOpacity>

            {/* Call Support Button */}
            <TouchableOpacity style={styles.callButton} activeOpacity={0.85}>
              <PhoneCall color="#FFFFFF" size={20} />
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
          <LogOut color="#EF4444" size={20} />
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
                <X color="#111827" size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.sheetContent}>
              <TouchableOpacity style={styles.imageUploadContainer} onPress={pickImage} activeOpacity={0.8}>
                <Image
                  source={{ uri: editProfileImage || "https://i.pravatar.cc/150?img=11" }}
                  style={styles.uploadAvatar}
                  contentFit="cover"
                />
                <View style={styles.uploadOverlay}>
                  <Pencil color="#FFFFFF" size={16} />
                </View>
              </TouchableOpacity>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Company Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={editCompany}
                  onChangeText={setEditCompany}
                  placeholder="Acme Logistics"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Operating Region</Text>
                <TextInput
                  style={styles.textInput}
                  value={editRegion}
                  onChangeText={setEditRegion}
                  placeholder="e.g. Kampala Hub"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={styles.textInput}
                  value={editEmail}
                  onChangeText={setEditEmail}
                  placeholder="your@email.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleSaveProfile}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#FFFFFF" />
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
    backgroundColor: "#F5F5E9",
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
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0F3D26",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 24,
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7", // Amber-100
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: "#FDE68A", // Amber-200
  },
  warningText: {
    flex: 1,
    color: "#92400E", // Amber-700
    fontSize: 14,
    fontWeight: "500",
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
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
    backgroundColor: "#F3F4F6",
  },
  profileInfo: {
    justifyContent: "center",
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F3D26",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: "#6B7280",
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
    color: "#0F3D26",
    marginLeft: 4,
  },
  card: {
    backgroundColor: "#FFFFFF",
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
    backgroundColor: "#E6F4EA",
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    width: "100%",
  },
  callButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0F3D26",
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 24,
    gap: 12,
  },
  callButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 18,
    gap: 12,
    marginBottom: 70,
  },
  logoutText: {
    color: "#EF4444",
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
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    shadowColor: "#000",
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
    color: "#111827",
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
    backgroundColor: "#F3F4F6",
  },
  uploadOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#0F3D26",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginLeft: 4,
  },
  textInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    fontSize: 16,
    color: "#111827",
  },
  saveButton: {
    backgroundColor: "#000000",
    borderRadius: 12,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
