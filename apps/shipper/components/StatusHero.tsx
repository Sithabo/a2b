import React from "react";
import { View, StyleSheet } from "react-native";
import { Check, X, Sparkle } from "lucide-react-native";

export interface StatusHeroProps {
  state: "confirmed" | "unconfirmed";
}

export const StatusHero: React.FC<StatusHeroProps> = ({ state }) => {
  const isSuccess = state === "confirmed";

  // Brand Forest Green or Red
  const coreColor = isSuccess ? "#0F3D26" : "#EF4444";
  const ripple1Color = isSuccess ? "rgba(15, 61, 38, 0.2)" : "rgba(239, 68, 68, 0.2)";
  const ripple2Color = isSuccess ? "rgba(15, 61, 38, 0.08)" : "rgba(239, 68, 68, 0.08)";

  return (
    <View style={styles.container}>
      {/* Decorative Sparkles (Gold-ish) */}
      {isSuccess && (
        <>
          <View style={[styles.sparkle, { top: "10%", left: "15%" }]}>
            <Sparkle size={20} color="#D97706" fill="#D97706" />
          </View>
          <View style={[styles.sparkle, { top: "5%", right: "20%" }]}>
            <Sparkle size={32} color="#F59E0B" fill="#F59E0B" />
          </View>
          <View style={[styles.sparkle, { bottom: "15%", left: "12%" }]}>
            <Sparkle size={24} color="#FBBF24" fill="#FBBF24" />
          </View>
          <View style={[styles.sparkle, { bottom: "25%", right: "15%" }]}>
            <Sparkle size={16} color="#D97706" fill="#D97706" />
          </View>
        </>
      )}

      {/* Ripple Rings */}
      <View style={[styles.rippleLarge, { backgroundColor: ripple2Color }]}>
        <View style={[styles.rippleMedium, { backgroundColor: ripple1Color }]}>
          <View style={[styles.coreCircle, { backgroundColor: coreColor }]}>
            {isSuccess ? (
              <Check size={64} color="#FFFFFF" strokeWidth={4} />
            ) : (
              <X size={64} color="#FFFFFF" strokeWidth={4} />
            )}
          </View>
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
  rippleLarge: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  rippleMedium: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  coreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    // Base shadow directly on core
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
});
