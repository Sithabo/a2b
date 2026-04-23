import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
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
} from "lucide-react-native";

export default function AccountScreen() {
  const router = useRouter();
  const { userProfile, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace("/(auth)/login");
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
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileLeft}>
            <Image
              source={{ uri: "https://i.pravatar.cc/150?img=11" }}
              style={styles.avatarImage}
              contentFit="cover"
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {userProfile?.name || "John Musa"}
              </Text>
              <Text style={styles.profileEmail}>johnmusa@email.com</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editButton} activeOpacity={0.7}>
            <Pencil color="#0F3D26" size={20} />
          </TouchableOpacity>
        </View>

        {/* General Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>General</Text>
          <View style={styles.card}>
            {/* Business Details */}
            <TouchableOpacity style={styles.rowItem} activeOpacity={0.7}>
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
            <TouchableOpacity style={styles.rowItem} activeOpacity={0.7}>
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
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.05,
    // shadowRadius: 10,
    // elevation: 3,
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
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.05,
    // shadowRadius: 10,
    // elevation: 3,
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
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.05,
    // shadowRadius: 10,
    // elevation: 3,
    marginBottom: 70,
  },
  logoutText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "bold",
  },
});
