import { View, type ViewProps } from "react-native";
import { useThemeColor } from "@/hooks/use-theme-color";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  variant?: "default" | "card";
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  variant = "default",
  ...otherProps
}: ThemedViewProps) {
  // 'default' uses 'background', 'card' uses 'card'
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    variant === "card" ? "card" : "background"
  );

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
