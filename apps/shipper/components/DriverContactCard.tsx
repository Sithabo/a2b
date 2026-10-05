import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  GestureResponderEvent,
} from "react-native";
import { Image } from "expo-image";
import { Phone, Mail, MailIcon, PhoneIcon } from "lucide-react-native";
import { Colors } from "@/constants/theme";

interface DriverContactCardProps {
  driverName: string;
  role?: string;
  avatarSource?: any;
  onPressCard: () => void;
  onCallPress: () => void;
  onMessagePress: () => void;
}

export const DriverContactCard: React.FC<DriverContactCardProps> = ({
  driverName,
  role = "Driver",
  avatarSource = require("@/assets/images/driver_avatar.png"),
  onPressCard,
  onCallPress,
  onMessagePress,
}) => {
  const handleCall = (e: GestureResponderEvent) => {
    e.stopPropagation();
    onCallPress();
  };

  const handleMessage = (e: GestureResponderEvent) => {
    e.stopPropagation();
    onMessagePress();
  };

  return (
    <TouchableOpacity
      style={styles.driverCard}
      activeOpacity={0.9}
      onPress={onPressCard}
    >
      <View style={styles.driverInfoContainer}>
        <Image
          source={avatarSource}
          style={styles.driverAvatar}
          contentFit="cover"
        />
        <View style={styles.driverTextContainer}>
          <Text style={styles.driverNameText}>{driverName}</Text>
          <Text style={styles.driverRoleText}>{role}</Text>
        </View>
      </View>
      <View style={styles.driverActionsContainer}>
        <TouchableOpacity
          style={styles.driverActionButton}
          activeOpacity={0.7}
          onPress={handleCall}
        >
          <PhoneIcon />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.driverActionButton}
          activeOpacity={0.7}
          onPress={handleMessage}
        >
          <MailIcon />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  driverCard: {
    backgroundColor: "#0F3D26", // Forest Green App Theme
    borderRadius: 35,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    paddingHorizontal: 16,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.15,
    // shadowRadius: 8,
    // elevation: 3,
    width: "100%",
  },
  driverInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  driverAvatar: {
    width: 55,
    height: 55,
    borderRadius: 99,
    backgroundColor: "#1F4E35",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  driverTextContainer: {
    marginLeft: 12,
    // justifyContent: "center",
    flex: 1,
  },
  driverNameText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  driverRoleText: {
    color: "#A7F3D0", // Soft Mint Green for premium secondary text
    fontSize: 12,
    marginTop: 1,
  },
  driverActionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  driverActionButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
});
