import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { colors } from '../tokens/colors.ts';
import { layout, spacing } from '../tokens/layout.ts';

export interface ScreenScrollProps {
  children: React.ReactNode;
  /** Enables pull-to-refresh. */
  onRefresh?: () => void;
  refreshing?: boolean;
  /** Safe-area edges to pad; screens under a header usually only need the bottom. */
  edges?: Edge[];
  contentContainerStyle?: StyleProp<ViewStyle>;
}

/** Standard scrolling screen: safe area, gutter, vertical rhythm and optional pull-to-refresh. */
export function ScreenScroll({
  children,
  onRefresh,
  refreshing = false,
  edges = ['top'],
  contentContainerStyle,
}: ScreenScrollProps) {
  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      <ScrollView
        contentContainerStyle={[styles.content, contentContainerStyle]}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: layout.gutter, gap: spacing.lg, paddingBottom: spacing['4xl'] },
});
