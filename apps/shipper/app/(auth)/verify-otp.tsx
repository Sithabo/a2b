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
import { Button } from "@/components/ui/Button";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/theme";

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
          <ArrowLeft size={20} color={Colors.light.gray[900]} />
        </TouchableOpacity>

        <View style={styles.headerContainer}>
          <ThemedText type="title" style={styles.headerTitle}>
            Verification Code
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            We sent a code to {params.phone || "*******"}.
          </ThemedText>
        </View>

        <View style={styles.formContainer}>
          {/* Developer Hint */}
          <View style={styles.devHintBox}>
            <ThemedText style={styles.devHintText}>
              Dev Mode: Your code is <ThemedText style={{fontWeight: 'bold'}}>{generatedCode}</ThemedText>
            </ThemedText>
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.inputLabel}>Enter Code</ThemedText>
            <TextInput
              placeholder="000000"
              placeholderTextColor={Colors.light.gray[400]}
              style={[styles.otpInput, error ? styles.inputError : null]}
              keyboardType="numeric"
              value={otp}
              onChangeText={(text) => { setOtp(text); setError(""); }}
              maxLength={6}
              autoFocus
            />
            {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}
          </View>

          <Button
            title="Verify & Continue"
            size="lg"
            onPress={handleVerify}
            isLoading={isLoading}
            disabled={otp.length < 6}
            style={styles.verifyButton}
            textStyle={styles.verifyButtonText}
          />
        </View>

        <TouchableOpacity style={styles.resendContainer} onPress={generateNewCode}>
          <ThemedText style={styles.resendText}>Resend Code</ThemedText>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.ivory,
  },
  container: {
    flex: 1,
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
    marginBottom: 32,
  },
  headerContainer: {
    gap: 8,
    marginBottom: 40,
  },
  headerTitle: {
    color: Colors.light.primary,
    fontSize: 28,
  },
  headerSubtitle: {
    fontSize: 18,
    color: Colors.light.gray[500],
  },
  devHintBox: {
    backgroundColor: Colors.light.gray[100],
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.gray[300],
    marginBottom: 8,
  },
  devHintText: {
    color: Colors.light.gray[700],
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
    color: Colors.light.primary,
    marginLeft: 4,
  },
  otpInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Colors.light.gray[200],
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 64,
    textAlign: "center",
    fontSize: 32,
    fontWeight: "bold",
    letterSpacing: 10,
    color: Colors.light.gray[900],
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    textAlign: "center",
  },
  verifyButton: {
    width: "100%",
  },
  verifyButtonText: {
    fontWeight: "bold",
  },
  resendContainer: {
    alignItems: "center",
    marginTop: 24,
  },
  resendText: {
    color: Colors.light.primary,
    fontWeight: "600",
    fontSize: 16,
    textDecorationLine: "underline",
  },
});
