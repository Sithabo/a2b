import React from "react";
import {
  View,
  Text as RNText,
  TouchableOpacity,
  type TextProps,
} from "react-native";
import { Upload, CheckCircle, FileText } from "lucide-react-native";
import { cn } from "@/components/ui/Button"; // Reusing cn utility

const Text = RNText as unknown as React.ComponentType<
  TextProps & { className?: string }
>;

interface FileUploadProps {
  label: string;
  description?: string;
  onPress: () => void;
  status?: "empty" | "uploading" | "completed";
  className?: string;
}

export const FileUpload = ({
  label,
  description,
  onPress,
  status = "empty",
  className,
}: FileUploadProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={cn(
        "border-2 border-dashed bg-white p-4 rounded-xl flex-row items-center gap-4 transition-all",
        status === "completed"
          ? "border-forest bg-forest/5"
          : "border-gray-300",
        className
      )}
    >
      <View
        className={cn(
          "w-10 h-10 rounded-full items-center justify-center",
          status === "completed" ? "bg-forest" : "bg-gray-100"
        )}
      >
        {status === "completed" ? (
          <CheckCircle size={20} color="#fff" />
        ) : (
          <Upload size={20} color="#6B7280" />
        )}
      </View>

      <View className="flex-1 gap-1">
        <Text
          className={cn(
            "font-semibold",
            status === "completed" ? "text-forest" : "text-gray-900"
          )}
        >
          {label}
        </Text>
        {description && (
          <Text className="text-xs text-gray-400">{description}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};
