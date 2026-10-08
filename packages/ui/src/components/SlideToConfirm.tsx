import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { ChevronsRight } from 'lucide-react-native';
import { colors, palette } from '../tokens/colors.ts';
import { radius, spacing } from '../tokens/layout.ts';
import { Text } from './Text.tsx';

const HEIGHT = 64;
const KNOB = HEIGHT - 8;

export interface SlideToConfirmProps {
  label: string;
  onConfirm: () => void;
  loading?: boolean;
  disabled?: boolean;
  /** amber for escrow / caution steps. */
  tone?: 'primary' | 'accent';
}

/**
 * A deliberate swipe for irreversible field actions (cargo loaded, arrived), so a
 * pocket tap or a bump can't trigger them. Screen readers get a normal button.
 */
export function SlideToConfirm({ label, onConfirm, loading = false, disabled = false, tone = 'primary' }: SlideToConfirmProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const x = useSharedValue(0);
  const max = Math.max(0, trackWidth - KNOB - 8);
  const fill = tone === 'accent' ? colors.accent : colors.primary;
  const inactive = disabled || loading;

  const pan = Gesture.Pan()
    .enabled(!inactive)
    .onChange((e) => {
      x.value = Math.min(max, Math.max(0, x.value + e.changeX));
    })
    .onEnd(() => {
      if (x.value > max * 0.85) {
        x.value = withSpring(max);
        runOnJS(onConfirm)();
      } else {
        x.value = withSpring(0);
      }
    });

  // Snap back once the action finishes (or fails) so the slider can be used again.
  React.useEffect(() => {
    if (!loading) x.value = withSpring(0);
  }, [loading, x]);

  const knobStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const trailStyle = useAnimatedStyle(() => ({ width: x.value + KNOB + 4 }));

  return (
    <View
      accessible
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      accessibilityActions={[{ name: 'activate' }]}
      onAccessibilityAction={() => !inactive && onConfirm()}
      onLayout={(e: LayoutChangeEvent) => setTrackWidth(e.nativeEvent.layout.width)}
      style={[styles.track, { borderColor: fill, opacity: disabled ? 0.45 : 1 }]}
    >
      <Animated.View style={[styles.trail, { backgroundColor: fill }, trailStyle]} />
      <Text variant="button" color={fill} style={styles.label}>
        {label}
      </Text>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.knob, { backgroundColor: fill }, knobStyle]}>
          {loading ? <ActivityIndicator color={colors.onPrimary} /> : <ChevronsRight color={colors.onPrimary} size={28} />}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: HEIGHT,
    borderRadius: radius.pill,
    borderWidth: 2,
    backgroundColor: palette.white,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  trail: { position: 'absolute', left: 0, top: 0, bottom: 0, opacity: 0.15, borderRadius: radius.pill },
  label: { textAlign: 'center', paddingHorizontal: HEIGHT + spacing.sm },
  knob: {
    position: 'absolute',
    left: 2,
    width: KNOB,
    height: KNOB,
    borderRadius: KNOB / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
