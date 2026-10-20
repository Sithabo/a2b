import React from 'react';
import { ActivityIndicator, StyleSheet, View, type ViewStyle } from 'react-native';
import { apiErrorMessage } from '@a2b/api-client';
import { Button, colors, spacing, Text } from '@a2b/ui';

export interface QueryFallbackProps {
  /** The query's error; without one, a spinner shows. */
  error?: unknown;
  onRetry?: () => void;
  /** Shown when the error has no message of its own. */
  errorMessage?: string;
  style?: ViewStyle;
}

/**
 * What a screen shows instead of its data: a spinner while it loads, or the
 * error with a retry button. Render it whenever the query has no data yet:
 *
 * ```tsx
 * if (!load.data) return <QueryFallback error={load.error} onRetry={load.refetch} />;
 * ```
 */
export function QueryFallback({ error, onRetry, errorMessage = "We couldn't load this.", style }: QueryFallbackProps) {
  return (
    <View style={[styles.container, style]}>
      {error ? (
        <>
          <Text tone="secondary" align="center">
            {apiErrorMessage(error, errorMessage)}
          </Text>
          {onRetry && <Button title="Try again" variant="secondary" size="md" onPress={onRetry} />}
        </>
      ) : (
        <ActivityIndicator color={colors.primary} size="large" accessibilityLabel="Loading" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    padding: spacing['2xl'],
  },
});
