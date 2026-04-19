import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  Building2,
  CreditCard,
  Globe,
  Bell,
  HelpCircle,
  PhoneCall,
  Flag,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from "lucide-react-native";
import { useAuthStore } from "@/store/useAuthStore";

// Helper to get initials
const getInitials = (name: string) => {
  if (!name) return "??";
  const parts = name.split(" ");
  if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (name[0] || "?").toUpperCase();
};

export default function AccountScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { userProfile, updateProfile, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace("/(auth)/login");
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header section with curve */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {getInitials(userProfile?.name || "")}
          </Text>
        </View>
        <TextInput
          style={styles.userName}
          value={userProfile?.name || ""}
          onChangeText={(text) => updateProfile({ name: text })}
          placeholder="Enter Name"
          placeholderTextColor="#A7F3D0"
          returnKeyType="done"
        />
        <Text style={styles.userPhone}>
          {userProfile?.phone || "No phone added"}
        </Text>

        <View style={styles.verifiedBadge}>
          <ShieldCheck color="white" size={16} />
          <Text style={styles.verifiedText}>Verified Shipper</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Settings Links Card */}
        <View style={styles.settingsCard}>
          {/* Business Details */}
          <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
            <View style={styles.settingRowLeft}>
              <View style={[styles.iconBox, { backgroundColor: "#EFF6FF" }]}>
                <Building2 color="#2563EB" size={20} />
              </View>
              <Text style={styles.settingLabel}>Business Details</Text>
            </View>
            <ChevronRight color="#9CA3AF" size={20} />
          </TouchableOpacity>

          {/* Payment Methods */}
          <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
            <View style={styles.settingRowLeft}>
              <View style={[styles.iconBox, { backgroundColor: "#F3E8FF" }]}>
                <CreditCard color="#9333EA" size={20} />
              </View>
              <Text style={styles.settingLabel}>Payment Methods</Text>
            </View>
            <ChevronRight color="#9CA3AF" size={20} />
          </TouchableOpacity>

          {/* Language */}
          <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
            <View style={styles.settingRowLeft}>
              <View style={[styles.iconBox, { backgroundColor: "#CCFBF1" }]}>
                <Globe color="#0D9488" size={20} />
              </View>
              <View>
                <Text style={styles.settingLabel}>Language</Text>
                <Text style={styles.settingSubLabel}>English / Luganda</Text>
              </View>
            </View>
            <ChevronRight color="#9CA3AF" size={20} />
          </TouchableOpacity>

          {/* Notifications */}
          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <View style={styles.settingRowLeft}>
              <View style={[styles.iconBox, { backgroundColor: "#FEF3C7" }]}>
                <Bell color="#D97706" size={20} />
              </View>
              <Text style={styles.settingLabel}>Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#E5E7EB", true: "#0F3D26" }}
              thumbColor={notificationsEnabled ? "#FFFFFF" : "#FFFFFF"}
            />
          </View>
        </View>

        {/* Support & Safety Section */}
        <View style={styles.supportContainer}>
          <Text style={styles.sectionHeader}>SUPPORT & SAFETY</Text>

          <View style={styles.supportCard}>
            <TouchableOpacity style={styles.supportLink} activeOpacity={0.7}>
              <HelpCircle color="#0F3D26" size={18} />
              <Text style={styles.supportLinkText}>How A2B Works</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.callSupportButton}
              activeOpacity={0.85}
            >
              <PhoneCall color="white" size={20} />
              <Text style={styles.callSupportText}>Call A2B Support</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.reportIssueButton}
              activeOpacity={0.7}
            >
              <Flag color="#6B7280" size={20} />
              <Text style={styles.reportIssueText}>Report an Issue</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <LogOut color="#EF4444" size={18} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: "#0F3D26", // Primary color
    paddingTop: 64, // Accounts for status bar
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 10,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    backgroundColor: "#FFFFFF",
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0F3D26",
  },
  userName: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  userPhone: {
    color: "#D1FAE5", // Light green slightly transparent
    fontSize: 14,
    marginBottom: 12,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#166534", // Darker green
    borderColor: "#15803D",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  verifiedText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 0,
    marginTop: -24, // Pull up to overlap header
    paddingBottom: 100, // For tab bar
    zIndex: 20,
    gap: 24,
  },
  settingsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  settingRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
  },
  settingSubLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  supportContainer: {
    gap: 12,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    paddingLeft: 4,
    letterSpacing: 0.5,
  },
  supportCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  supportLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  supportLinkText: {
    color: "#0F3D26",
    fontWeight: "600",
    fontSize: 14,
  },
  callSupportButton: {
    width: "100%",
    backgroundColor: "#0F3D26",
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  callSupportText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  reportIssueButton: {
    width: "100%",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  reportIssueText: {
    color: "#4B5563",
    fontWeight: "500",
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    alignSelf: "center",
    marginTop: 8,
  },
  logoutText: {
    color: "#EF4444",
    fontWeight: "600",
    fontSize: 14,
  },
});
