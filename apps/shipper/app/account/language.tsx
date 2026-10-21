import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Check } from "lucide-react-native";
import { colors, layout, ListSection, ScreenHeader, spacing, Text } from "@a2b/ui";

export default function LanguageScreen() {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const languages = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "es", name: "Spanish", nativeName: "Español (Coming Soon)", disabled: true },
    { code: "fr", name: "French", nativeName: "Français (Coming Soon)", disabled: true },
  ];

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Language"
        subtitle="Select your preferred language"
        onBackPress={() => router.replace("/(tabs)/account")}
        onCancelPress={() => router.replace("/(tabs)/account")}
      />

      <View style={styles.content}>
        <ListSection>
          {languages.map((lang) => {
            const isSelected = selectedLanguage === lang.code;
            return (
              <Pressable
                key={lang.code}
                accessibilityRole="button"
                accessibilityLabel={`${lang.name} (${lang.nativeName})`}
                accessibilityState={{ selected: isSelected, disabled: !!lang.disabled }}
                style={({ pressed }) => [
                  styles.rowItem,
                  lang.disabled && styles.rowItemDisabled,
                  pressed && styles.rowItemPressed,
                ]}
                onPress={() => !lang.disabled && setSelectedLanguage(lang.code)}
                disabled={lang.disabled}
              >
                <View style={styles.rowLeft}>
                  <Text variant="bodyStrong">{lang.name}</Text>
                  <Text variant="bodySm" tone="muted">({lang.nativeName})</Text>
                </View>
                {isSelected && <Check size={20} color={colors.primary} strokeWidth={3} />}
              </Pressable>
            );
          })}
        </ListSection>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: layout.gutter,
  },
  rowItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 56,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  rowItemDisabled: {
    opacity: 0.5,
  },
  rowItemPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
});
