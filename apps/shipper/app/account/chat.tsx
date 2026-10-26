import React from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Mail, MessageSquareDashed } from "lucide-react-native";
import { emailSupport } from "@a2b/features";
import { Button, colors, EmptyState, ScreenHeader, spacing } from "@a2b/ui";
import { supportContext } from "@/lib/support";
import { useSession } from "@/lib/session";
import { useMarket } from "@/store/useMarket";

export default function ChatScreen() {
  const router = useRouter();
  const user = useSession((s) => s.user);
  const market = useMarket();

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
          message={"Our live chatbot support channel is currently under active development. In the meantime, you can email A2B Support and we\u2019ll get back to you."}
          action={
            <Button
              title="Email A2B Support"
              icon={Mail}
              onPress={() => emailSupport({ subject: "Help with A2B", context: supportContext(user, market) })}
            />
          }
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
