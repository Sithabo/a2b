import React from "react";
import { View, ViewProps } from "react-native";

interface CardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <View
      className={`bg-white p-5 rounded-2xl shadow-sm border border-gray-100 ${className}`}
      {...props}
    >
      {children}
    </View>
  );
};
