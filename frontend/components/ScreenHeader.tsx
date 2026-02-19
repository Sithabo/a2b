import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { useRouter } from "expo-router";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
}) => {
  const router = useRouter();

  return (
    <View className="bg-[#0F3D26] pt-14 pb-8 px-6 rounded-b-[32px] shadow-xl relative z-10">
      <View className="flex-row items-center gap-4">
        {showBackButton && (
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 -ml-2 rounded-full bg-white/10 active:scale-95 transition-transform"
          >
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
        )}
        <View className="flex-1">
          <Text className="text-white text-2xl font-bold tracking-tight">
            {title}
          </Text>
          {subtitle && (
            <Text className="text-green-100 text-sm mt-1 opacity-90 font-medium">
              {subtitle}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};
