import React, { useState } from "react";
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Switch,
  LayoutAnimation,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useProfileImage, useUserProfile } from "@/store/useShipperProfile";
import { useMarket } from "@/store/useMarket";
import { isValidTaxId } from "@a2b/core";
import { apiErrorMessage } from "@a2b/api-client";
import { emailSupport } from "@a2b/features";
import { supportContext } from "@/lib/support";
import { api, useSession } from "@/lib/session";
import {
  Pencil,
  User,
  CreditCard,
  Globe,
  Bell,
  HelpCircle,
  MessageCircle,
  Info,
  Mail,
  LogOut,
  AlertCircle,
  X,
  CheckCircle,
} from "lucide-react-native";
import {
  Button,
  Card,
  colors,
  elevation,
  IconButton,
  layout,
  ListItem,
  ListSection,
  radius,
  ScreenHeader,
  spacing,
  Text,
  TextField,
  tones,
} from "@a2b/ui";

export default function AccountScreen() {
  const router = useRouter();
  const userProfile = useUserProfile();
  const setProfileImage = useProfileImage((s) => s.set);
  const setUser = useSession((s) => s.setUser);
  const signOut = useSession((s) => s.signOut);
  const user = useSession((s) => s.user);
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
    await signOut(); // the root layout routes back to sign-in
  };

  const openEditModal = () => {
    setEditCompany(userProfile?.company || "");
    setEditRegion(userProfile?.region || "");
    setEditEmail(userProfile?.email || "");
    setEditProfileImage(userProfile?.profileImage || null);
    setEditIsImporter(userProfile?.isImporter || false);
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
      <ScreenHeader title="My Account" onBackPress={() => router.back()} />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Warning Banner */}
        {!userProfile?.email && (
          <View style={styles.warningBanner}>
            <AlertCircle color={colors.warning} size={20} />
            <Text variant="bodySm" color={tones.warning.fg} style={styles.warningText}>
              Please add your email address to secure your account.
            </Text>
          </View>
        )}

        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileLeft}>
            {userProfile?.profileImage ? (
              <Image
                source={{ uri: userProfile.profileImage }}
                style={styles.avatarImage}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.avatarImage, styles.centered]}>
                <User color={colors.textPlaceholder} size={32} />
              </View>
            )}
            <View style={styles.profileInfo}>
              <Text variant="h3" tone="primary">
                {userProfile?.company || userProfile?.name || "John Musa"}
              </Text>
              {userProfile?.email ? (
                <Text variant="bodySm" tone="muted">{userProfile.email}</Text>
              ) : (
                <Text variant="bodySm" tone="danger">No Email Added</Text>
              )}
            </View>
          </View>
          <IconButton
            icon={Pencil}
            variant="plain"
            accessibilityLabel="Edit business details"
            onPress={openEditModal}
          />
        </Card>

        <ListSection title="General">
          <ListItem icon={CreditCard} title="Payment Methods" onPress={() => router.push("/payment-methods")} />
          <ListItem icon={Globe} title="Language" onPress={() => router.push("/account/language")} />
          <ListItem icon={Bell} title="Notifications" onPress={() => router.push("/account/notifications")} />
        </ListSection>

        <ListSection title="Support">
          <ListItem icon={HelpCircle} title="How A2B Works" onPress={() => router.push("/account/how-it-works")} />
          <ListItem icon={MessageCircle} title="Need help? Let's chat" onPress={() => router.push("/account/chat")} />
          <ListItem icon={Info} title="Privacy Policy" onPress={() => router.push("/account/privacy")} />
        </ListSection>

        <Button
          title="Email A2B Support"
          icon={Mail}
          onPress={() => emailSupport({ subject: "Help with my A2B account", context: supportContext(user, market) })}
        />

        <ListSection>
          <ListItem icon={LogOut} title="Log Out" tone="danger" onPress={handleLogout} />
        </ListSection>
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
          <Pressable
            style={styles.modalBackdrop}
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={() => !isSaving && setIsEditModalVisible(false)}
          />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text variant="h2">Edit Business Details</Text>
              <IconButton
                icon={X}
                variant="plain"
                accessibilityLabel="Close"
                onPress={() => !isSaving && setIsEditModalVisible(false)}
              />
            </View>

            <View style={styles.sheetContent}>
              <Pressable
                style={({ pressed }) => [styles.imageUploadContainer, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Change profile photo"
                onPress={pickImage}
              >
                {editProfileImage ? (
                  <Image
                    source={{ uri: editProfileImage }}
                    style={styles.uploadAvatar}
                    contentFit="cover"
                  />
                ) : (
                  <View style={[styles.uploadAvatar, styles.centered]}>
                    <User color={colors.textPlaceholder} size={40} />
                  </View>
                )}
                <View style={styles.uploadOverlay}>
                  <Pencil color={colors.onPrimary} size={16} />
                </View>
              </Pressable>

              <TextField
                label="Company Name"
                value={editCompany}
                onChangeText={setEditCompany}
                placeholder="Acme Logistics"
              />

              <TextField
                label="Operating Region"
                value={editRegion}
                onChangeText={setEditRegion}
                placeholder="e.g. Kampala Hub"
              />

              <TextField
                label="Email Address"
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="your@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              {/* Enable Port Pickups / Imports Custom Card */}
              <View style={styles.importCard}>
                <View style={styles.importRow}>
                  <View style={styles.importRowLeft}>
                    <Text variant="bodyStrong">Enable Port Pickups / Imports</Text>
                    <Text variant="caption" tone="muted">Enable customs-cleared container pickups</Text>
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
                    trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
                    thumbColor={editIsImporter ? colors.primary : colors.surface}
                  />
                </View>

                {editIsImporter && (
                  <View style={styles.tinContainer}>
                    <TextField
                      label={`${market.taxId.issuer} Tax Identification Number (TIN)`}
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
                      keyboardType="numeric"
                      maxLength={9}
                      error={tinError || undefined}
                      trailing={
                        isValidTaxId(editTin, market) ? (
                          <CheckCircle size={18} color={colors.success} fill={colors.surface} />
                        ) : null
                      }
                    />
                  </View>
                )}
              </View>

              <Button
                title="Save Details"
                onPress={handleSaveProfile}
                loading={isSaving}
                style={styles.saveButton}
              />
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
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: layout.gutter,
    paddingTop: spacing.lg,
    gap: spacing['2xl'],
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.85,
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: tones.warning.bg,
    padding: spacing.lg,
    borderRadius: radius.md,
    gap: spacing.md,
  },
  warningText: {
    flex: 1,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  profileLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSunken,
  },
  profileInfo: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.xs,
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
  sheetContent: {
    gap: spacing.lg,
  },
  imageUploadContainer: {
    alignSelf: "center",
    marginBottom: spacing.sm,
    position: "relative",
  },
  uploadAvatar: {
    width: 96,
    height: 96,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSunken,
  },
  uploadOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.surface,
  },
  saveButton: {
    marginTop: spacing.lg,
  },
  importCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginTop: spacing.sm,
    gap: spacing.lg,
  },
  importRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  importRowLeft: {
    flex: 1,
    paddingRight: spacing.sm,
    gap: spacing.xxs,
  },
  tinContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
  },
});
