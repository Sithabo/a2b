import React from "react";
import { View, Text } from "react-native";
import { ShieldCheck } from "lucide-react-native";

interface TrustBadgeProps {
  message: string;
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({ message }) => {
  return (
    <View className="bg-[#D4A017] p-4 rounded-2xl flex-row items-center shadow-md relative overflow-hidden">
      {/* Subtle Pattern Overlay Effect */}
      <View
        className="absolute inset-0 opacity-10"
        style={
          {
            backgroundColor: "transparent",
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
            backgroundSize: "8px 8px",
          } as any
        }
      />

      <View className="bg-white/20 p-2 rounded-full mr-3">
        <ShieldCheck color="white" size={24} />
      </View>

      <View className="flex-1">
        <Text className="text-white font-bold text-sm tracking-tight">
          Trust & Security
        </Text>
        <Text className="text-white/90 text-xs font-medium mt-0.5 leading-tight">
          {message}
        </Text>
      </View>
    </View>
  );
};
