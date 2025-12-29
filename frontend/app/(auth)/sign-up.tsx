import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
} from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/theme";

export default function SignUpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.replace("/(tabs)");
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={20} color="#333" />
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <ThemedText type="title" style={styles.headerTitle}>
              Create Account
            </ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Start your journey as a {params.role || "user"}.
            </ThemedText>
          </View>

          <View style={styles.formContainer}>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Full Name</ThemedText>
              <View style={styles.inputWrapper}>
                <User size={20} color={Colors.light.gray[400]} />
                <TextInput
                  placeholder="John Doe"
                  placeholderTextColor={Colors.light.gray[400]}
                  style={styles.textInput}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Email Address</ThemedText>
              <View style={styles.inputWrapper}>
                <Mail size={20} color={Colors.light.gray[400]} />
                <TextInput
                  placeholder="john@example.com"
                  placeholderTextColor={Colors.light.gray[400]}
                  style={styles.textInput}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Phone */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Phone Number</ThemedText>
              <View style={styles.inputWrapper}>
                <Phone size={20} color={Colors.light.gray[400]} />
                <TextInput
                  placeholder="+1 234 567 8900"
                  placeholderTextColor={Colors.light.gray[400]}
                  style={styles.textInput}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Password</ThemedText>
              <View style={styles.inputWrapper}>
                <Lock size={20} color={Colors.light.gray[400]} />
                <TextInput
                  placeholder="Create a password"
                  placeholderTextColor={Colors.light.gray[400]}
                  style={styles.textInput}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={Colors.light.gray[400]} />
                  ) : (
                    <Eye size={20} color={Colors.light.gray[400]} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <Button
              title="Create Account"
              size="lg"
              onPress={handleSignUp}
              isLoading={isLoading}
              style={styles.createButton}
            />
          </View>

          <View style={styles.footerContainer}>
            <View style={styles.loginRow}>
              <ThemedText style={styles.footerText}>
                Already have an account?
              </ThemedText>
              <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                <ThemedText style={styles.loginLink}>Log In</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.ivory,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.light.gray[200],
    marginBottom: 24,
  },
  headerContainer: {
    gap: 8,
    marginBottom: 32,
  },
  headerTitle: {
    color: Colors.light.primary,
    fontSize: 28,
  },
  headerSubtitle: {
    fontSize: 18,
    color: Colors.light.gray[500],
  },
  formContainer: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontWeight: "600",
    color: Colors.light.primary,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Colors.light.gray[200],
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  textInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: Colors.light.gray[900],
  },
  createButton: {
    marginTop: 24,
  },
  footerContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 32,
    paddingBottom: 16,
  },
  loginRow: {
    flexDirection: "row",
    gap: 4,
  },
  footerText: {
    color: Colors.light.gray[500],
  },
  loginLink: {
    fontWeight: "bold",
    color: Colors.light.primary,
  },
});
