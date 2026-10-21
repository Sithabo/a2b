import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image, type ImageContentFit, type ImageStyle } from 'expo-image';
import { colors } from '@a2b/ui';
import { useAppSession } from '../session/session_context.tsx';

export interface AuthImageProps {
  /** API path after /api/v1/, e.g. `loads/12/delivery-photo`. */
  path: string;
  style?: StyleProp<ImageStyle & ViewStyle>;
  contentFit?: ImageContentFit;
  accessibilityLabel?: string;
}

/**
 * An image served by the A2B API to signed-in users (customs scans, delivery
 * photos, ID documents). Native sends the token as a header; browsers can't
 * add headers to <img>, so on web the bytes are fetched and shown from a blob.
 */
export function AuthImage({ path, style, contentFit = 'cover', accessibilityLabel }: AuthImageProps) {
  const { apiUrl, useSession } = useAppSession();
  const token = useSession((s) => s.token);
  const uri = `${apiUrl}/api/v1/${path}`;
  const [blobUri, setBlobUri] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    let objectUrl: string | null = null;
    let cancelled = false;
    fetch(uri, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((response) => (response.ok ? response.blob() : null))
      .then((blob) => {
        if (!blob || cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setBlobUri(objectUrl);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [uri, token]);

  const source =
    Platform.OS === 'web'
      ? blobUri && { uri: blobUri }
      : { uri, headers: token ? { Authorization: `Bearer ${token}` } : undefined };
  if (!source) return <View style={[styles.placeholder, style]} />;
  return <Image source={source} style={style} contentFit={contentFit} accessibilityLabel={accessibilityLabel} />;
}

const styles = StyleSheet.create({
  placeholder: { backgroundColor: colors.surfaceSunken },
});
