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
import { ArrowLeft } from "lucide-react-native";
import CountryPicker, { CountryCode, Country } from 'react-native-country-picker-modal';
import { parsePhoneNumberFromString } from 'libphonenumber-js/min';
import { Button } from "@/components/ui/Button";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/theme";

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState<CountryCode>('UG');
  const [callingCode, setCallingCode] = useState('256');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const onSelectCountry = (country: Country) => {
    setCountryCode(country.cca2);
    setCallingCode(country.callingCode[0]);
    setError("");
  };

  const handleLogin = (method: "momo" | "sms") => {
    const fullNumber = `+${callingCode}${phoneNumber}`;
    const parsedNumber = parsePhoneNumberFromString(fullNumber);

    if (!parsedNumber || !parsedNumber.isValid()) {
      setError("Please enter a valid phone number.");
      return;
    }

    setError("");
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Pass the method and role to the next screen
      router.push({
        pathname: "/(auth)/verify-otp",
        params: { role: params.role, method, phone: fullNumber },
      });
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={20} color={Colors.light.gray[900]} />
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <ThemedText type="title" style={styles.headerTitle}>
              Enter Your Phone
            </ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Verify with SMS to continue as a{" "}
              <ThemedText style={{ fontWeight: "bold", fontSize: 18 }}>
                {params.role || "user"}
              </ThemedText>
              .
            </ThemedText>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Phone Input */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Phone Number</ThemedText>
              <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
                <View style={styles.countryCodePicker}>
                  <CountryPicker
                    withFilter
                    withFlag
                    withCallingCode
                    withCallingCodeButton
                    countryCode={countryCode}
                    onSelect={onSelectCountry}
                    containerButtonStyle={styles.pickerButton}
                  />
                </View>
                <TextInput
                  placeholder="700 000 000"
                  placeholderTextColor={Colors.light.gray[400]}
                  style={styles.textInput}
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={(text) => { setPhoneNumber(text); setError(""); }}
                  maxLength={15}
                />
              </View>
              {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}
            </View>

            <View style={styles.buttonGroup}>
              {/* MTN MoMo Button - Disabled as per request */}
              {/* <Button
                title="MTN MoMo"
                size="lg"
                onPress={() => handleLogin("momo")}
                isLoading={isLoading}
                style={styles.momoButton}
                textStyle={styles.momoButtonText}
              /> */}

              <Button
                title="Send SMS Code"
                variant="primary"
                size="lg"
                onPress={() => handleLogin("sms")}
                isLoading={isLoading}
                style={styles.smsButton}
                textStyle={styles.smsButtonText}
              />
            </View>
          </View>

          <View style={styles.footerContainer}>
            <ThemedText type="caption" style={styles.footerText}>
              By continuing, you agree to our Terms of Service & Privacy Policy
            </ThemedText>
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
    marginBottom: 32,
  },
  headerContainer: {
    gap: 8,
    marginBottom: 40,
  },
  headerTitle: {
    color: Colors.light.primary, // Forest
    fontSize: 28,
  },
  headerSubtitle: {
    fontSize: 18,
    color: Colors.light.gray[500],
  },
  formContainer: {
    gap: 24,
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
    overflow: "hidden",
    height: 56,
    paddingHorizontal: 16,
  },
  inputError: {
    borderColor: "red",
  },
  countryCodePicker: {
    backgroundColor: Colors.light.gray[100],
    height: "100%",
    justifyContent: "center",
    paddingHorizontal: 8,
    marginRight: 8,
    marginLeft: -16, // to touch the edge
    borderRightWidth: 1,
    borderRightColor: Colors.light.gray[200],
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  textInput: {
    flex: 1,
    fontSize: 18,
    color: Colors.light.gray[900],
    fontWeight: "500",
  },
  errorText: {
    color: "red",
    fontSize: 12,
  },
  buttonGroup: {
    gap: 16,
    marginTop: 16,
  },
  momoButton: {
    backgroundColor: "#FFCC00", // MTN Yellow
    borderColor: "#FFCC00",
  },
  momoButtonText: {
    color: "#000000",
    fontWeight: "bold",
  },
  smsButton: {
    backgroundColor: Colors.light.gray[600],
    borderColor: Colors.light.gray[600],
  },
  smsButtonText: {
    color: "#FFFFFF",
  },
  footerContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 40,
    paddingBottom: 24,
    gap: 8,
  },
  footerText: {
    textAlign: "center",
    color: Colors.light.gray[400],
    paddingHorizontal: 40,
    fontSize: 12,
  },
});
