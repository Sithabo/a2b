import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { colors, palette, Text, Button } from "@a2b/ui";

export default function VerifyOtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [otp, setOtp] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const generateNewCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setOtp("");
    setError("");
  };

  useEffect(() => {
    generateNewCode();
  }, []);

  const handleVerify = () => {
    if (otp !== generatedCode) {
      setError("Incorrect verification code.");
      return;
    }

    setError("");
    setIsLoading(true);

    // Simulate API Verification
    setTimeout(() => {
      setIsLoading(false);

      const role = params.role as string;
      const phone = params.phone as string;

      if (role === "driver") {
        router.push("/(auth)/driver/verify-identity");
      } else {
        router.push({
          pathname: "/(auth)/business-details",
          params: { role: role || "user", phone },
        });
      }
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={20} color={palette.gray[900]} />
        </TouchableOpacity>

        <View style={styles.headerContainer}>
          <Text variant="display" tone="primary" style={styles.headerTitle}>
            Verification Code
          </Text>
          <Text tone="primary" style={styles.headerSubtitle}>
            We sent a code to {params.phone || "*******"}.
          </Text>
        </View>

        <View style={styles.formContainer}>
          {/* Developer Hint */}
          <View style={styles.devHintBox}>
            <Text tone="primary" style={styles.devHintText}>
              Dev Mode: Your code is <Text tone="primary" style={{fontWeight: 'bold'}}>{generatedCode}</Text>
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text tone="primary" style={styles.inputLabel}>Enter Code</Text>
            <TextInput
              placeholder="000000"
              placeholderTextColor={palette.gray[400]}
              style={[styles.otpInput, error ? styles.inputError : null]}
              keyboardType="numeric"
              value={otp}
              onChangeText={(text) => { setOtp(text); setError(""); }}
              maxLength={6}
              autoFocus
            />
            {error ? <Text tone="primary" style={styles.errorText}>{error}</Text> : null}
          </View>

          <Button
            title="Verify & Continue"
            size="lg"
            onPress={handleVerify}
            loading={isLoading}
            disabled={otp.length < 6}
            fullWidth
          />
        </View>

        <TouchableOpacity style={styles.resendContainer} onPress={generateNewCode}>
          <Text tone="primary" style={styles.resendText}>Resend Code</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.ivory[200],
  },
  container: {
    flex: 1,
    padding: 24,
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
    marginBottom: 32,
  },
  headerContainer: {
    gap: 8,
    marginBottom: 40,
  },
  headerTitle: {
    color: colors.primary,
    fontSize: 28,
  },
  headerSubtitle: {
    fontSize: 18,
    color: palette.gray[500],
  },
  devHintBox: {
    backgroundColor: palette.gray[100],
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.gray[300],
    marginBottom: 8,
  },
  devHintText: {
    color: palette.gray[700],
    textAlign: "center",
    fontSize: 14,
  },
  formContainer: {
    gap: 24,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontWeight: "600",
    color: colors.primary,
    marginLeft: 4,
  },
  otpInput: {
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.gray[200],
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 64,
    textAlign: "center",
    fontSize: 32,
    fontWeight: "bold",
    letterSpacing: 10,
    color: palette.gray[900],
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    textAlign: "center",
  },
  resendContainer: {
    alignItems: "center",
    marginTop: 24,
  },
  resendText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 16,
    textDecorationLine: "underline",
  },
});
