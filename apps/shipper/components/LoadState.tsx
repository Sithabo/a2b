import React from "react";
import { StyleSheet, View } from "react-native";
import { QueryFallback } from "@a2b/features";
import { colors } from "@a2b/ui";

/** Full-screen placeholder while a shipment is fetched, or if fetching failed. */
export function LoadState({ error, onRetry }: { error?: unknown; onRetry?: () => void }) {
  return (
    <View style={styles.container}>
      <QueryFallback error={error} onRetry={onRetry} errorMessage="We couldn't load this shipment." />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
});
