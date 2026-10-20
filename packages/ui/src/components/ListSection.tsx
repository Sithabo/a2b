import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import { colors } from '../tokens/colors.ts';
import { radius, spacing } from '../tokens/layout.ts';
import { Text } from './Text.tsx';

export interface ListSectionProps {
  /** Small uppercase heading above the group. */
  title?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** A titled card of rows (settings, menus), with dividers between them. */
export function ListSection({ title, children, style }: ListSectionProps) {
  const rows = React.Children.toArray(children).filter(Boolean);
  return (
    <View style={[styles.section, style]}>
      {title && (
        <Text variant="label" tone="secondary" style={styles.title}>
          {title}
        </Text>
      )}
      <View style={styles.card}>
        {rows.map((row, i) => (
          <React.Fragment key={i}>
            {i > 0 && <View style={styles.divider} />}
            {row}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

export interface ListItemProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  onPress?: () => void;
  /** Replaces the chevron, e.g. a Switch or a Badge. */
  trailing?: React.ReactNode;
  /** danger = destructive actions like "Log out". */
  tone?: 'default' | 'danger';
  accessibilityHint?: string;
}

/** One row of a ListSection: icon, title, optional subtitle, and a chevron when it navigates. */
export function ListItem({ title, subtitle, icon: Icon, onPress, trailing, tone = 'default', accessibilityHint }: ListItemProps) {
  const fg = tone === 'danger' ? colors.danger : colors.primary;
  const content = (
    <>
      {Icon && (
        <View style={[styles.iconBox, tone === 'danger' && styles.iconBoxDanger]}>
          <Icon size={20} color={fg} />
        </View>
      )}
      <View style={styles.text}>
        <Text variant="bodyStrong" color={tone === 'danger' ? colors.danger : undefined}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="bodySm" tone="secondary">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing ?? (onPress ? <ChevronRight size={20} color={colors.textMuted} /> : null)}
    </>
  );

  if (!onPress) return <View style={styles.row}>{content}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  title: { marginLeft: spacing.xs },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  pressed: { backgroundColor: colors.surfaceMuted },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryMuted,
  },
  iconBoxDanger: { backgroundColor: colors.dangerMuted },
  text: { flex: 1, gap: 2 },
});
