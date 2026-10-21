import React from "react";
import { View, StyleSheet } from "react-native";
import { Check, X, Sparkle } from "lucide-react-native";
import { colors, palette, radius } from "@a2b/ui";

export interface StatusHeroProps {
  state: "confirmed" | "unconfirmed";
}

export const StatusHero: React.FC<StatusHeroProps> = ({ state }) => {
  const isSuccess = state === "confirmed";

  // Brand Forest Green or Red. The ripples are translucent washes of the same colour.
  const coreColor = isSuccess ? colors.primary : colors.danger;

  return (
    <View style={styles.container}>
      {/* Decorative Sparkles (Gold-ish) */}
      {isSuccess && (
        <>
          <View style={[styles.sparkle, { top: "10%", left: "15%" }]}>
            <Sparkle size={20} color={colors.accent} fill={colors.accent} />
          </View>
          <View style={[styles.sparkle, { top: "5%", right: "20%" }]}>
            <Sparkle size={32} color={palette.amber[500]} fill={palette.amber[500]} />
          </View>
          <View style={[styles.sparkle, { bottom: "15%", left: "12%" }]}>
            <Sparkle size={24} color={palette.amber[400]} fill={palette.amber[400]} />
          </View>
          <View style={[styles.sparkle, { bottom: "25%", right: "15%" }]}>
            <Sparkle size={16} color={colors.accent} fill={colors.accent} />
          </View>
        </>
      )}

      {/* Ripple Rings */}
      <View style={styles.rings}>
        <View style={[styles.ring, styles.rippleLarge, { backgroundColor: coreColor }]} />
        <View style={[styles.ring, styles.rippleMedium, { backgroundColor: coreColor }]} />
        <View style={[styles.coreCircle, { backgroundColor: coreColor }]}>
          {isSuccess ? (
            <Check size={64} color={colors.onPrimary} strokeWidth={4} />
          ) : (
            <X size={64} color={colors.onPrimary} strokeWidth={4} />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 240, // Sufficient space to fit ripples and absolute sparkles
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  sparkle: {
    position: "absolute",
  },
  rings: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  ring: {
    position: "absolute",
    borderRadius: radius.pill,
  },
  rippleLarge: {
    width: 200,
    height: 200,
    opacity: 0.08,
  },
  rippleMedium: {
    width: 160,
    height: 160,
    opacity: 0.2,
  },
  coreCircle: {
    width: 120,
    height: 120,
    borderRadius: radius.pill,
    justifyContent: "center",
    alignItems: "center",
  },
});
