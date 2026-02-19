import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { useRouter } from "expo-router";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  rightElement?: React.ReactNode;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  rightElement,
}) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {showBackButton && (
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
        )}
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
        {rightElement && (
          <View style={styles.rightElement}>{rightElement}</View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0F3D26", // Deep Forest Green
    paddingTop: 56, // pt-14
    paddingBottom: 32, // pb-8
    paddingHorizontal: 24, // px-6
    borderBottomLeftRadius: 32, // rounded-b-[32px]
    borderBottomRightRadius: 32,
    shadowColor: "#000", // shadow-xl
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 5,
    position: "relative",
    zIndex: 10,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16, // gap-4
  },
  backButton: {
    padding: 8,
    marginLeft: -8, // -ml-2
    borderRadius: 9999,
    backgroundColor: "rgba(255, 255, 255, 0.1)", // bg-white/10
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: "white",
    fontSize: 24, // text-2xl
    fontWeight: "bold",
    letterSpacing: -0.5, // tracking-tight
  },
  subtitle: {
    color: "#D1FAE5", // text-green-100 (approx)
    fontSize: 14, // text-sm
    marginTop: 4,
    opacity: 0.9,
    fontWeight: "500",
  },
  rightElement: {
    // Container for right element if needed
  },
});
