import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PostLoadPlaceholder() {
  // This screen should never be seen because the layout button intercepts navigation,
  // but it's required by React Navigation to exist to satisfy the `post-load-placeholder` tab name.
  return null;
}
