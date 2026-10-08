import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, X } from 'lucide-react-native';
import { layout, spacing } from '../tokens/layout.ts';
import { IconButton } from './IconButton.tsx';
import { Text } from './Text.tsx';

export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBackPress?: () => void;
  onCancelPress?: () => void;
  rightElement?: React.ReactNode;
}

export function ScreenHeader({ title, subtitle, onBackPress, onCancelPress, rightElement }: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} />
      <View style={styles.row}>
        {onBackPress ? (
          <IconButton icon={ArrowLeft} onPress={onBackPress} accessibilityLabel="Go back" />
        ) : (
          <View style={styles.placeholder} />
        )}

        <View style={styles.titleContainer}>
          <Text variant="h2" tone="primary" align="center" numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text variant="caption" tone="muted" align="center" style={styles.subtitle}>
              {subtitle}
            </Text>
          )}
        </View>

        {rightElement ??
          (onCancelPress ? (
            <IconButton icon={X} onPress={onCancelPress} accessibilityLabel="Cancel" />
          ) : (
            <View style={styles.placeholder} />
          ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: layout.gutter,
    paddingBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Platform.OS === 'android' ? 10 : 5,
    height: 52,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: spacing.lg,
  },
  subtitle: { marginTop: spacing.xxs },
  placeholder: { width: 40 },
});
