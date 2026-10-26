import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, Text } from '@a2b/ui';
import { AuthImage } from './auth_image.tsx';

export interface AvatarProps {
  /** `avatarPath` from the API (e.g. `users/12/avatar?v=…`), or null for initials. */
  path?: string | null;
  name?: string | null;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

function initialsOf(name?: string | null) {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0]?.slice(0, 2) ?? '')).toUpperCase();
}

/** A person's profile photo, or their initials until they add one. */
export function Avatar({ path, name, size = 48, style }: AvatarProps) {
  const shape = { width: size, height: size, borderRadius: size / 2 };
  if (path) {
    return (
      <AuthImage
        path={path}
        style={[shape, styles.image, style as object]}
        accessibilityLabel={name ? `Photo of ${name}` : 'Profile photo'}
      />
    );
  }
  return (
    <View style={[styles.initials, shape, style]} accessibilityLabel={name ?? undefined}>
      <Text variant="bodyStrong" color={colors.primary} style={{ fontSize: size * 0.38 }}>
        {initialsOf(name) || '·'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: { backgroundColor: colors.surfaceSunken },
  initials: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryMuted },
});
