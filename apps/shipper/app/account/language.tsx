import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Check } from "lucide-react-native";
import { colors, palette, ScreenHeader } from "@a2b/ui";

export default function LanguageScreen() {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const languages = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "es", name: "Spanish", nativeName: "Español (Coming Soon)", disabled: true },
    { code: "fr", name: "French", nativeName: "Français (Coming Soon)", disabled: true },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background || palette.gray[50] }]}>
      <ScreenHeader
        title="Language"
        subtitle="Select your preferred language"
        onBackPress={() => router.replace("/(tabs)/account")}
        onCancelPress={() => router.replace("/(tabs)/account")}
      />

      <View style={styles.content}>
        <View style={styles.card}>
          {languages.map((lang, index) => {
            const isSelected = selectedLanguage === lang.code;
            return (
              <View key={lang.code}>
                {index > 0 && <View style={styles.divider} />}
                <TouchableOpacity
                  style={[styles.rowItem, lang.disabled && styles.rowItemDisabled]}
                  activeOpacity={lang.disabled ? 1 : 0.7}
                  onPress={() => !lang.disabled && setSelectedLanguage(lang.code)}
                  disabled={lang.disabled}
                >
                  <View style={styles.rowLeft}>
                    <Text style={styles.langName}>{lang.name}</Text>
                    <Text style={styles.nativeName}>({lang.nativeName})</Text>
                  </View>
                  {isSelected && <Check size={20} color={colors.primary} strokeWidth={3} />}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: palette.white,
    borderRadius: 20,
    padding: 8,
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  rowItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  rowItemDisabled: {
    opacity: 0.5,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  langName: {
    fontSize: 16,
    fontWeight: "bold",
    color: palette.gray[900],
  },
  nativeName: {
    fontSize: 14,
    color: palette.gray[500],
  },
  divider: {
    height: 1,
    backgroundColor: palette.gray[100],
    marginHorizontal: 16,
  },
});
