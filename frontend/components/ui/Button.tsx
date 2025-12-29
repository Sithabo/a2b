import React from "react";
import {
  TouchableOpacity,
  Text as RNText,
  ActivityIndicator as RNActivityIndicator,
  View as RNView,
} from "react-native";

// Fix for React 19 type mismatch
const Text = RNText as any;
const ActivityIndicator = RNActivityIndicator as any;
const View = RNView as any;
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "default" | "lg" | "sm";
  className?: string;
  textClassName?: string;
  isLoading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconRight?: boolean;
  style?: any;
}

export const Button = ({
  onPress,
  title,
  variant = "primary",
  size = "default",
  className,
  textClassName,
  isLoading = false,
  disabled = false,
  icon,
  iconRight = false,
  style,
}: ButtonProps) => {
  const baseStyles =
    "flex-row items-center justify-center rounded-xl active:opacity-80";

  const variants = {
    primary: "bg-[#C4E84A] border border-[#C4E84A]", // Lime Green
    secondary: "bg-amber border border-amber",
    outline: "bg-transparent border border-gray-300",
    ghost: "bg-transparent border-transparent",
  };

  const sizes = {
    default: "py-3.5 px-6",
    lg: "py-4 px-8",
    sm: "py-2 px-4",
  };

  const textBaseStyles = "font-bold text-center";

  const textVariants = {
    primary: "text-gray-900", // Black text for Lime button
    secondary: "text-white",
    outline: "text-gray-900",
    ghost: "text-gray-600",
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        disabled && "opacity-50",
        className
      )}
      style={style}
    >
      {isLoading ? (
        <ActivityIndicator
          color={
            variant === "outline" || variant === "ghost" ? "#0F3D26" : "#fff"
          }
        />
      ) : (
        <>
          {icon && !iconRight && <View className="mr-2">{icon}</View>}
          <Text
            className={cn(textBaseStyles, textVariants[variant], textClassName)}
          >
            {title}
          </Text>
          {icon && iconRight && <View className="ml-2">{icon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
};
