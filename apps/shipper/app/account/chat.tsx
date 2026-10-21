import React from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { MessageSquareDashed } from "lucide-react-native";
import { colors, EmptyState, ScreenHeader, spacing } from "@a2b/ui";

export default function ChatScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Support Chat"
        subtitle="Need help? Let's chat"
        onBackPress={() => router.replace("/(tabs)/account")}
        onCancelPress={() => router.replace("/(tabs)/account")}
      />

      <View style={styles.content}>
        <EmptyState
          icon={MessageSquareDashed}
          title="Feature Coming Soon!"
          message={"Our live chatbot support channel is currently under active development. In the meantime, you can reach out directly via \u201CCall A2B Support\u201D."}
        />
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
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing["4xl"] * 2, // Offset balance for header height
  },
});
