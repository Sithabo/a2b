import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, View } from "react-native";
import { LucideIcon } from "lucide-react-native";

interface PrimaryButtonProps {
  onPress: () => void;
  title: string;
  disabled?: boolean;
  loading?: boolean;
  icon?: LucideIcon;
  variant?: "primary" | "secondary" | "outline";
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  onPress,
  title,
  disabled = false,
  loading = false,
  icon: Icon,
  variant = "primary",
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "secondary":
        return "bg-[#D4A017]";
      case "outline":
        return "bg-transparent border-2 border-[#0F3D26]";
      default:
        return "bg-[#0F3D26]";
    }
  };

  const getTextStyles = () => {
    switch (variant) {
      case "outline":
        return "text-[#0F3D26]";
      default:
        return "text-white";
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`${getVariantStyles()} p-4 rounded-xl flex-row items-center justify-center shadow-lg active:scale-[0.98] transition-transform ${
        disabled || loading ? "opacity-50" : "opacity-100"
      }`}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" ? "#0F3D26" : "white"}
        />
      ) : (
        <>
          {Icon && (
            <View className="mr-2">
              <Icon
                color={variant === "outline" ? "#0F3D26" : "white"}
                size={20}
              />
            </View>
          )}
          <Text
            className={`${getTextStyles()} font-bold text-base uppercase tracking-widest`}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};
