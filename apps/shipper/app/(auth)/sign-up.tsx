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
import { ArrowLeft, CheckSquare, Square } from "lucide-react-native";
import CountryPicker, { CountryCode, Country } from 'react-native-country-picker-modal';
import { MARKET_CODES } from "@a2b/core";
import { parsePhoneNumberFromString } from 'libphonenumber-js/min';
import { palette, Text, Button } from "@a2b/ui";

export default function SignUpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState<CountryCode>('UG');
  const [callingCode, setCallingCode] = useState('256');
  const [isLoading, setIsLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");

  const onSelectCountry = (country: Country) => {
    setCountryCode(country.cca2);
    setCallingCode(country.callingCode[0]);
    setError("");
  };

  const handleSignUp = () => {
    if (!agreed) return;

    const fullNumber = `+${callingCode}${phoneNumber}`;
    const parsedNumber = parsePhoneNumberFromString(fullNumber);

    if (!parsedNumber || !parsedNumber.isValid()) {
      setError("Please enter a valid phone number.");
      return;
    }

    setError("");
    setIsLoading(true);
    // Simulate sending OTP
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to OTP with phone and role
      router.push({
        pathname: "/(auth)/verify-otp",
        params: { role: params.role || "user", phone: fullNumber },
      });
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={20} color={palette.gray[900]} />
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <Text variant="display" tone="primary" style={styles.headerTitle}>
              Sign Up
            </Text>
            <Text tone="primary" style={styles.headerSubtitle}>
              Just a few quick things to get started
            </Text>
          </View>

          <View style={styles.formContainer}>
            {/* Phone */}
            <View style={styles.inputGroup}>
              <Text tone="primary" style={styles.inputLabel}>Mobile Number</Text>
              <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
                <View style={styles.countryCodePicker}>
                  <CountryPicker
                    countryCodes={MARKET_CODES}
                    withFilter
                    withFlag
                    withCallingCode
                    withCallingCodeButton
                    countryCode={countryCode}
                    onSelect={onSelectCountry}
                    containerButtonStyle={styles.pickerButton}
                    modalProps={{
                      presentationStyle: 'pageSheet',
                    }}
                  />
                </View>
                <TextInput
                  placeholder="700 000 000"
                  placeholderTextColor={palette.gray[400]}
                  style={styles.textInput}
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={(text) => { setPhoneNumber(text); setError(""); }}
                  maxLength={15}
                />
              </View>
              {error ? <Text tone="primary" style={styles.errorText}>{error}</Text> : null}
            </View>

            {/* Terms Checkbox */}
            <TouchableOpacity 
              style={styles.checkboxContainer} 
              onPress={() => setAgreed(!agreed)}
              activeOpacity={0.7}
            >
              {agreed ? (
                <CheckSquare size={20} color={palette.black} /> 
              ) : (
                <Square size={20} color={palette.gray[400]} />
              )}
              <Text tone="primary" style={styles.checkboxLabel}>
                I Agree With The Terms And Conditions
              </Text>
            </TouchableOpacity>

            <Button
              title="Sign Up"
              size="lg"
              onPress={handleSignUp}
              loading={isLoading}
              disabled={!agreed || !phoneNumber}
              style={styles.createButton}
            />
          </View>

          <View style={styles.footerContainer}>
            <View style={styles.loginRow}>
              <Text tone="primary" style={styles.footerText}>
                Already have an account?
              </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                <Text tone="primary" style={styles.loginLink}>Sign In</Text>
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
    backgroundColor: palette.ivory[200],
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
    backgroundColor: palette.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: palette.gray[200],
    marginBottom: 24,
  },
  headerContainer: {
    gap: 8,
    marginBottom: 32,
  },
  headerTitle: {
    color: palette.black,
    fontSize: 28,
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 16,
    color: palette.gray[600],
  },
  formContainer: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontWeight: "600",
    color: palette.black,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.gray[200],
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 16,
  },
  inputError: {
    borderColor: "red",
  },
  countryCodePicker: {
    marginRight: 8,
    borderRightWidth: 1,
    borderRightColor: palette.gray[200],
    paddingRight: 8,
    flexShrink: 0,
    minWidth: 96,
    justifyContent: "center",
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  textInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    color: palette.gray[900],
    paddingVertical: 0,
    textAlignVertical: "center",
  },
  errorText: {
    color: "red",
    fontSize: 12,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 12,
  },
  checkboxLabel: {
    fontSize: 14,
    color: palette.black,
    fontWeight: "500",
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
    color: palette.gray[500],
  },
  loginLink: {
    fontWeight: "bold",
    color: palette.black,
    textDecorationLine: "underline",
  },
});
