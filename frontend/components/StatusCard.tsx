import { LucideIcon } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";
import { cn } from "../utils/cn";

interface StatusCardProps {
  variant: "locked" | "unlocked";
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export const StatusCard = ({
  variant,
  title,
  icon: Icon,
  children,
  className,
}: StatusCardProps) => {
  const isLocked = variant === "locked";

  return (
    <View
      className={cn(
        "rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100",
        className
      )}
    >
      {/* Header */}
      <View
        className={cn(
          "px-4 py-3 flex-row items-center gap-2",
          isLocked ? "bg-amber" : "bg-forest"
        )}
      >
        {Icon && <Icon size={20} color={isLocked ? "#fff" : "#fff"} />}
        <Text className="text-white font-bold text-lg tracking-wide">
          {title}
        </Text>
      </View>

      {/* Content */}
      <View className="p-4 bg-ivory">{children}</View>
    </View>
  );
};
