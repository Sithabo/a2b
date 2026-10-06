import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { apiErrorMessage } from "@a2b/api-client";
import { Button, colors, spacing, Text } from "@a2b/ui";

/** Full-screen placeholder while a load is fetched, or if fetching failed. */
export function LoadState({ error, onRetry }: { error?: unknown; onRetry?: () => void }) {
  return (
    <View style={styles.container}>
      {error ? (
        <>
          <Text tone="secondary" align="center">
            {apiErrorMessage(error, "We couldn't load this shipment.")}
          </Text>
          {onRetry && <Button title="Try again" variant="secondary" size="md" onPress={onRetry} />}
        </>
      ) : (
        <ActivityIndicator color={colors.primary} size="large" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
    padding: spacing["2xl"],
    backgroundColor: colors.background,
  },
});
